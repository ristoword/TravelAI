import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function getStripePublishableKey(): string | undefined {
  return process.env.STRIPE_PUBLISHABLE_KEY?.trim() || undefined;
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

/** Checkout browser requires secret + publishable. Webhook secret is separate. */
export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripePublishableKey());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(getStripeWebhookSecret());
}

export function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export type CreatePaymentIntentInput = {
  amountCents: number;
  currency: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
};

export type CreatePaymentIntentResult =
  | {
      ok: true;
      paymentIntentId: string;
      clientSecret: string;
      status: string;
      publishableKey: string;
    }
  | { ok: false; code: string; message: string };

/**
 * Creates a real Stripe PaymentIntent. Never marks payment as succeeded locally.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<CreatePaymentIntentResult> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      code: "stripe_not_configured",
      message:
        "Pagamento non disponibile. Stripe non configurato (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY). Nessun pagamento simulato.",
    };
  }

  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    return {
      ok: false,
      code: "invalid_request",
      message: "Importo non valido per PaymentIntent (minimo 50 centesimi).",
    };
  }

  const stripe = getStripe();
  const publishableKey = getStripePublishableKey();
  if (!stripe || !publishableKey) {
    return {
      ok: false,
      code: "stripe_not_configured",
      message: "Cliente Stripe non disponibile.",
    };
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: input.metadata,
      receipt_email: input.receiptEmail,
    });

    if (!intent.client_secret) {
      return {
        ok: false,
        code: "stripe_error",
        message: "Stripe non ha restituito client_secret. Nessun pagamento inventato.",
      };
    }

    return {
      ok: true,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status,
      publishableKey,
    };
  } catch {
    return {
      ok: false,
      code: "stripe_error",
      message:
        "Non siamo riusciti a creare il PaymentIntent Stripe in questo momento. Nessun pagamento simulato.",
    };
  }
}

export function constructStripeWebhookEvent(
  rawBody: string | Buffer,
  signature: string | null,
):
  | { ok: true; event: Stripe.Event }
  | { ok: false; code: string; message: string } {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    return {
      ok: false,
      code: "stripe_webhook_not_configured",
      message: "STRIPE_WEBHOOK_SECRET non configurato. Firma non verificabile.",
    };
  }
  if (!signature) {
    return {
      ok: false,
      code: "missing_signature",
      message: "Header Stripe-Signature mancante.",
    };
  }
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      code: "stripe_not_configured",
      message: "STRIPE_SECRET_KEY assente: impossibile verificare il webhook.",
    };
  }
  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    return { ok: true, event };
  } catch {
    return {
      ok: false,
      code: "invalid_signature",
      message: "Firma webhook Stripe non valida.",
    };
  }
}
