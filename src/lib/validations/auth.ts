import { z } from "zod";

export const locales = ["it", "en", "nl", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";

export const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  name: z.string().trim().min(1).max(120).optional(),
  locale: z.enum(locales).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20).max(256),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

export const emailVerificationRequestSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const emailVerificationConfirmSchema = z.object({
  token: z.string().min(20).max(256),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).nullable().optional(),
  locale: z.enum(locales).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
