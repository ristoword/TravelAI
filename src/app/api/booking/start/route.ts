import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import {
  getCarRentalProvider,
  getFlightProvider,
  getHotelProvider,
  isStripeConfigured,
} from "@/lib/providers";
import { bookingStartSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

/**
 * Starts booking only as far as provider + Stripe allow.
 * Never creates fake bookings. Requires explicit user confirmation.
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
          "Prenotazione non disponibile. Provider non configurato. Nessuna prenotazione simulata.",
        booking: null,
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
          "Pagamento non disponibile. Stripe non configurato (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY). Nessuna prenotazione simulata.",
        booking: null,
      },
      200,
      requestId,
    );
  }

  const bookResult = await provider.book({
    externalId: parsed.data.externalId,
    kind: parsed.data.kind,
    confirmedByUser: true,
  });

  if (!bookResult.ok) {
    return apiSuccess(
      {
        status: bookResult.code,
        message: bookResult.message,
        booking: null,
      },
      200,
      requestId,
    );
  }

  return apiSuccess(
    { status: "ok", booking: bookResult.data },
    200,
    requestId,
  );
}
