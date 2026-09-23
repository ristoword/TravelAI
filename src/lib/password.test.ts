import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes passwords and never returns plaintext", async () => {
    const plaintext = "Secret123";
    const hash = await hashPassword(plaintext);
    expect(hash).not.toBe(plaintext);
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword(plaintext, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
