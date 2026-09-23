import { apiError, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { constructStripeWebhookEvent } from "@/lib/stripe";
import type { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe webhook: verifies signature when STRIPE_WEBHOOK_SECRET is set.
 * Updates Payment/Order status. Never stores card numbers.
 * Never invents a succeeded payment without a verified Stripe event.
 */
export async function POST(request: Request) {
  const requestId = createRequestId();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  const verified = constructStripeWebhookEvent(rawBody, signature);
  if (!verified.ok) {
    return apiError(verified.code, verified.message, 400, requestId);
  }

  const event = verified.event;

  if (!isDatabaseConfigured()) {
    // Signature verified; acknowledge without DB persistence.
    return Response.json(
      {
        received: true,
        persisted: false,
        reason: "database_not_configured",
        type: event.type,
        requestId,
      },
      { status: 200, headers: { "x-request-id": requestId } },
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return apiError("database_error", "Database non disponibile.", 503, requestId);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          amount?: number;
          currency?: string;
        };
        await updatePaymentByIntent(prisma, pi.id, "SUCCEEDED", "PAID");
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string };
        await updatePaymentByIntent(prisma, pi.id, "FAILED", "FAILED");
        break;
      }
      case "payment_intent.canceled": {
        const pi = event.data.object as { id: string };
        await updatePaymentByIntent(prisma, pi.id, "CANCELLED", "CANCELLED");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as {
          payment_intent?: string | { id?: string } | null;
        };
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (intentId) {
          await updatePaymentByIntent(prisma, intentId, "REFUNDED", "REFUNDED");
        }
        break;
      }
      default:
        // Acknowledge unhandled events without inventing state changes.
        break;
    }
  } catch {
    return apiError(
      "webhook_processing_error",
      "Errore nell'elaborazione webhook Stripe.",
      500,
      requestId,
    );
  }

  return Response.json(
    { received: true, type: event.type, requestId },
    { status: 200, headers: { "x-request-id": requestId } },
  );
}

async function updatePaymentByIntent(
  prisma: NonNullable<ReturnType<typeof getPrisma>>,
  paymentIntentId: string,
  paymentStatus: PaymentStatus,
  orderStatus: OrderStatus,
) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (!payment) {
    // No local row yet — do not invent payments.
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: paymentStatus },
  });

  if (payment.orderId) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    });
  }
}
