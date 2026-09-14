import { QuestCategory, QuestDifficulty, QuestStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";
import { requireAuthContext, validateRequest } from "../../utils/validate.js";
import { completeQuest } from "./quest-completion.service.js";
import { archiveQuest, createQuest, getQuest, listQuests, updateQuest } from "./quest.service.js";

const titleSchema = z.string().trim().min(1).max(120);
const descriptionSchema = z.string().trim().min(1).max(2_000).nullable().optional();
const dueAtSchema = z.string().datetime({ offset: true }).transform((value) => new Date(value)).nullable();

const createQuestSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    category: z.nativeEnum(QuestCategory),
    difficulty: z.nativeEnum(QuestDifficulty),
    dueAt: dueAtSchema.optional(),
  })
  .strict()
  .refine((data) => !data.dueAt || data.dueAt.getTime() > Date.now(), {
    message: "Quest due date must be in the future.",
    path: ["dueAt"],
  });

const updateQuestSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    category: z.nativeEnum(QuestCategory).optional(),
    difficulty: z.nativeEnum(QuestDifficulty).optional(),
    dueAt: dueAtSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one quest field is required.");

const listQuestSchema = z.object({ status: z.nativeEnum(QuestStatus).optional() }).strict();
const questIdSchema = z.string().uuid();
const emptyBodySchema = z.object({}).strict();

export const questRouter = Router();

questRouter.use(requireAuth);

questRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const { status } = validateRequest(listQuestSchema, req.query);
    sendSuccess(res, await listQuests(prisma, userId, status));
  } catch (error) {
    next(error);
  }
});

questRouter.post("/", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const input = validateRequest(createQuestSchema, req.body);
    sendSuccess(res, await createQuest(prisma, userId, input), 201);
  } catch (error) {
    next(error);
  }
});

questRouter.post("/:questId/complete", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const questId = validateRequest(questIdSchema, req.params.questId);
    validateRequest(emptyBodySchema, req.body ?? {});
    sendSuccess(res, await completeQuest(prisma, userId, questId));
  } catch (error) {
    next(error);
  }
});

questRouter.get("/:questId", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const questId = validateRequest(questIdSchema, req.params.questId);
    sendSuccess(res, await getQuest(prisma, userId, questId));
  } catch (error) {
    next(error);
  }
});

questRouter.patch("/:questId", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const questId = validateRequest(questIdSchema, req.params.questId);
    const input = validateRequest(updateQuestSchema, req.body);
    sendSuccess(res, await updateQuest(prisma, userId, questId, input));
  } catch (error) {
    next(error);
  }
});

questRouter.delete("/:questId", async (req, res, next) => {
  try {
    const { userId } = requireAuthContext(req);
    const questId = validateRequest(questIdSchema, req.params.questId);
    sendSuccess(res, await archiveQuest(prisma, userId, questId));
  } catch (error) {
    next(error);
  }
});
