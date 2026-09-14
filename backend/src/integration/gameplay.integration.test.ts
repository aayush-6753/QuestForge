import {
  PrismaClient,
  QuestCategory,
  QuestDifficulty,
  QuestStatus,
  RewardRarity,
  RewardType,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listActivity } from "../modules/activity/activity.service.js";
import { completeQuest } from "../modules/quests/quest-completion.service.js";
import { createQuest, getQuest } from "../modules/quests/quest.service.js";
import { purchaseReward, setRewardEquipped } from "../modules/rewards/reward.service.js";
import { getOrCreateUserFoundation } from "../modules/users/me.service.js";

const integrationUrl = process.env.INTEGRATION_DATABASE_URL;

if (!integrationUrl) throw new Error("Run this suite through npm run test:integration.");

const prisma = new PrismaClient({ datasources: { db: { url: integrationUrl } } });
const userOne = randomUUID();
const userTwo = randomUUID();
const slug = `integration-${randomUUID()}`;
const expensiveSlug = `integration-expensive-${randomUUID()}`;
let rewardId: string;
let expensiveRewardId: string;

describe("real database gameplay", () => {
  beforeAll(async () => {
    await getOrCreateUserFoundation(prisma, userOne);
    await getOrCreateUserFoundation(prisma, userTwo);
    await prisma.character.update({ where: { userId: userOne }, data: { gold: 100 } });
    const reward = await prisma.rewardItem.create({
      data: {
        slug,
        name: "Integration Pathfinder",
        description: "Created only for the isolated integration suite.",
        type: RewardType.TITLE,
        rarity: RewardRarity.COMMON,
        priceGold: 20,
      },
    });
    rewardId = reward.id;
    const expensiveReward = await prisma.rewardItem.create({
      data: {
        slug: expensiveSlug,
        name: "Unaffordable Integration Reward",
        description: "Proves failed purchases roll back.",
        type: RewardType.BADGE,
        rarity: RewardRarity.LEGENDARY,
        priceGold: 10_000,
      },
    });
    expensiveRewardId = expensiveReward.id;
  });

  afterAll(async () => {
    await prisma.profile.deleteMany({ where: { userId: { in: [userOne, userTwo] } } });
    await prisma.rewardItem.deleteMany({ where: { slug: { in: [slug, expensiveSlug] } } });
    await prisma.$disconnect();
  });

  it("proves ownership, completion and purchase concurrency, persistence, and equipment", async () => {
    const quest = await createQuest(prisma, userOne, {
      title: "Integration quest",
      category: QuestCategory.WORK,
      difficulty: QuestDifficulty.EPIC,
    });

    await expect(getQuest(prisma, userTwo, quest.id)).rejects.toMatchObject({ code: "QUEST_NOT_FOUND" });

    const completions = await Promise.allSettled([
      completeQuest(prisma, userOne, quest.id),
      completeQuest(prisma, userOne, quest.id),
    ]);
    expect(completions.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await prisma.questCompletion.count({ where: { questId: quest.id, userId: userOne } })).toBe(1);

    const purchases = await Promise.allSettled([
      purchaseReward(prisma, userOne, rewardId),
      purchaseReward(prisma, userOne, rewardId),
    ]);
    expect(purchases.filter((result) => result.status === "fulfilled")).toHaveLength(1);

    const inventory = await prisma.inventoryItem.findUniqueOrThrow({
      where: { userId_rewardItemId: { userId: userOne, rewardItemId: rewardId } },
    });
    expect((await prisma.character.findUniqueOrThrow({ where: { userId: userOne } })).gold).toBe(120);
    await expect(purchaseReward(prisma, userOne, expensiveRewardId)).rejects.toMatchObject({
      code: "INSUFFICIENT_GOLD",
    });
    expect(await prisma.inventoryItem.count({ where: { userId: userOne, rewardItemId: expensiveRewardId } })).toBe(0);
    expect((await prisma.character.findUniqueOrThrow({ where: { userId: userOne } })).gold).toBe(120);
    await expect(setRewardEquipped(prisma, userTwo, inventory.id, true)).rejects.toMatchObject({
      code: "INVENTORY_ITEM_NOT_FOUND",
    });

    await setRewardEquipped(prisma, userOne, inventory.id, true);
    expect((await prisma.inventoryItem.findUniqueOrThrow({ where: { id: inventory.id } })).isEquipped).toBe(true);
    expect((await prisma.profile.findUniqueOrThrow({ where: { userId: userOne } })).title).toBe("Integration Pathfinder");

    const activity = await listActivity(prisma, userOne, { limit: 50 });
    expect(activity.items.map((event) => event.type)).toEqual(
      expect.arrayContaining(["QUEST_CREATED", "QUEST_COMPLETED", "REWARD_PURCHASED", "REWARD_EQUIPPED"]),
    );
    expect(activity.items.every((event, index, items) => index === 0 || items[index - 1]!.createdAt >= event.createdAt)).toBe(true);

    await expect(
      prisma.quest.create({
        data: {
          userId: userOne,
          title: "Invalid completed quest",
          category: QuestCategory.PERSONAL,
          difficulty: QuestDifficulty.EASY,
          targetAttribute: "DISCIPLINE",
          status: QuestStatus.COMPLETED,
          completedAt: null,
        },
      }),
    ).rejects.toBeDefined();
  });
});
