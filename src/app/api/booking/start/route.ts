import { auth } from "@/auth";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import {
  getCarRentalProvider,
  getFlightProvider,
  getHotelProvider,
} from "@/lib/providers";
import { createPaymentIntent, isStripeConfigured } from "@/lib/stripe";
import { bookingStartSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

/**
 * Starts booking only as far as provider + Stripe allow.
 * Never creates fake bookings or invents payment success.
 * Requires explicit user confirmation.
 */
export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = bookingStartSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Conferma esplicita e dati prenotazione richiesti.",
      400,
      requestId,
    );
  }

  if (!parsed.data.confirmedByUser) {
    return apiError(
      "confirmation_required",
      "Conferma esplicita necessaria prima di booking/pagamento.",
      400,
      requestId,
    );
  }

  const provider =
    parsed.data.kind === "flight"
      ? getFlightProvider()
      : parsed.data.kind === "hotel"
        ? getHotelProvider()
        : getCarRentalProvider();

  if (!provider.isConfigured()) {
    return apiSuccess(
      {
        status: "provider_not_configured",
        message:
          "Prenotazione non disponibile. Provider viaggio non configurato (Amadeus sandbox). Nessuna prenotazione simulata.",
        booking: null,
        payment: null,
      },
      200,
      requestId,
    );
  }

  if (!isStripeConfigured()) {
    return apiSuccess(
      {
        status: "stripe_not_configured",
        message:
          "Pagamento non disponibile. Stripe non configurato (STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY). Nessun pagamento simulato.",
        booking: null,
        payment: null,
      },
      200,
      requestId,
    );
  }

  // Price re-check before payment when amount provided.
  if (
    typeof parsed.data.expectedAmount === "number" &&
    parsed.data.currency
  ) {
    const verify = await provider.verifyPrice({
      kind: parsed.data.kind,
      externalId: parsed.data.externalId,
      expectedAmount: parsed.data.expectedAmount,
      currency: parsed.data.currency,
    });
    if (!verify.ok) {
      return apiSuccess(
        {
          status: verify.code,
          message: verify.message,
          booking: null,
          payment: null,
        },
        200,
        requestId,
      );
    }
    if (!verify.data.matched) {
      return apiSuccess(
        {
          status: "price_changed",
          message: verify.data.message,
          verification: verify.data,
          booking: null,
          payment: null,
        },
        200,
        requestId,
      );
    }
  }

  const bookResult = await provider.book({
    externalId: parsed.data.externalId,
    kind: parsed.data.kind,
    confirmedByUser: true,
  });

  if (!bookResult.ok) {
    // Provider booking may be unavailable even with search configured.
    // Still allow PaymentIntent only when amount is known and book is not required?
    // Spec: don't simulate booking success. Propagate booking error.
    // If amount is provided, we can still create a pending payment for the offer
    // only when book succeeded OR when book is booking_not_available but user
    // confirmed payment hold — safer: only create PI when book ok OR when
    // expectedAmount is set and book code is booking_not_available (provider
    // search exists but order API gated).
    if (
      bookResult.code !== "booking_not_available" ||
      typeof parsed.data.expectedAmount !== "number" ||
      !parsed.data.currency
    ) {
      return apiSuccess(
        {
          status: bookResult.code,
          message: bookResult.message,
          booking: null,
          payment: null,
        },
        200,
        requestId,
      );
    }
  }

  if (
    typeof parsed.data.expectedAmount !== "number" ||
    !parsed.data.currency
  ) {
    return apiSuccess(
      {
        status: bookResult.ok ? "booking_pending_payment_amount" : bookResult.code,
        message: bookResult.ok
          ? "Prenotazione provider accettata in bozza, ma manca importo per PaymentIntent Stripe."
          : bookResult.message,
        booking: bookResult.ok ? bookResult.data : null,
        payment: null,
      },
      200,
      requestId,
    );
  }

  const amountCents = Math.round(parsed.data.expectedAmount * 100);
  const session = await auth();
  const intent = await createPaymentIntent({
    amountCents,
    currency: parsed.data.currency,
    metadata: {
      kind: parsed.data.kind,
      externalId: parsed.data.externalId,
      requestId,
      userId: session?.user?.id ?? "",
    },
    receiptEmail: session?.user?.email ?? undefined,
  });

  if (!intent.ok) {
    return apiSuccess(
      {
        status: intent.code,
        message: intent.message,
        booking: bookResult.ok ? bookResult.data : null,
        payment: null,
      },
      200,
      requestId,
    );
  }

  // Persist PENDING payment — never SUCCEEDED without webhook.
  let paymentRecordId: string | null = null;
  if (isDatabaseConfigured() && session?.user?.id) {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id,
            status: "PAYMENT_PENDING",
            totalAmount: parsed.data.expectedAmount,
            currency: parsed.data.currency.toUpperCase(),
          },
        });
        const payment = await prisma.payment.create({
          data: {
            userId: session.user.id,
            orderId: order.id,
            status: "PENDING",
            amount: parsed.data.expectedAmount,
            currency: parsed.data.currency.toUpperCase(),
            stripePaymentIntentId: intent.paymentIntentId,
          },
        });
        paymentRecordId = payment.id;
      } catch {
        // PaymentIntent exists on Stripe; local persist failure is reported.
        return apiSuccess(
          {
            status: "payment_persist_failed",
            message:
              "PaymentIntent creato su Stripe ma persistenza locale fallita. Stato non impostato a succeeded.",
            booking: bookResult.ok ? bookResult.data : null,
            payment: {
              paymentIntentId: intent.paymentIntentId,
              clientSecret: intent.clientSecret,
              publishableKey: intent.publishableKey,
              status: intent.status,
            },
          },
          200,
          requestId,
        );
      }
    }
  }

  return apiSuccess(
    {
      status: "payment_pending",
      message:
        "PaymentIntent creato (stato pending). Completa il pagamento nel browser. Nessun pagamento marked succeeded senza webhook Stripe.",
      booking: bookResult.ok ? bookResult.data : null,
      payment: {
        id: paymentRecordId,
        paymentIntentId: intent.paymentIntentId,
        clientSecret: intent.clientSecret,
        publishableKey: intent.publishableKey,
        status: intent.status,
      },
    },
    200,
    requestId,
  );
}
