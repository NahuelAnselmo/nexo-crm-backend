import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("contraseñas", () => {
  it("guarda un hash con salt y verifica únicamente la clave correcta", async () => {
    const hash = await hashPassword("Demo1234!");

    expect(hash).not.toContain("Demo1234!");
    await expect(verifyPassword("Demo1234!", hash)).resolves.toBe(true);
    await expect(verifyPassword("Incorrecta123!", hash)).resolves.toBe(false);
  });
});
