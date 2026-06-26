import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

describe("JWT security", () => {
  it("rejects access tokens with the wrong audience", async () => {
    const repository = new InMemoryAuthRepository();
    const authService = new AuthService(repository, testConfig.auth);
    const user = await repository.createUser({
      name: "Farul",
      email: "farul@example.com",
      passwordHash: null,
      role: "user",
    });
    const token = jwt.sign(
      {
        sub: String(user.id),
        email: user.email,
        role: user.role,
        typ: "access",
      },
      testConfig.auth.accessSecret,
      {
        issuer: testConfig.auth.issuer,
        audience: "wrong-audience",
        expiresIn: 900,
      },
    );

    await expect(authService.getUserFromAccessToken(token)).rejects.toThrow("Invalid access token");
  });
});
