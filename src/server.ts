import { createApp } from "./app.js";
import { getConfig } from "./config/index.js";
import { createLogger } from "./lib/logger.js";

const config = getConfig();
const logger = createLogger(config.app.env, config.app.logLevel);
const app = createApp({ config, logger });

const server = app.listen(config.app.port, config.app.host, () => {
  logger.info(
    {
      host: config.app.host,
      port: config.app.port,
      environment: config.app.env,
    },
    "HTTP server started",
  );
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "Shutting down HTTP server");
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Failed to close HTTP server cleanly");
      process.exit(1);
    }

    app
      .close()
      .then(() => {
        process.exit(0);
      })
      .catch((shutdownError: unknown) => {
        logger.error({ err: shutdownError }, "Failed to close application resources cleanly");
        process.exit(1);
      });
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
