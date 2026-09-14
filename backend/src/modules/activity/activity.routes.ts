import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireAuthContext, validateRequest } from "../../utils/validate.js";
import { listActivity } from "./activity.service.js";

const listActivitySchema = z
  .object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export const activityRouter = Router();

activityRouter.use(requireAuth);

activityRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const input = validateRequest(listActivitySchema, req.query);
    sendSuccess(res, await listActivity(prisma, userId, input));
  } catch (error) {
    next(error);
  }
});
