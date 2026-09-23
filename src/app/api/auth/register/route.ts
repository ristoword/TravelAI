import { Role } from "@prisma/client";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { writeAuditLog, clientIp } from "@/lib/audit";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import {
  generateOpaqueToken,
  hashPassword,
  hashToken,
} from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  const limited = rateLimit(`register:${ip ?? "unknown"}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return apiError(
      "RATE_LIMITED",
      "Too many registration attempts. Try again later.",
      429,
      requestId,
    );
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

  const parsed = registerSchema.safeParse(body);
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

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !existing.deletedAt) {
    return apiError(
      "EMAIL_TAKEN",
      "An account with this email already exists",
      409,
      requestId,
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name,
      locale: parsed.data.locale ?? "it",
      role: Role.USER,
    },
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const verifyToken = generateOpaqueToken();
  const tokenHash = hashToken(verifyToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Verify your TravelAI email",
    text: "Use the verification link from the app to confirm your email.",
  });

  await writeAuditLog({
    userId: user.id,
    action: "user.register",
    entity: "User",
    entityId: user.id,
    ip,
    userAgent,
    metadata: {
      emailProvider: emailResult.sent ? "sent" : emailResult.reason,
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.info("[auth] email verification token created for user", user.id);
  }

  const response: Record<string, unknown> = {
    user,
    emailVerification: {
      status: emailResult.sent
        ? "sent"
        : isEmailConfigured()
          ? "not_sent"
          : "email_provider_not_configured",
    },
  };

  if (
    process.env.NODE_ENV === "development" &&
    !emailResult.sent
  ) {
    // Documented: only expose raw token in development when email is not configured.
    response.developmentOnlyVerificationToken = verifyToken;
  }

  return apiSuccess(response, 201, requestId);
}
