import {
  ActivityEventType,
  Prisma,
  RewardType,
  type PrismaClient,
} from "@prisma/client";
import { ApiError } from "../../utils/api-error.js";
import { ensureUserFoundation } from "../users/me.service.js";

const rewardSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  type: true,
  priceGold: true,
  rarity: true,
  assetKey: true,
  metadata: true,
} satisfies Prisma.RewardItemSelect;

const inventoryInclude = {
  rewardItem: { select: rewardSelect },
} satisfies Prisma.InventoryItemInclude;

function rewardNotFound() {
  return new ApiError(404, "REWARD_NOT_FOUND", "Reward not found.");
}

function inventoryNotFound() {
  return new ApiError(
    404,
    "INVENTORY_ITEM_NOT_FOUND",
    "Inventory item not found.",
  );
}

export async function listCatalog(prisma: PrismaClient) {
  return prisma.rewardItem.findMany({
    where: { isActive: true },
    select: rewardSelect,
    orderBy: [{ priceGold: "asc" }, { name: "asc" }],
  });
}

export async function listInventory(prisma: PrismaClient, userId: string) {
  return prisma.$transaction(async (tx) => {
    await ensureUserFoundation(tx, userId);
    return tx.inventoryItem.findMany({
      where: { userId },
      include: inventoryInclude,
      orderBy: [{ isEquipped: "desc" }, { purchasedAt: "desc" }],
    });
  });
}

export async function purchaseReward(
  prisma: PrismaClient,
  userId: string,
  rewardId: string,
  now = new Date(),
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await ensureUserFoundation(tx, userId);

      const characterLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "characters"
        WHERE "user_id" = ${userId}::uuid
        FOR UPDATE
      `;
      if (characterLock.length !== 1)
        throw new ApiError(
          500,
          "FOUNDATION_ERROR",
          "Character foundation is missing.",
        );

      const reward = await tx.rewardItem.findFirst({
        where: { id: rewardId, isActive: true },
        select: rewardSelect,
      });
      if (!reward) throw rewardNotFound();

      const existing = await tx.inventoryItem.findUnique({
        where: { userId_rewardItemId: { userId, rewardItemId: rewardId } },
        select: { id: true },
      });
      if (existing)
        throw new ApiError(
          409,
          "REWARD_ALREADY_OWNED",
          "Reward is already owned.",
        );

      const character = await tx.character.findUnique({ where: { userId } });
      if (!character)
        throw new ApiError(
          500,
          "FOUNDATION_ERROR",
          "Character foundation is missing.",
        );
      if (character.gold < reward.priceGold) {
        throw new ApiError(
          409,
          "INSUFFICIENT_GOLD",
          "Not enough gold for this reward.",
        );
      }

      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: { gold: character.gold - reward.priceGold },
      });
      const inventoryItem = await tx.inventoryItem.create({
        data: { userId, rewardItemId: reward.id, purchasedAt: now },
        include: inventoryInclude,
      });
      await tx.activityEvent.create({
        data: {
          userId,
          type: ActivityEventType.REWARD_PURCHASED,
          metadata: {
            rewardId: reward.id,
            rewardName: reward.name,
            rewardType: reward.type,
            priceGold: reward.priceGold,
          },
          createdAt: now,
        },
      });

      return { inventoryItem, character: updatedCharacter };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        409,
        "REWARD_ALREADY_OWNED",
        "Reward is already owned.",
      );
    }
    throw error;
  }
}

export async function setRewardEquipped(
  prisma: PrismaClient,
  userId: string,
  inventoryItemId: string,
  equipped: boolean,
  now = new Date(),
) {
  return prisma.$transaction(async (tx) => {
    await ensureUserFoundation(tx, userId);

    const characterLock = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "characters"
      WHERE "user_id" = ${userId}::uuid
      FOR UPDATE
    `;
    if (characterLock.length !== 1)
      throw new ApiError(
        500,
        "FOUNDATION_ERROR",
        "Character foundation is missing.",
      );

    const inventoryLock = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "inventory_items"
      WHERE "id" = ${inventoryItemId}::uuid AND "user_id" = ${userId}::uuid
      FOR UPDATE
    `;
    if (inventoryLock.length !== 1) throw inventoryNotFound();

    const current = await tx.inventoryItem.findFirst({
      where: { id: inventoryItemId, userId },
      include: inventoryInclude,
    });
    if (!current) throw inventoryNotFound();

    if (current.isEquipped === equipped) {
      const profile = await tx.profile.findUnique({ where: { userId } });
      if (!profile)
        throw new ApiError(
          500,
          "FOUNDATION_ERROR",
          "Profile foundation is missing.",
        );
      return { inventoryItem: current, profile };
    }

    if (equipped) {
      const equippedOfType = await tx.inventoryItem.findMany({
        where: {
          userId,
          isEquipped: true,
          rewardItem: { type: current.rewardItem.type },
        },
        select: { id: true },
      });
      await tx.inventoryItem.updateMany({
        where: { id: { in: equippedOfType.map((item) => item.id) } },
        data: { isEquipped: false, equippedAt: null },
      });
    }

    const inventoryItem = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { isEquipped: equipped, equippedAt: equipped ? now : null },
      include: inventoryInclude,
    });

    const profileData = profileEquipmentUpdate(
      current.rewardItem.type,
      equipped,
      current.rewardItem.name,
      current.rewardItem.assetKey,
    );
    const profile = profileData
      ? await tx.profile.update({ where: { userId }, data: profileData })
      : await tx.profile.findUnique({ where: { userId } });
    if (!profile)
      throw new ApiError(
        500,
        "FOUNDATION_ERROR",
        "Profile foundation is missing.",
      );

    await tx.activityEvent.create({
      data: {
        userId,
        type: equipped
          ? ActivityEventType.REWARD_EQUIPPED
          : ActivityEventType.REWARD_UNEQUIPPED,
        metadata: {
          rewardId: current.rewardItem.id,
          rewardName: current.rewardItem.name,
          rewardType: current.rewardItem.type,
        },
        createdAt: now,
      },
    });

    return { inventoryItem, profile };
  });
}

function profileEquipmentUpdate(
  type: RewardType,
  equipped: boolean,
  name: string,
  assetKey: string | null,
) {
  if (type === RewardType.TITLE) return { title: equipped ? name : null };
  if (type === RewardType.COSMETIC)
    return { avatarKey: equipped ? assetKey : null };
  return null;
}
