import { describe, expect, it } from "vitest";
import { AuthError, hasRole, requireRole, requireUser } from "@/lib/rbac";

const user = {
  id: "u1",
  email: "a@b.com",
  role: "USER" as const,
};

const admin = {
  id: "a1",
  email: "admin@b.com",
  role: "ADMIN" as const,
};

describe("RBAC helpers", () => {
  it("requireUser throws when missing", () => {
    expect(() => requireUser(null)).toThrow(AuthError);
  });

  it("requireRole allows matching roles", () => {
    expect(requireRole(admin, "ADMIN").id).toBe("a1");
    expect(requireRole(user, ["USER", "ADMIN"]).id).toBe("u1");
  });

  it("requireRole forbids mismatched roles", () => {
    try {
      requireRole(user, "ADMIN");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as AuthError).code).toBe("FORBIDDEN");
      expect((err as AuthError).status).toBe(403);
    }
  });

  it("hasRole checks equality", () => {
    expect(hasRole(user, "USER")).toBe(true);
    expect(hasRole(user, "ADMIN")).toBe(false);
  });
});
