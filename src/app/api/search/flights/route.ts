import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getFlightProvider } from "@/lib/providers";
import { flightSearchSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = flightSearchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Parametri di ricerca voli non validi.",
      400,
      requestId,
    );
  }

  const provider = getFlightProvider();
  if (!provider.isConfigured()) {
    return apiSuccess(
      {
        status: "provider_not_configured",
        message:
          "Servizio non disponibile. Provider voli non configurato (FLIGHT_PROVIDER_API_KEY, FLIGHT_PROVIDER_BASE_URL).",
        offers: [] as const,
        meta: {
          origin: parsed.data.origin,
          destination: parsed.data.destination,
          departDate: parsed.data.departDate,
          returnDate: parsed.data.returnDate ?? null,
        },
      },
      200,
      requestId,
    );
  }

  const result = await provider.search({
    ...parsed.data,
    returnDate: parsed.data.returnDate ?? undefined,
  });
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
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        departDate: parsed.data.departDate,
        returnDate: parsed.data.returnDate ?? null,
        count: result.data.length,
      },
    },
    200,
    requestId,
  );
}
