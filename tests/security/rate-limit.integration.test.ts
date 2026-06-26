import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import type { AppConfig } from "../../src/config/index.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

function makeApp(config: AppConfig) {
  const authService = new AuthService(new InMemoryAuthRepository(), config.auth);

  return {
    app: createApp({
      config,
      authService,
      readinessCheck: async () => undefined,
    }),
    authService,
  };
}

describe("route rate limits", () => {
  it("rate limits auth endpoints separately", async () => {
    const config: AppConfig = {
      ...testConfig,
      rateLimit: {
        ...testConfig.rateLimit,
        auth: {
          windowMs: 60_000,
          max: 1,
        },
      },
    };
    const { app } = makeApp(config);

    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "missing@example.com",
        password: "wrong",
      })
      .expect(401);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "missing@example.com",
        password: "wrong",
      })
      .expect(429);

    expect(response.body).toMatchObject({
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
    });
  });

  it("rate limits upload endpoints separately", async () => {
    const config: AppConfig = {
      ...testConfig,
      rateLimit: {
        ...testConfig.rateLimit,
        upload: {
          windowMs: 60_000,
          max: 1,
        },
      },
    };
    const { app } = makeApp(config);
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .attach("file", Buffer.from("not a real png"), {
        filename: "spoof.png",
        contentType: "image/png",
      })
      .expect(422);

    await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .attach("file", Buffer.from("not a real png"), {
        filename: "spoof.png",
        contentType: "image/png",
      })
      .expect(429);
  });
});
