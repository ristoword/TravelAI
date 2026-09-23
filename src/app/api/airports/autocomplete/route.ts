import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getAirportAutocompleteProvider } from "@/lib/providers";
import { airportQuerySchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = createRequestId();
  const { searchParams } = new URL(request.url);
  const parsed = airportQuerySchema.safeParse({ q: searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Query aeroporto non valida.",
      400,
      requestId,
    );
  }

  const provider = getAirportAutocompleteProvider();
  const result = await provider.suggest(parsed.data.q);
  if (!result.ok) {
    return apiSuccess(
      {
        status: result.code,
        message:
          result.code === "unavailable" || result.code === "provider_error"
            ? "Autocomplete aeroporti: servizio non disponibile. Digita il codice IATA manualmente."
            : result.message,
        suggestions: [] as const,
      },
      200,
      requestId,
    );
  }

  return apiSuccess(
    { status: "ok", suggestions: result.data },
    200,
    requestId,
  );
}
