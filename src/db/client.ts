import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { AppConfig } from "../config/index.js";
import * as schema from "./schema/index.js";

export function createMysqlPool(database: AppConfig["database"]) {
  return mysql.createPool({
    uri: database.url,
    waitForConnections: true,
    connectionLimit: database.pool.connectionLimit,
    maxIdle: database.pool.maxIdle,
    idleTimeout: database.pool.idleTimeoutMs,
    enableKeepAlive: true,
  });
}

export function createDb(pool: mysql.Pool) {
  return drizzle(pool, {
    schema,
    mode: "default",
  });
}

export type Db = ReturnType<typeof createDb>;
export type MysqlPool = mysql.Pool;

export async function checkDatabaseReady(pool: MysqlPool) {
  await pool.query("select 1");
}
