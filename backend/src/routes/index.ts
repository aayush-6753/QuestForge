import { Router } from "express";
import { meRouter } from "../modules/users/me.routes.js";
import { sendSuccess } from "../utils/api-response.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

apiRouter.use("/v1/me", meRouter);
