import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireAuthContext } from "../../utils/validate.js";
import { getOrCreateUserFoundation } from "./me.service.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const data = await getOrCreateUserFoundation(prisma, userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});
