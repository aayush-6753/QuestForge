import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireAuthContext, validateRequest } from "../../utils/validate.js";
import { isValidTimezone } from "../streaks/streak.rules.js";
import { getOrCreateUserFoundation, updateUserProfile } from "./me.service.js";

const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).nullable().optional(),
    timezone: z.string().trim().min(1).max(100).refine(isValidTimezone, "Invalid IANA timezone.").optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one profile field is required.");

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

meRouter.patch("/", requireAuth, async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const input = validateRequest(updateProfileSchema, req.body);
    const data = await updateUserProfile(prisma, userId, input);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});
