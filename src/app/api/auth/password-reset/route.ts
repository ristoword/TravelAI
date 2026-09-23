import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { writeAuditLog, clientIp } from "@/lib/audit";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import {
  generateOpaqueToken,
  hashToken,
  hashPassword,
} from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from "@/lib/validations/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  const limited = rateLimit(`reset:${ip ?? "unknown"}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return apiError(
      "RATE_LIMITED",
      "Too many password reset attempts. Try again later.",
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

  const prisma = getPrisma();
  if (!prisma) {
    return apiError(
      "DATABASE_NOT_CONFIGURED",
      "DATABASE_URL is not configured",
      503,
      requestId,
    );
  }

  // Confirm flow if token + password present
  if (
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    "password" in body
  ) {
    const parsed = passwordResetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid input",
        400,
        requestId,
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !record ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now() ||
      record.user.deletedAt
    ) {
      return apiError(
        "INVALID_TOKEN",
        "Reset token is invalid or expired",
        400,
        requestId,
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await writeAuditLog({
      userId: record.userId,
      action: "user.password_change",
      entity: "User",
      entityId: record.userId,
      ip,
      userAgent,
    });

    return apiSuccess({ status: "password_updated" }, 200, requestId);
  }

  const parsed = passwordResetRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input",
      400,
      requestId,
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  // Always return generic success to avoid account enumeration,
  // but only create a token when the user exists.
  let developmentOnlyResetToken: string | undefined;
  let emailStatus:
    | "email_provider_not_configured"
    | "sent"
    | "skipped_unknown_user" = "skipped_unknown_user";

  if (user) {
    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset your TravelAI password",
      text: "Use the reset link from the app to set a new password.",
    });

    emailStatus = emailResult.sent
      ? "sent"
      : isEmailConfigured()
        ? "email_provider_not_configured"
        : "email_provider_not_configured";

    if (process.env.NODE_ENV === "development") {
      console.info("[auth] password reset token created for user", user.id);
      if (!emailResult.sent) {
        developmentOnlyResetToken = token;
      }
    }

    await writeAuditLog({
      userId: user.id,
      action: "user.password_reset_request",
      entity: "User",
      entityId: user.id,
      ip,
      userAgent,
      metadata: { emailStatus },
    });
  }

  const response: Record<string, unknown> = {
    status: "accepted",
    email: { status: emailStatus },
  };

  if (developmentOnlyResetToken) {
    response.developmentOnlyResetToken = developmentOnlyResetToken;
  }

  return apiSuccess(response, 200, requestId);
}
