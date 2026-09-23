import { apiSuccess, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { getOAuthStatus } from "@/lib/oauth";
import { isEmailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();
  const timestamp = new Date().toISOString();

  let database: "ok" | "not_configured" | "error" = "not_configured";
  let databaseDetail: string | undefined;

  if (!isDatabaseConfigured()) {
    database = "not_configured";
  } else {
    const prisma = getPrisma();
    try {
      if (!prisma) {
        database = "error";
        databaseDetail = "client_unavailable";
      } else {
        await prisma.$queryRaw`SELECT 1`;
        database = "ok";
      }
    } catch {
      database = "error";
      databaseDetail = "connection_failed";
    }
  }

  return apiSuccess(
    {
      status: "ok",
      app: "TravelAI",
      phase: 2,
      database,
      ...(databaseDetail ? { databaseDetail } : {}),
      auth: {
        nextAuthSecret: process.env.NEXTAUTH_SECRET?.trim()
          ? "configured"
          : "not_configured",
        oauth: getOAuthStatus(),
        email: isEmailConfigured() ? "configured" : "not_configured",
      },
      providers: {
        flight: "not_configured",
        hotel: "not_configured",
        car: "not_configured",
        activity: "not_configured",
        openai: process.env.OPENAI_API_KEY?.trim()
          ? "env_present_not_integrated"
          : "not_configured",
        stripe: process.env.STRIPE_SECRET_KEY?.trim()
          ? "env_present_not_integrated"
          : "not_configured",
      },
      requestId,
      timestamp,
    },
    200,
    requestId,
  );
}
