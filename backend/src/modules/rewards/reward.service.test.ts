import {
  ActivityEventType,
  RewardRarity,
  RewardType,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureUserFoundation } from "../users/me.service.js";
import { listCatalog, purchaseReward, setRewardEquipped } from "./reward.service.js";

vi.mock("../users/me.service.js", () => ({ ensureUserFoundation: vi.fn() }));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const rewardId = "5debf760-d8f8-4077-8b72-e67a1df62ef6";
const inventoryItemId = "796eb5ac-8b04-4e5d-883a-28f94833bf2b";
const now = new Date("2026-09-14T12:00:00.000Z");
const reward = {
  id: rewardId,
  slug: "pathfinder",
  name: "Pathfinder",
  description: "A title.",
  type: RewardType.TITLE,
  priceGold: 20,
  rarity: RewardRarity.COMMON,
  assetKey: null,
  metadata: null,
};
const inventoryItem = {
  id: inventoryItemId,
  userId,
  rewardItemId: rewardId,
  isEquipped: false,
  purchasedAt: now,
  equippedAt: null,
  rewardItem: reward,
};

function transactionClient(tx: Prisma.TransactionClient) {
  return {
    $transaction: vi.fn(async (callback: (client: Prisma.TransactionClient) => unknown) => callback(tx)),
  } as unknown as PrismaClient;
}

describe("reward service", () => {
  beforeEach(() => vi.resetAllMocks());

  it("lists only active catalog items without internal fields", async () => {
    const findMany = vi.fn().mockResolvedValue([reward]);
    const prisma = { rewardItem: { findMany } } as unknown as PrismaClient;

    expect(await listCatalog(prisma)).toEqual([reward]);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
  });

  it("purchases once and deducts the server price atomically", async () => {
    const updatedCharacter = { userId, gold: 30 };
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: "character" }]),
      rewardItem: { findFirst: vi.fn().mockResolvedValue(reward) },
      inventoryItem: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(inventoryItem),
      },
      character: {
        findUnique: vi.fn().mockResolvedValue({ userId, gold: 50 }),
        update: vi.fn().mockResolvedValue(updatedCharacter),
      },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    const result = await purchaseReward(transactionClient(tx), userId, rewardId, now);

    expect(ensureUserFoundation).toHaveBeenCalledWith(tx, userId);
    expect(tx.character.update).toHaveBeenCalledWith({ where: { userId }, data: { gold: 30 } });
    expect(tx.inventoryItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: { userId, rewardItemId: rewardId, purchasedAt: now },
    }));
    expect(tx.activityEvent.create).toHaveBeenCalledWith({
      data: {
        userId,
        type: ActivityEventType.REWARD_PURCHASED,
        metadata: { rewardId, rewardName: reward.name, rewardType: reward.type, priceGold: 20 },
        createdAt: now,
      },
    });
    expect(result.character).toBe(updatedCharacter);
  });

  it("does not charge when gold is insufficient", async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: "character" }]),
      rewardItem: { findFirst: vi.fn().mockResolvedValue(reward) },
      inventoryItem: { findUnique: vi.fn().mockResolvedValue(null) },
      character: { findUnique: vi.fn().mockResolvedValue({ userId, gold: 10 }), update: vi.fn() },
    } as unknown as Prisma.TransactionClient;

    await expect(purchaseReward(transactionClient(tx), userId, rewardId)).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_GOLD",
    });
    expect(tx.character.update).not.toHaveBeenCalled();
  });

  it("replaces equipped rewards of the same type and updates the profile", async () => {
    const equippedItem = { ...inventoryItem, isEquipped: true, equippedAt: now };
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: "locked" }]),
      inventoryItem: {
        findFirst: vi.fn().mockResolvedValue(inventoryItem),
        findMany: vi.fn().mockResolvedValue([{ id: "old-item" }]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue(equippedItem),
      },
      profile: { update: vi.fn().mockResolvedValue({ userId, title: reward.name }) },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    const result = await setRewardEquipped(transactionClient(tx), userId, inventoryItemId, true, now);

    expect(tx.inventoryItem.findMany).toHaveBeenCalledWith({
      where: { userId, isEquipped: true, rewardItem: { type: RewardType.TITLE } },
      select: { id: true },
    });
    expect(tx.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["old-item"] } },
      data: { isEquipped: false, equippedAt: null },
    });
    expect(tx.profile.update).toHaveBeenCalledWith({ where: { userId }, data: { title: reward.name } });
    expect(result.inventoryItem).toBe(equippedItem);
  });

  it("hides foreign inventory items as not found", async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValueOnce([{ id: "character" }]).mockResolvedValueOnce([]),
    } as unknown as Prisma.TransactionClient;

    await expect(setRewardEquipped(transactionClient(tx), userId, inventoryItemId, true)).rejects.toMatchObject({
      statusCode: 404,
      code: "INVENTORY_ITEM_NOT_FOUND",
    });
  });
});
