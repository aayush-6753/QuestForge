import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { activityRouter } from "../modules/activity/activity.routes.js";
import { questRouter } from "../modules/quests/quest.routes.js";
import { inventoryRouter, rewardRouter } from "../modules/rewards/reward.routes.js";
import { meRouter } from "../modules/users/me.routes.js";
import { ApiError } from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";

export const apiRouter = Router();

apiRouter.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { status: "ok", database: "ok" });
  } catch {
    next(new ApiError(503, "SERVICE_UNAVAILABLE", "Database is unavailable."));
  }
});

apiRouter.use("/v1/me", meRouter);
apiRouter.use("/v1/quests", questRouter);
apiRouter.use("/v1/activity", activityRouter);
apiRouter.use("/v1/rewards", rewardRouter);
apiRouter.use("/v1/inventory", inventoryRouter);
