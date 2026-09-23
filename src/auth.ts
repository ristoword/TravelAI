import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { writeAuditLog } from "@/lib/audit";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";

const prisma = isDatabaseConfigured() ? getPrisma() : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      await writeAuditLog({
        userId: user.id,
        action: "user.login",
        entity: "User",
        entityId: user.id,
      });
    },
  },
});
