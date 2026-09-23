import { apiSuccess, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { getOAuthStatus } from "@/lib/oauth";
import { isEmailConfigured } from "@/lib/email";
import { getTravelProviderStatuses } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();

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

  const providers = getTravelProviderStatuses();

  return apiSuccess(
    {
      status: "ok",
      app: "TravelAI",
      phase: 4,
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
        flight: providers.flight,
        hotel: providers.hotel,
        car: providers.car,
        activity: providers.activity,
        airports: providers.airports,
        openai: providers.openai,
        stripe: providers.stripe,
      },
      requestId,
    },
    200,
    requestId,
  );
}
