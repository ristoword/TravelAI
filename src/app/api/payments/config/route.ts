import { apiSuccess, createRequestId } from "@/lib/api";
import {
  getStripePublishableKey,
  isStripeConfigured,
  isStripeWebhookConfigured,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Public Stripe config for the browser (publishable key only). */
export async function GET() {
  const requestId = createRequestId();
  const publishableKey = getStripePublishableKey() ?? null;
  return apiSuccess(
    {
      status: isStripeConfigured() ? "configured" : "not_configured",
      publishableKey,
      webhook: isStripeWebhookConfigured() ? "configured" : "not_configured",
      message: isStripeConfigured()
        ? "Stripe publishable key disponibile per il checkout browser."
        : "Stripe non completo: servono STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY.",
    },
    200,
    requestId,
  );
}
