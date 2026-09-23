import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getCarRentalProvider } from "@/lib/providers";
import { carSearchSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = carSearchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Parametri di ricerca auto non validi.",
      400,
      requestId,
    );
  }

  const provider = getCarRentalProvider();
  if (!provider.isConfigured()) {
    return apiSuccess(
      {
        status: "provider_not_configured",
        message:
          "Servizio non disponibile. Provider auto non configurato (CAR_PROVIDER_API_KEY, CAR_PROVIDER_BASE_URL).",
        offers: [] as const,
        meta: {
          pickupLocation: parsed.data.pickupLocation,
          pickupAt: parsed.data.pickupAt,
          dropoffAt: parsed.data.dropoffAt,
        },
      },
      200,
      requestId,
    );
  }

  const result = await provider.search({
    ...parsed.data,
    dropoffLocation: parsed.data.dropoffLocation ?? undefined,
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
        pickupLocation: parsed.data.pickupLocation,
        count: result.data.length,
      },
    },
    200,
    requestId,
  );
}
