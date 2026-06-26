import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import type { RedisReply } from "rate-limit-redis";
import { RedisStore } from "rate-limit-redis";
import { Redis } from "ioredis";
import type { AppConfig } from "../config/index.js";

interface RateLimiterSet {
  general: RateLimitRequestHandler;
  auth: RateLimitRequestHandler;
  oauth: RateLimitRequestHandler;
  upload: RateLimitRequestHandler;
  close: () => void;
}

type RateLimitPolicy = AppConfig["rateLimit"]["general"];

export function createRateLimiters(config: AppConfig): RateLimiterSet {
  const redisClients: Redis[] = [];
  const createRedisBackedHandler = (
    keyPrefix: string,
    policy: RateLimitPolicy,
  ): RateLimitRequestHandler => {
    if (config.rateLimit.store === "memory" || config.app.env === "test") {
      return rateLimit({
        windowMs: policy.windowMs,
        limit: policy.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: "Too many requests, please try again later",
          code: "RATE_LIMIT_EXCEEDED",
        },
      });
    }

    const redis = new Redis(config.redis.url, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    redisClients.push(redis);

    return rateLimit({
      windowMs: policy.windowMs,
      limit: policy.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later",
        code: "RATE_LIMIT_EXCEEDED",
      },
      store: new RedisStore({
        sendCommand: async (...args: string[]) =>
          (await redis.call(args[0]!, ...args.slice(1))) as RedisReply,
        prefix: `rl:${keyPrefix}:`,
      }),
    });
  };

  return {
    general: createRedisBackedHandler("general", config.rateLimit.general),
    auth: createRedisBackedHandler("auth", config.rateLimit.auth),
    oauth: createRedisBackedHandler("oauth", config.rateLimit.oauth),
    upload: createRedisBackedHandler("upload", config.rateLimit.upload),
    close: () => {
      for (const redis of redisClients) {
        redis.disconnect();
      }
    },
  };
}
