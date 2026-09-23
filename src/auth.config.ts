import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { loginSchema } from "@/lib/validations/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import {
  isGitHubOAuthConfigured,
  isGoogleOAuthConfigured,
} from "@/lib/oauth";

/**
 * Edge-safe auth config pieces. Credentials authorize runs on Node.
 * JWT sessions are required for Credentials provider compatibility.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const limited = rateLimit(
          `login:${parsed.data.email.toLowerCase()}`,
          20,
          15 * 60 * 1000,
        );
        if (!limited.ok) return null;

        if (!isDatabaseConfigured()) return null;

        const prisma = getPrisma();
        if (!prisma) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: parsed.data.email.toLowerCase(),
            deletedAt: null,
          },
        });

        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          locale: user.locale,
        };
      },
    }),
    ...(isGoogleOAuthConfigured()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    ...(isGitHubOAuthConfigured()
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
        token.locale = (user as { locale?: string }).locale ?? "it";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.locale = (token.locale as string) ?? "it";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
