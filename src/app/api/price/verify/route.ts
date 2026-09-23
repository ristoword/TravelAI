import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import {
  getCarRentalProvider,
  getFlightProvider,
  getHotelProvider,
} from "@/lib/providers";
import { z } from "zod";

 const schema = z.object({
  kind: z.enum(["flight", "hotel", "car"]),
  externalId: z.string().min(1),
  expectedAmount: z.number().positive(),
  currency: z.string().length(3),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = createRequestId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Dati verifica prezzo non validi.", 400, requestId);
  }

  const provider =
    parsed.data.kind === "flight"
      ? getFlightProvider()
      : parsed.data.kind === "hotel"
        ? getHotelProvider()
        : getCarRentalProvider();

  const result = await provider.verifyPrice(parsed.data);
  if (!result.ok) {
    return apiSuccess(
      {
        status: result.code,
        message: result.message,
        verification: null,
      },
      200,
      requestId,
    );
  }

  return apiSuccess(
    { status: "ok", verification: result.data },
    200,
    requestId,
  );
}
