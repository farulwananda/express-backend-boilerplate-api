import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

describe("loadEnv", () => {
  it("parses a valid environment", () => {
    const env = loadEnv({
      DATABASE_URL: "mysql://app:secret@localhost:3306/app",
      JWT_ACCESS_SECRET: "access-secret-at-least-32-characters",
      JWT_REFRESH_SECRET: "refresh-secret-at-least-32-characters",
      CORS_ORIGINS: "http://localhost:5173, https://example.com",
    });

    expect(env.PORT).toBe(3000);
    expect(env.TRUST_PROXY).toBe(0);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:5173", "https://example.com"]);
    expect(env.GOOGLE_CALLBACK_URL).toBe("http://localhost:3000/api/v1/auth/google/callback");
    expect(env.AUTH_CODE_TTL_SECONDS).toBe(300);
    expect(env.MAIL_HOST).toBe("localhost");
    expect(env.MAIL_SECURE).toBe(false);
    expect(env.JWT_ISSUER).toBe("express-backend-boilerplate-api");
    expect(env.JWT_AUDIENCE).toBe("express-backend-boilerplate-api-clients");
    expect(env.RATE_LIMIT_STORE).toBe("memory");
    expect(env.DB_POOL_CONNECTION_LIMIT).toBe(10);
    expect(env.UPLOAD_ALLOWED_MIME_TYPES).toEqual(["image/jpeg", "image/png", "application/pdf"]);
  });

  it("fails when required secrets are missing", () => {
    expect(() =>
      loadEnv({
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
      }),
    ).toThrow();
  });

  it("parses explicit boolean strings safely", () => {
    expect(
      loadEnv({
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
        JWT_ACCESS_SECRET: "access-secret-at-least-32-characters",
        JWT_REFRESH_SECRET: "refresh-secret-at-least-32-characters",
        MAIL_SECURE: "false",
      }).MAIL_SECURE,
    ).toBe(false);

    expect(
      loadEnv({
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
        JWT_ACCESS_SECRET: "access-secret-at-least-32-characters",
        JWT_REFRESH_SECRET: "refresh-secret-at-least-32-characters",
        MAIL_SECURE: "true",
      }).MAIL_SECURE,
    ).toBe(true);
  });

  it("rejects production placeholder secrets and empty CORS origins", () => {
    expect(() =>
      loadEnv({
        NODE_ENV: "production",
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
        JWT_ACCESS_SECRET: "change-me-access-secret-at-least-32-characters",
        JWT_REFRESH_SECRET: "change-me-refresh-secret-at-least-32-characters",
        GOOGLE_CLIENT_ID: "your-google-client-id",
        GOOGLE_CLIENT_SECRET: "your-google-client-secret",
      }),
    ).toThrow();
  });

  it("rejects memory rate limiter in production", () => {
    expect(() =>
      loadEnv({
        NODE_ENV: "production",
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
        JWT_ACCESS_SECRET: "production-access-secret-at-least-32-characters",
        JWT_REFRESH_SECRET: "production-refresh-secret-at-least-32-characters",
        GOOGLE_CLIENT_ID: "real-google-client-id",
        GOOGLE_CLIENT_SECRET: "real-google-client-secret",
        CORS_ORIGINS: "https://app.example.com",
        RATE_LIMIT_STORE: "memory",
      }),
    ).toThrow();
  });

  it("requires mail username and password to be configured together", () => {
    expect(() =>
      loadEnv({
        DATABASE_URL: "mysql://app:secret@localhost:3306/app",
        JWT_ACCESS_SECRET: "access-secret-at-least-32-characters",
        JWT_REFRESH_SECRET: "refresh-secret-at-least-32-characters",
        MAIL_USER: "smtp-user",
      }),
    ).toThrow();
  });
});
