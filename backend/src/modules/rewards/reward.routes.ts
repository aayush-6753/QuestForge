import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireAuthContext, validateRequest } from "../../utils/validate.js";
import { listCatalog, listInventory, purchaseReward, setRewardEquipped } from "./reward.service.js";

const idSchema = z.string().uuid();
const emptyBodySchema = z.object({}).strict();

export const rewardRouter = Router();

rewardRouter.use(requireAuth);

rewardRouter.get("/", async (_req, res, next) => {
  try {
    sendSuccess(res, await listCatalog(prisma));
  } catch (error) {
    next(error);
  }
});

rewardRouter.post("/:rewardId/purchase", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const rewardId = validateRequest(idSchema, req.params.rewardId);
    validateRequest(emptyBodySchema, req.body ?? {});
    sendSuccess(res, await purchaseReward(prisma, userId, rewardId), 201);
  } catch (error) {
    next(error);
  }
});

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

inventoryRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    sendSuccess(res, await listInventory(prisma, userId));
  } catch (error) {
    next(error);
  }
});

for (const [path, equipped] of [["equip", true], ["unequip", false]] as const) {
  inventoryRouter.post(`/:inventoryItemId/${path}`, async (req, res, next) => {
    try {
      const { userId } = requireAuthContext(req);
      const inventoryItemId = validateRequest(idSchema, req.params.inventoryItemId);
      validateRequest(emptyBodySchema, req.body ?? {});
      sendSuccess(res, await setRewardEquipped(prisma, userId, inventoryItemId, equipped));
    } catch (error) {
      next(error);
    }
  });
}
