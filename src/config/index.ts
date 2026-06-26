import "dotenv/config";
import { loadEnv, type Env } from "./env.js";

export interface AppConfig {
  app: {
    env: Env["NODE_ENV"];
    name: string;
    logLevel: Env["LOG_LEVEL"];
    host: string;
    port: number;
    trustProxy: number;
    corsOrigins: string[];
  };
  database: {
    url: string;
    pool: {
      connectionLimit: number;
      maxIdle: number;
      idleTimeoutMs: number;
    };
  };
  redis: {
    url: string;
  };
  auth: {
    accessSecret: string;
    refreshSecret: string;
    issuer: string;
    audience: string;
    accessTtlSeconds: number;
    refreshTtlDays: number;
    codeTtlSeconds: number;
    google: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
      frontendSuccessUrl: string;
      frontendErrorUrl: string;
    };
  };
  rateLimit: {
    store: "memory" | "redis";
    general: {
      windowMs: number;
      max: number;
    };
    auth: {
      windowMs: number;
      max: number;
    };
    oauth: {
      windowMs: number;
      max: number;
    };
    upload: {
      windowMs: number;
      max: number;
    };
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  worker: {
    concurrency: number;
  };
  upload: {
    maxMb: number;
    allowedMimeTypes: string[];
    dir: string;
  };
}

export function getConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const env = loadEnv(source);

  return {
    app: {
      env: env.NODE_ENV,
      name: env.APP_NAME,
      logLevel: env.LOG_LEVEL,
      host: env.HOST,
      port: env.PORT,
      trustProxy: env.TRUST_PROXY,
      corsOrigins: env.CORS_ORIGINS,
    },
    database: {
      url: env.DATABASE_URL,
      pool: {
        connectionLimit: env.DB_POOL_CONNECTION_LIMIT,
        maxIdle: env.DB_POOL_MAX_IDLE,
        idleTimeoutMs: env.DB_POOL_IDLE_TIMEOUT_MS,
      },
    },
    redis: {
      url: env.REDIS_URL,
    },
    auth: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      refreshTtlDays: env.JWT_REFRESH_TTL_DAYS,
      codeTtlSeconds: env.AUTH_CODE_TTL_SECONDS,
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackUrl: env.GOOGLE_CALLBACK_URL,
        frontendSuccessUrl: env.FRONTEND_AUTH_SUCCESS_URL,
        frontendErrorUrl: env.FRONTEND_AUTH_ERROR_URL,
      },
    },
    rateLimit: {
      store: env.RATE_LIMIT_STORE,
      general: {
        windowMs: env.RATE_LIMIT_GENERAL_WINDOW_MS,
        max: env.RATE_LIMIT_GENERAL_MAX,
      },
      auth: {
        windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
        max: env.RATE_LIMIT_AUTH_MAX,
      },
      oauth: {
        windowMs: env.RATE_LIMIT_OAUTH_WINDOW_MS,
        max: env.RATE_LIMIT_OAUTH_MAX,
      },
      upload: {
        windowMs: env.RATE_LIMIT_UPLOAD_WINDOW_MS,
        max: env.RATE_LIMIT_UPLOAD_MAX,
      },
    },
    mail: {
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_SECURE,
      user: env.MAIL_USER,
      password: env.MAIL_PASSWORD,
      from: env.MAIL_FROM,
    },
    worker: {
      concurrency: env.WORKER_CONCURRENCY,
    },
    upload: {
      maxMb: env.UPLOAD_MAX_MB,
      allowedMimeTypes: env.UPLOAD_ALLOWED_MIME_TYPES,
      dir: env.UPLOAD_DIR,
    },
  };
}
