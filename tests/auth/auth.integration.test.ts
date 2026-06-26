import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

function makeApp() {
  const authService = new AuthService(new InMemoryAuthRepository(), testConfig.auth);

  return createApp({
    config: testConfig,
    authService,
    readinessCheck: async () => undefined,
  });
}

describe("auth routes", () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp();
  });

  it("registers a user and returns tokens", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Farul",
        email: "farul@example.com",
        password: "StrongPassword123!",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toMatchObject({
      name: "Farul",
      email: "farul@example.com",
      role: "user",
    });
    expect(response.body.data.tokens.accessToken).toEqual(expect.any(String));
    expect(response.body.data.tokens.refreshToken).toEqual(expect.any(String));
  });

  it("rejects duplicate email registration", async () => {
    const payload = {
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    };

    await request(app).post("/api/v1/auth/register").send(payload).expect(201);
    const response = await request(app).post("/api/v1/auth/register").send(payload).expect(409);

    expect(response.body).toMatchObject({
      success: false,
      code: "EMAIL_ALREADY_REGISTERED",
    });
  });

  it("logs in with valid credentials and rejects invalid credentials", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "farul@example.com",
        password: "wrong-password",
      })
      .expect(401);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "farul@example.com",
        password: "StrongPassword123!",
      })
      .expect(200);

    expect(response.body.data.tokens.accessToken).toEqual(expect.any(String));
  });

  it("requires bearer token for me endpoint", async () => {
    await request(app).get("/api/v1/auth/me").expect(401);
  });

  it("returns current user with a valid access token", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .expect(200);

    expect(response.body.data.user.email).toBe("farul@example.com");
  });

  it("rotates refresh token and rejects the old refresh token", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });
    const oldRefreshToken = register.body.data.tokens.refreshToken;

    const refresh = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    expect(refresh.body.data.tokens.refreshToken).not.toBe(oldRefreshToken);

    await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefreshToken })
      .expect(401);
  });

  it("logs out by revoking refresh token", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });
    const refreshToken = register.body.data.tokens.refreshToken;

    await request(app).post("/api/v1/auth/logout").send({ refreshToken }).expect(200);
    await request(app).post("/api/v1/auth/refresh").send({ refreshToken }).expect(401);
  });
});
