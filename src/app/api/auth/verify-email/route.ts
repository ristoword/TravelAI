import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { writeAuditLog, clientIp } from "@/lib/audit";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { generateOpaqueToken, hashToken } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import {
  emailVerificationConfirmSchema,
  emailVerificationRequestSchema,
} from "@/lib/validations/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  const limited = rateLimit(`verify:${ip ?? "unknown"}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return apiError("RATE_LIMITED", "Too many attempts", 429, requestId);
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

  if (typeof body === "object" && body !== null && "token" in body) {
    const parsed = emailVerificationConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid input",
        400,
        requestId,
      );
    }

    const tokenHash = hashToken(parsed.data.token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now()
    ) {
      return apiError(
        "INVALID_TOKEN",
        "Verification token is invalid or expired",
        400,
        requestId,
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await writeAuditLog({
      userId: record.userId,
      action: "user.email_verified",
      entity: "User",
      entityId: record.userId,
      ip,
      userAgent,
    });

    return apiSuccess({ status: "email_verified" }, 200, requestId);
  }

  const parsed = emailVerificationRequestSchema.safeParse(body);
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

  if (!user) {
    return apiSuccess(
      {
        status: "accepted",
        email: { status: "skipped_unknown_user" },
      },
      200,
      requestId,
    );
  }

  if (user.emailVerified) {
    return apiSuccess(
      { status: "already_verified" },
      200,
      requestId,
    );
  }

  const token = generateOpaqueToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Verify your TravelAI email",
    text: "Use the verification link from the app.",
  });

  const emailStatus = emailResult.sent
    ? "sent"
    : isEmailConfigured()
      ? "not_sent"
      : "email_provider_not_configured";

  if (process.env.NODE_ENV === "development") {
    console.info("[auth] email verification token created for user", user.id);
  }

  const response: Record<string, unknown> = {
    status: "accepted",
    email: { status: emailStatus },
  };

  if (process.env.NODE_ENV === "development" && !emailResult.sent) {
    response.developmentOnlyVerificationToken = token;
  }

  return apiSuccess(response, 200, requestId);
}
