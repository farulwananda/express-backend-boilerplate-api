import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Request } from "express";
import type { AppConfig } from "./config/index.js";
import { getConfig } from "./config/index.js";
import { composeApplication } from "./bootstrap/composition-root.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { createRateLimiters } from "./middleware/rate-limiters.js";
import { requestId } from "./middleware/request-id.js";
import type { AuthService } from "./modules/auth/auth.service.js";
import { configurePassport } from "./modules/auth/passport.js";
import { createLogger, type Logger } from "./lib/logger.js";
import { createRouter } from "./routes.js";

export interface CreateAppOptions {
  config?: AppConfig;
  authService?: AuthService;
  readinessCheck?: () => Promise<void>;
  shutdown?: () => Promise<void>;
  logger?: Logger;
}

export function createApp(options: CreateAppOptions = {}) {
  const config = options.config ?? getConfig();
  const logger = options.logger ?? createLogger(config.app.env, config.app.logLevel);
  const composition = options.authService ? null : composeApplication(config);
  const authService = options.authService ?? composition!.authService;
  const readinessCheck = options.readinessCheck ?? composition!.readinessCheck;
  const shutdown = options.shutdown ?? composition?.shutdown ?? (async () => undefined);
  const rateLimiters = createRateLimiters(config);

  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", config.app.trustProxy);
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as Request).id,
    }),
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "same-site" },
      hsts:
        config.app.env === "production"
          ? {
              maxAge: 31_536_000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.app.corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(configurePassport(config.auth));
  app.use("/api", rateLimiters.general);

  app.use(
    createRouter({
      authService,
      authConfig: config.auth,
      uploadConfig: config.upload,
      rateLimiters,
      readinessCheck,
    }),
  );
  app.use(notFound);
  app.use(errorHandler(logger));

  return Object.assign(app, {
    close: async () => {
      rateLimiters.close();
      await shutdown();
    },
  });
}

export type AppInstance = ReturnType<typeof createApp>;
