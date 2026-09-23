import { apiSuccess, createRequestId } from "@/lib/api";
import { getOAuthStatus } from "@/lib/oauth";

export async function GET() {
  const requestId = createRequestId();
  const status = getOAuthStatus();
  const configured = status.google === "configured" || status.github === "configured";

  return apiSuccess(
    {
      configured,
      providers: status,
      message: configured
        ? "OAuth providers available via Auth.js sign-in"
        : "OAuth non configurato",
    },
    200,
    requestId,
  );
}
