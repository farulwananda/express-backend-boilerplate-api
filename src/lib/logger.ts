import pino from "pino";

type LogLevel = pino.LevelWithSilent;

export function createLogger(environment = "development", level?: LogLevel) {
  return pino({
    level: level ?? (environment === "test" ? "silent" : "info"),
    redact: {
      paths: ["req.headers.authorization", "password", "*.password", "*.token", "*.refreshToken"],
      remove: true,
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
