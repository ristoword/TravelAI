import { auth } from "@/auth";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { writeAuditLog, clientIp } from "@/lib/audit";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validations/auth";

export async function GET(request: Request) {
  const requestId = createRequestId();
  const session = await auth();

  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Authentication required", 401, requestId);
  }

  if (!isDatabaseConfigured()) {
    return apiError(
      "DATABASE_NOT_CONFIGURED",
      "DATABASE_URL is not configured",
      503,
      requestId,
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return apiError(
      "DATABASE_NOT_CONFIGURED",
      "DATABASE_URL is not configured",
      503,
      requestId,
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return apiError("NOT_FOUND", "User not found", 404, requestId);
  }

  void request;
  return apiSuccess({ user }, 200, requestId);
}

export async function PATCH(request: Request) {
  const requestId = createRequestId();
  const session = await auth();
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Authentication required", 401, requestId);
  }

  if (!isDatabaseConfigured()) {
    return apiError(
      "DATABASE_NOT_CONFIGURED",
      "DATABASE_URL is not configured",
      503,
      requestId,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400, requestId);
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input",
      400,
      requestId,
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return apiError(
      "DATABASE_NOT_CONFIGURED",
      "DATABASE_URL is not configured",
      503,
      requestId,
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.locale !== undefined
        ? { locale: parsed.data.locale }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      role: true,
      emailVerified: true,
      updatedAt: true,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "user.profile_update",
    entity: "User",
    entityId: user.id,
    ip,
    userAgent,
    metadata: {
      fields: Object.keys(parsed.data),
    },
  });

  return apiSuccess({ user }, 200, requestId);
}
