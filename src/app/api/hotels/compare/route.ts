import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getHotelProvider } from "@/lib/providers";
import { compareHotelsSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

/**
 * Compare hotels using only fields present in provider payloads / client snapshots
 * from a prior real search. Missing fields are omitted (UI shows "non disponibile").
 * Never invents ratings, prices, or photos.
 */
export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = compareHotelsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_error",
      "Servono almeno 2 hotel da confrontare.",
      400,
      requestId,
    );
  }

  const provider = getHotelProvider();
  const rows = [];

  for (const item of parsed.data.items) {
    const base: Record<string, unknown> = {
      externalId: item.externalId,
      ...(item.snapshot ?? {}),
    };

    if (provider.isConfigured()) {
      const detail = await provider.getDetails(item.externalId);
      if (detail.ok) {
        Object.assign(base, detail.data);
      }
    }

    rows.push(base);
  }

  return apiSuccess(
    {
      status: provider.isConfigured() ? "ok" : "provider_not_configured",
      message: provider.isConfigured()
        ? undefined
        : "Provider hotel non configurato: il confronto usa solo i campi già presenti nelle selezioni utente (nessun dato inventato).",
      rows,
    },
    200,
    requestId,
  );
}
