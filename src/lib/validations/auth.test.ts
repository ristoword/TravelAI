import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  passwordResetConfirmSchema,
} from "@/lib/validations/auth";

describe("auth Zod validation", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "Secret123",
      name: "Ada",
      locale: "it",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email on login", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "whatever",
    });
    expect(result.success).toBe(false);
  });

  it("validates profile updates", () => {
    expect(
      profileUpdateSchema.safeParse({ name: "Ada", locale: "en" }).success,
    ).toBe(true);
    expect(profileUpdateSchema.safeParse({ locale: "xx" }).success).toBe(false);
  });

  it("requires a long enough reset token", () => {
    expect(
      passwordResetConfirmSchema.safeParse({
        token: "short",
        password: "Secret123",
      }).success,
    ).toBe(false);
  });
});
