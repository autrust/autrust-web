import { describe, it, expect } from "vitest";
import { isPasswordStrongEnough } from "@/lib/auth";

describe("isPasswordStrongEnough", () => {
  it("retourne false pour un mot de passe de moins de 8 caractères", () => {
    expect(isPasswordStrongEnough("")).toBe(false);
    expect(isPasswordStrongEnough("a")).toBe(false);
    expect(isPasswordStrongEnough("abc")).toBe(false);
    expect(isPasswordStrongEnough("1234567")).toBe(false);
  });

  it("retourne true pour un mot de passe de 8 caractères ou plus", () => {
    expect(isPasswordStrongEnough("12345678")).toBe(true);
    expect(isPasswordStrongEnough("password")).toBe(true);
    expect(isPasswordStrongEnough("MotDePasse123!")).toBe(true);
  });
});
