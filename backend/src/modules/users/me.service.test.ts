import type { Prisma, PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { updateUserProfile } from "./me.service.js";

describe("updateUserProfile", () => {
  it("bootstraps and updates the profile in one transaction", async () => {
    const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
    const profile = { userId, displayName: "Aayush", timezone: "Asia/Kolkata" };
    const update = { displayName: "Aayush", timezone: "Asia/Kolkata" };
    const character = { userId, level: 1, totalXp: 0 };
    const attributes = [{ userId, type: "STRENGTH", level: 1, xp: 0 }];
    const tx = {
      profile: {
        upsert: vi.fn().mockResolvedValue({ userId }),
        update: vi.fn().mockResolvedValue(profile),
      },
      character: {
        upsert: vi.fn().mockResolvedValue(character),
      },
      attribute: {
        createMany: vi.fn().mockResolvedValue({ count: 5 }),
        findMany: vi.fn().mockResolvedValue(attributes),
      },
    } as unknown as Prisma.TransactionClient;
    const prisma = {
      $transaction: vi.fn(async (callback: (client: Prisma.TransactionClient) => unknown) => callback(tx)),
    } as unknown as PrismaClient;

    const result = await updateUserProfile(prisma, userId, update);

    expect(tx.profile.upsert).toHaveBeenCalledWith({ where: { userId }, update: {}, create: { userId } });
    expect(tx.character.upsert).toHaveBeenCalledWith({ where: { userId }, update: {}, create: { userId } });
    expect(tx.attribute.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([expect.objectContaining({ userId })]),
      skipDuplicates: true,
    });
    expect(tx.profile.update).toHaveBeenCalledWith({ where: { userId }, data: update });
    expect(result).toEqual({
      profile,
      character,
      attributes,
      progression: {
        character: {
          level: 1,
          currentLevelStartXp: 0,
          nextLevelThreshold: 100,
          xpWithinLevel: 0,
          xpRequiredForNextLevel: 100,
          percentage: 0,
        },
        attributes: [
          {
            type: "STRENGTH",
            level: 1,
            currentLevelStartXp: 0,
            nextLevelThreshold: 50,
            xpWithinLevel: 0,
            xpRequiredForNextLevel: 50,
            percentage: 0,
          },
        ],
      },
    });
  });
});
