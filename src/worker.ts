import { getConfig } from "./config/index.js";
import { createLogger } from "./lib/logger.js";
import { createRedisConnectionOptions } from "./lib/redis.js";
import { MailService } from "./modules/mail/mail.service.js";
import { createEmailWorker } from "./modules/queue/email.queue.js";

const config = getConfig();
const logger = createLogger(config.app.env, config.app.logLevel);
const redisConnection = createRedisConnectionOptions(config.redis.url);
const mailService = new MailService(config.mail);
const emailWorker = createEmailWorker(
  redisConnection,
  mailService,
  logger,
  config.worker.concurrency,
);

logger.info({ queue: "email" }, "Worker started");

async function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "Shutting down worker");
  await emailWorker.close();
  process.exit(0);
}

process.on("SIGTERM", (signal) => {
  void shutdown(signal);
});
process.on("SIGINT", (signal) => {
  void shutdown(signal);
});
