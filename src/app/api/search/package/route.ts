import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getFlightProvider, getHotelProvider } from "@/lib/providers";
import { packageSearchSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = packageSearchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Parametri di ricerca volo+hotel non validi.",
      400,
      requestId,
    );
  }

  const flightProvider = getFlightProvider();
  const hotelProvider = getHotelProvider();

  const flightConfigured = flightProvider.isConfigured();
  const hotelConfigured = hotelProvider.isConfigured();

  const flightResult = flightConfigured
    ? await flightProvider.search({
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        departDate: parsed.data.departDate,
        returnDate: parsed.data.returnDate,
        adults: parsed.data.adults,
        cabinClass: parsed.data.cabinClass,
        tripType: "roundtrip",
      })
    : null;

  const hotelResult = hotelConfigured
    ? await hotelProvider.search({
        destination: parsed.data.destination,
        checkIn: parsed.data.departDate,
        checkOut: parsed.data.returnDate,
        adults: parsed.data.adults,
        rooms: parsed.data.rooms,
        preferences: parsed.data.hotelPreferences,
      })
    : null;

  const flightOffers =
    flightResult && flightResult.ok ? flightResult.data : ([] as const);
  const hotelOffers =
    hotelResult && hotelResult.ok ? hotelResult.data : ([] as const);

  const selectedFlight = flightOffers[0];
  const selectedHotel = hotelOffers[0];

  let total: { amount: number; currency: string } | null = null;
  if (selectedFlight?.price && selectedHotel?.price) {
    if (selectedFlight.price.currency === selectedHotel.price.currency) {
      total = {
        amount: selectedFlight.price.amount + selectedHotel.price.amount,
        currency: selectedFlight.price.currency,
      };
    }
  }

  return apiSuccess(
    {
      status:
        !flightConfigured && !hotelConfigured
          ? "provider_not_configured"
          : "ok",
      flight: {
        configured: flightConfigured,
        status: !flightConfigured
          ? "provider_not_configured"
          : flightResult && !flightResult.ok
            ? flightResult.code
            : "ok",
        message: !flightConfigured
          ? "Provider voli non configurato."
          : flightResult && !flightResult.ok
            ? flightResult.message
            : undefined,
        offers: flightOffers,
        selected: selectedFlight ?? null,
      },
      hotel: {
        configured: hotelConfigured,
        status: !hotelConfigured
          ? "provider_not_configured"
          : hotelResult && !hotelResult.ok
            ? hotelResult.code
            : "ok",
        message: !hotelConfigured
          ? "Provider hotel non configurato."
          : hotelResult && !hotelResult.ok
            ? hotelResult.message
            : undefined,
        offers: hotelOffers,
        selected: selectedHotel ?? null,
      },
      total,
      totalNote: total
        ? "Totale = somma dei prezzi provider selezionati."
        : "Il totale viene mostrato solo se entrambi i prezzi arrivano dal provider con la stessa valuta.",
      meta: {
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        departDate: parsed.data.departDate,
        returnDate: parsed.data.returnDate,
      },
    },
    200,
    requestId,
  );
}
