import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { apiRateLimit } from "./middleware/rate-limit.js";
import { requestId } from "./middleware/request-id.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  if (env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(apiRateLimit);
  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
