import { Router } from "express";
import type { AppConfig } from "./config/index.js";
import { successResponse } from "./lib/api-response.js";
import type { createRateLimiters } from "./middleware/rate-limiters.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import type { AuthService } from "./modules/auth/auth.service.js";
import { createHealthRouter } from "./modules/health/health.routes.js";
import { createUploadRouter } from "./modules/uploads/upload.routes.js";

interface RouteDependencies {
  authService: AuthService;
  authConfig: AppConfig["auth"];
  uploadConfig: AppConfig["upload"];
  rateLimiters: ReturnType<typeof createRateLimiters>;
  readinessCheck: () => Promise<void>;
}

export function createRouter(dependencies: RouteDependencies) {
  const router = Router();
  const api = Router();

  router.use("/health", createHealthRouter(dependencies.readinessCheck));

  api.get("/", (_req, res) =>
    successResponse(res, {
      name: "express-backend-boilerplate-api",
      version: "v1",
    }),
  );
  api.use(
    "/auth",
    createAuthRouter(dependencies.authService, dependencies.authConfig, dependencies.rateLimiters),
  );
  api.use(
    "/uploads",
    createUploadRouter(
      dependencies.authService,
      dependencies.uploadConfig,
      dependencies.rateLimiters.upload,
    ),
  );

  router.use("/api/v1", api);

  return router;
}
