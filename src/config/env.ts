import { z } from "zod";

const productionPlaceholderValues = new Set([
  "change-me-access-secret-at-least-32-characters",
  "change-me-refresh-secret-at-least-32-characters",
  "google-client-id-placeholder",
  "google-client-secret-placeholder",
  "your-google-client-id",
  "your-google-client-secret",
]);

const csvSchema = (defaultValue = "") =>
  z
    .string()
    .default(defaultValue)
    .transform((value) => [
      ...new Set(
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    ]);

const optionalCsvSchema = csvSchema();

const boolSchema = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .default(false)
  .transform((value) => value === true || value === "true" || value === "1");

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1);
const urlString = requiredString.url();

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_NAME: requiredString.default("express-backend-boilerplate-api"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
    HOST: requiredString.default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(3000),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    CORS_ORIGINS: optionalCsvSchema,
    DATABASE_URL: urlString,
    DB_POOL_CONNECTION_LIMIT: z.coerce.number().int().positive().max(100).default(10),
    DB_POOL_MAX_IDLE: z.coerce.number().int().positive().max(100).default(10),
    DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
    REDIS_URL: urlString.default("redis://localhost:6379"),
    JWT_ACCESS_SECRET: requiredString.min(32),
    JWT_REFRESH_SECRET: requiredString.min(32),
    JWT_ISSUER: requiredString.default("express-backend-boilerplate-api"),
    JWT_AUDIENCE: requiredString.default("express-backend-boilerplate-api-clients"),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().max(86_400).default(900),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().max(365).default(30),
    RATE_LIMIT_STORE: z.enum(["memory", "redis"]).default("memory"),
    RATE_LIMIT_GENERAL_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_GENERAL_MAX: z.coerce.number().int().positive().default(300),
    RATE_LIMIT_AUTH_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60_000),
    RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
    RATE_LIMIT_OAUTH_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60_000),
    RATE_LIMIT_OAUTH_MAX: z.coerce.number().int().positive().default(30),
    RATE_LIMIT_UPLOAD_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_UPLOAD_MAX: z.coerce.number().int().positive().default(30),
    GOOGLE_CLIENT_ID: requiredString.default("google-client-id-placeholder"),
    GOOGLE_CLIENT_SECRET: requiredString.default("google-client-secret-placeholder"),
    GOOGLE_CALLBACK_URL: urlString.default("http://localhost:3000/api/v1/auth/google/callback"),
    FRONTEND_AUTH_SUCCESS_URL: urlString.default("http://localhost:5173/auth/callback"),
    FRONTEND_AUTH_ERROR_URL: urlString.default("http://localhost:5173/login"),
    AUTH_CODE_TTL_SECONDS: z.coerce.number().int().positive().max(3600).default(300),
    MAIL_HOST: requiredString.default("localhost"),
    MAIL_PORT: z.coerce.number().int().positive().max(65_535).default(1025),
    MAIL_SECURE: boolSchema,
    MAIL_USER: trimmedString.default(""),
    MAIL_PASSWORD: trimmedString.default(""),
    MAIL_FROM: requiredString.default("Express API <no-reply@example.com>"),
    WORKER_CONCURRENCY: z.coerce.number().int().positive().max(50).default(5),
    UPLOAD_MAX_MB: z.coerce.number().positive().max(100).default(5),
    UPLOAD_ALLOWED_MIME_TYPES: csvSchema("image/jpeg,image/png,application/pdf"),
    UPLOAD_DIR: requiredString.default("storage/uploads"),
  })
  .superRefine((env, context) => {
    if ((env.MAIL_USER && !env.MAIL_PASSWORD) || (!env.MAIL_USER && env.MAIL_PASSWORD)) {
      context.addIssue({
        code: "custom",
        path: ["MAIL_PASSWORD"],
        message: "MAIL_USER and MAIL_PASSWORD must be configured together.",
      });
    }

    if (env.NODE_ENV !== "production") {
      return;
    }

    for (const key of [
      "JWT_ACCESS_SECRET",
      "JWT_REFRESH_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ] as const) {
      if (productionPlaceholderValues.has(env[key])) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: `${key} must be replaced before running in production.`,
        });
      }
    }

    if (env.CORS_ORIGINS.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "CORS_ORIGINS must list explicit frontend origins in production.",
      });
    }

    if (env.RATE_LIMIT_STORE !== "redis") {
      context.addIssue({
        code: "custom",
        path: ["RATE_LIMIT_STORE"],
        message: "RATE_LIMIT_STORE must be redis in production.",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}
