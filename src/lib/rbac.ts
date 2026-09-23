import type { Role } from "@prisma/client";

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  locale?: string;
};

export function requireUser(
  user: SessionUser | null | undefined,
): SessionUser {
  if (!user?.id) {
    throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
  }
  return user;
}

export function requireRole(
  user: SessionUser | null | undefined,
  roles: Role | Role[],
): SessionUser {
  const current = requireUser(user);
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(current.role)) {
    throw new AuthError("FORBIDDEN", "Insufficient permissions", 403);
  }
  return current;
}

export function hasRole(user: SessionUser | null | undefined, role: Role): boolean {
  return Boolean(user && user.role === role);
}
