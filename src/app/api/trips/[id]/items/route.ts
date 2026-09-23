import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { tripItemSchema } from "@/lib/validations/travel";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
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

  const { id } = await params;
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!trip) {
    return apiError("not_found", "Viaggio non trovato.", 404, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_json", "JSON non valido.", 400, requestId);
  }

  const parsed = tripItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_error", "Voce viaggio non valida.", 400, requestId);
  }

  const count = await prisma.tripItem.count({
    where: { tripId: id, deletedAt: null },
  });

  const item = await prisma.tripItem.create({
    data: {
      tripId: id,
      type: parsed.data.type,
      title: parsed.data.title,
      notes: parsed.data.notes,
      draftPayload: parsed.data.draftPayload
        ? (parsed.data.draftPayload as Prisma.InputJsonValue)
        : undefined,
      sortOrder: count,
    },
  });

  return apiSuccess({ status: "ok", item }, 201, requestId);
}
