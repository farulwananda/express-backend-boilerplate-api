import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

function makeSubject() {
  const repository = new InMemoryAuthRepository();
  const authService = new AuthService(repository, testConfig.auth);
  const app = createApp({
    config: testConfig,
    authService,
    readinessCheck: async () => undefined,
  });

  return { app, authService };
}

describe("google auth", () => {
  it("creates a new user from a Google profile and exchanges a one-time code", async () => {
    const { app, authService } = makeSubject();
    const user = await authService.handleOAuthLogin({
      provider: "google",
      providerAccountId: "google-123",
      email: "farul@example.com",
      name: "Farul",
      avatarUrl: "https://example.com/avatar.png",
      emailVerified: true,
    });
    const code = await authService.createLoginCodeForUser(user);

    const response = await request(app)
      .post("/api/v1/auth/google/exchange")
      .send({ code })
      .expect(200);

    expect(response.body.data.user).toMatchObject({
      email: "farul@example.com",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(response.body.data.tokens.accessToken).toEqual(expect.any(String));
  });

  it("links Google to an existing email user", async () => {
    const { authService } = makeSubject();
    await authService.register({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    const googleUser = await authService.handleOAuthLogin({
      provider: "google",
      providerAccountId: "google-123",
      email: "farul@example.com",
      name: "Farul Google",
      avatarUrl: null,
      emailVerified: true,
    });

    expect(googleUser.email).toBe("farul@example.com");
    expect(googleUser.passwordHash).toEqual(expect.any(String));
  });

  it("rejects reused one-time login code", async () => {
    const { app, authService } = makeSubject();
    const user = await authService.handleOAuthLogin({
      provider: "google",
      providerAccountId: "google-123",
      email: "farul@example.com",
      name: "Farul",
      avatarUrl: null,
      emailVerified: true,
    });
    const code = await authService.createLoginCodeForUser(user);

    await request(app).post("/api/v1/auth/google/exchange").send({ code }).expect(200);
    await request(app).post("/api/v1/auth/google/exchange").send({ code }).expect(401);
  });

  it("rejects invalid one-time login code", async () => {
    const { app } = makeSubject();

    await request(app)
      .post("/api/v1/auth/google/exchange")
      .send({ code: "invalid-code-but-long-enough-for-validation" })
      .expect(401);
  });

  it("rejects password login for Google-only users", async () => {
    const { app, authService } = makeSubject();
    await authService.handleOAuthLogin({
      provider: "google",
      providerAccountId: "google-123",
      email: "farul@example.com",
      name: "Farul",
      avatarUrl: null,
      emailVerified: true,
    });

    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "farul@example.com",
        password: "StrongPassword123!",
      })
      .expect(401);
  });
});
