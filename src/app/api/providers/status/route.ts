import { apiSuccess, createRequestId } from "@/lib/api";
import { getTravelProviderStatuses } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();
  return apiSuccess(
    {
      status: "ok",
      providers: getTravelProviderStatuses(),
    },
    200,
    requestId,
  );
}
