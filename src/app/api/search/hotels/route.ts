import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getHotelProvider } from "@/lib/providers";
import { hotelSearchSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = hotelSearchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Parametri di ricerca hotel non validi.",
      400,
      requestId,
    );
  }

  const provider = getHotelProvider();
  if (!provider.isConfigured()) {
    return apiSuccess(
      {
        status: "provider_not_configured",
        message:
          "Servizio non disponibile. Provider hotel non configurato (AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET).",
        offers: [] as const,
        meta: {
          destination: parsed.data.destination,
          checkIn: parsed.data.checkIn,
          checkOut: parsed.data.checkOut,
        },
      },
      200,
      requestId,
    );
  }

  const result = await provider.search(parsed.data);
  if (!result.ok) {
    return apiSuccess(
      {
        status: result.code,
        message:
          result.code === "provider_not_configured"
            ? result.message
            : "Non siamo riusciti a recuperare i risultati in questo momento.",
        offers: [] as const,
        retryable: result.code !== "provider_not_configured",
      },
      200,
      requestId,
    );
  }

  return apiSuccess(
    {
      status: "ok",
      offers: result.data,
      meta: {
        destination: parsed.data.destination,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
        count: result.data.length,
      },
    },
    200,
    requestId,
  );
}
