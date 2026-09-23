import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";

export type AuditInput = {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Persist an audit event. Never pass passwords, tokens, or secrets in metadata.
 * No-ops when DATABASE_URL is not configured.
 */
export async function writeAuditLog(input: AuditInput): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  const safeMetadata = input.metadata
    ? (scrubSecrets(input.metadata) as Prisma.InputJsonValue)
    : undefined;

  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? undefined,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        ip: input.ip ?? undefined,
        userAgent: input.userAgent ?? undefined,
        metadata: safeMetadata,
      },
    });
  } catch {
    // Audit must not break the main flow; swallow DB errors silently at this layer.
  }
}

const SECRET_KEYS = /password|token|secret|authorization|cookie|api[_-]?key/i;

function scrubSecrets(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SECRET_KEYS.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return headers.get("x-real-ip");
}
