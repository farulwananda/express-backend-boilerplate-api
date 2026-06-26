import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { InMemoryAuthRepository } from "../helpers/in-memory-auth.repository.js";
import { testConfig } from "../helpers/test-config.js";

const validPng = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
]);

function makeApp() {
  const authService = new AuthService(new InMemoryAuthRepository(), testConfig.auth);

  return createApp({
    config: testConfig,
    authService,
    readinessCheck: async () => undefined,
  });
}

describe("uploads", () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp();
  });

  it("rejects unauthenticated upload", async () => {
    await request(app)
      .post("/api/v1/uploads")
      .attach("file", Buffer.from("hello"), {
        filename: "hello.txt",
        contentType: "text/plain",
      })
      .expect(401);
  });

  it("accepts allowed MIME upload", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    const response = await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .attach("file", validPng, {
        filename: "avatar.png",
        contentType: "image/png",
      })
      .expect(201);

    expect(response.body.data.file).toMatchObject({
      originalName: "avatar.png",
      mimeType: "image/png",
    });
  });

  it("rejects spoofed MIME upload", async () => {
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
  });

  it("rejects disallowed MIME upload", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .attach("file", Buffer.from("hello"), {
        filename: "hello.txt",
        contentType: "text/plain",
      })
      .expect(422);
  });

  it("rejects oversized upload", async () => {
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Farul",
      email: "farul@example.com",
      password: "StrongPassword123!",
    });

    await request(app)
      .post("/api/v1/uploads")
      .set("Authorization", `Bearer ${register.body.data.tokens.accessToken}`)
      .attach("file", Buffer.alloc(1024 * 1024 + 1), {
        filename: "large.png",
        contentType: "image/png",
      })
      .expect(413);
  });
});
