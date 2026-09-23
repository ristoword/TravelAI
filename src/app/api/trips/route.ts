import { auth } from "@/auth";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { tripCreateSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId();
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("unauthorized", "Accesso richiesto.", 401, requestId);
  }
  if (!isDatabaseConfigured()) {
    return apiError(
      "database_not_configured",
      "Database non configurato.",
      503,
      requestId,
    );
  }
  const prisma = getPrisma();
  if (!prisma) {
    return apiError("database_error", "Database non disponibile.", 503, requestId);
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      tripItems: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return apiSuccess({ status: "ok", trips }, 200, requestId);
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("unauthorized", "Accesso richiesto.", 401, requestId);
  }
  if (!isDatabaseConfigured()) {
    return apiError(
      "database_not_configured",
      "Database non configurato. Il trip builder richiede DATABASE_URL.",
      503,
      requestId,
    );
  }
  const prisma = getPrisma();
  if (!prisma) {
    return apiError("database_error", "Database non disponibile.", 503, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = tripCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Dati viaggio non validi.", 400, requestId);
  }

  const trip = await prisma.trip.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      destination: parsed.data.destination,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
  });

  return apiSuccess({ status: "ok", trip }, 201, requestId);
}
