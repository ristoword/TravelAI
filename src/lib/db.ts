import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}

/** Use only when DATABASE_URL is known to be set (e.g. after a guard). */
export function requirePrisma(): PrismaClient {
  const client = getPrisma();
  if (!client) {
    throw new Error("DATABASE_URL is not configured");
  }
  return client;
}
