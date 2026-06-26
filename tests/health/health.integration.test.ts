import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

describe("health routes", () => {
  it("returns live status without readiness dependency", async () => {
    const authService = new AuthService(new InMemoryAuthRepository(), testConfig.auth);
    const app = createApp({
      config: testConfig,
      authService,
      readinessCheck: async () => undefined,
    });

    const response = await request(app).get("/health/live").expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  it("runs readiness dependency", async () => {
    const authService = new AuthService(new InMemoryAuthRepository(), testConfig.auth);
    let checked = false;
    const app = createApp({
      config: testConfig,
      authService,
      readinessCheck: async () => {
        checked = true;
      },
    });

    const response = await request(app).get("/health/ready").expect(200);

    expect(checked).toBe(true);
    expect(response.body.data.status).toBe("ready");
  });

  it("returns safe error when readiness dependency fails", async () => {
    const authService = new AuthService(new InMemoryAuthRepository(), testConfig.auth);
    const app = createApp({
      config: testConfig,
      authService,
      readinessCheck: async () => {
        throw new Error("database connection failed");
      },
    });

    const response = await request(app).get("/health/ready").expect(500);

    expect(response.body).toMatchObject({
      success: false,
      message: "Internal server error",
    });
    expect(response.body.message).not.toContain("database connection failed");
  });
});
