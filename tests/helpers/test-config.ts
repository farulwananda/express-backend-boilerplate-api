import type { AppConfig } from "../../src/config/index.js";

export const testConfig: AppConfig = {
  app: {
    env: "test",
    name: "express-backend-boilerplate-api",
    logLevel: "silent",
    host: "127.0.0.1",
    port: 3000,
    trustProxy: 0,
    corsOrigins: [],
  },
  database: {
    url: "mysql://app:secret@localhost:3306/express_backend_test",
    pool: {
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeoutMs: 60_000,
    },
  },
  redis: {
    url: "redis://localhost:6379",
  },
  auth: {
    accessSecret: "test-access-secret-at-least-32-characters",
    refreshSecret: "test-refresh-secret-at-least-32-characters",
    issuer: "express-backend-boilerplate-api",
    audience: "express-backend-boilerplate-api-clients",
    accessTtlSeconds: 900,
    refreshTtlDays: 30,
    codeTtlSeconds: 300,
    google: {
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
      callbackUrl: "http://localhost:3000/api/v1/auth/google/callback",
      frontendSuccessUrl: "http://localhost:5173/auth/callback",
      frontendErrorUrl: "http://localhost:5173/login",
    },
  },
  rateLimit: {
    store: "memory",
    general: {
      windowMs: 60_000,
      max: 10_000,
    },
    auth: {
      windowMs: 60_000,
      max: 10_000,
    },
    oauth: {
      windowMs: 60_000,
      max: 10_000,
    },
    upload: {
      windowMs: 60_000,
      max: 10_000,
    },
  },
  mail: {
    host: "localhost",
    port: 1025,
    secure: false,
    user: "",
    password: "",
    from: "Express API <no-reply@example.com>",
  },
  worker: {
    concurrency: 5,
  },
  upload: {
    maxMb: 1,
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    dir: "storage/test-uploads",
  },
};
