import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { app } from "./app.js";

app.listen(env.PORT, () => {
  logger.info(`Life RPG API listening on port ${env.PORT}`);
});
