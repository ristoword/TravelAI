import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getFlightProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const requestId = createRequestId();
  const { id } = await params;
  if (!id?.trim()) {
    return apiError("validation_error", "ID volo mancante.", 400, requestId);
  }

  const provider = getFlightProvider();
  if (!provider.isConfigured()) {
    return apiSuccess(
      {
        status: "provider_not_configured",
        message: "Provider voli non configurato.",
        offer: null,
      },
      200,
      requestId,
    );
  }

  const result = await provider.getDetails(id);
  if (!result.ok) {
    return apiSuccess(
      {
        status: result.code,
        message: result.message,
        offer: null,
      },
      200,
      requestId,
    );
  }

  return apiSuccess({ status: "ok", offer: result.data }, 200, requestId);
}
