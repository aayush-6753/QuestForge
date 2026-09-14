import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";
import { app } from "./app.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Life RPG API listening on port ${env.PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("Shutting down Life RPG API", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out", { signal });
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (serverError) => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      logger.error("Failed to disconnect from PostgreSQL", { error });
      process.exit(1);
    }

    clearTimeout(forceExitTimer);

    if (serverError) {
      logger.error("HTTP server shutdown failed", { error: serverError });
      process.exit(1);
    }

    logger.info("Life RPG API stopped");
    process.exit(0);
  });
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
