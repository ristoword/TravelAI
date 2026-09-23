import { describe, expect, it, afterEach, vi } from "vitest";
import {
  isStripeConfigured,
  isStripeWebhookConfigured,
  createPaymentIntent,
  constructStripeWebhookEvent,
} from "@/lib/stripe";

const STRIPE_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

function clearStripeEnv() {
  for (const key of STRIPE_KEYS) delete process.env[key];
}

afterEach(() => {
  clearStripeEnv();
  vi.restoreAllMocks();
});

describe("Stripe configuration gates", () => {
  it("is not configured without publishable key even if secret exists", () => {
    clearStripeEnv();
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder_not_used_for_network";
    expect(isStripeConfigured()).toBe(false);
  });

  it("is configured only with secret and publishable", () => {
    clearStripeEnv();
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
    process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_placeholder";
    expect(isStripeConfigured()).toBe(true);
  });

  it("createPaymentIntent does not invent succeeded payment when not configured", async () => {
    clearStripeEnv();
    const result = await createPaymentIntent({
      amountCents: 1000,
      currency: "eur",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("stripe_not_configured");
  });

  it("webhook rejects missing signature when secret configured", () => {
    clearStripeEnv();
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_placeholder";
    expect(isStripeWebhookConfigured()).toBe(true);
    const verified = constructStripeWebhookEvent("{}", null);
    expect(verified.ok).toBe(false);
    if (!verified.ok) expect(verified.code).toBe("missing_signature");
  });
});
