import type { AppConfig } from "../config/index.js";
import { checkDatabaseReady, createDb, createMysqlPool, type MysqlPool } from "../db/client.js";
import { checkRedisReady } from "../lib/redis.js";
import { DrizzleAuthRepository } from "../modules/auth/auth.repository.js";
import { AuthService } from "../modules/auth/auth.service.js";

export interface ApplicationComposition {
  authService: AuthService;
  readinessCheck: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export function composeApplication(config: AppConfig): ApplicationComposition {
  const pool = createMysqlPool(config.database);
  const db = createDb(pool);
  const authService = new AuthService(new DrizzleAuthRepository(db), config.auth);

  return {
    authService,
    readinessCheck: () => checkApplicationReadiness(pool, config.redis.url),
    shutdown: () => shutdownApplication(pool),
  };
}

async function checkApplicationReadiness(pool: MysqlPool, redisUrl: string) {
  await Promise.all([checkDatabaseReady(pool), checkRedisReady(redisUrl)]);
}

async function shutdownApplication(pool: MysqlPool) {
  await pool.end();
}
