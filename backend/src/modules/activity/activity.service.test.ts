import { ActivityEventType, type PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { listActivity } from "./activity.service.js";

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const cursor = "5debf760-d8f8-4077-8b72-e67a1df62ef6";

describe("activity service", () => {
  it("returns a bounded, stable, user-scoped page", async () => {
    const events = [
      { id: "1", type: ActivityEventType.QUEST_COMPLETED, metadata: null, createdAt: new Date("2026-09-14") },
      { id: "2", type: ActivityEventType.QUEST_CREATED, metadata: null, createdAt: new Date("2026-09-13") },
      { id: "3", type: ActivityEventType.QUEST_ARCHIVED, metadata: null, createdAt: new Date("2026-09-12") },
    ];
    const findFirst = vi.fn().mockResolvedValue({ id: cursor });
    const findMany = vi.fn().mockResolvedValue(events);
    const prisma = { activityEvent: { findFirst, findMany } } as unknown as PrismaClient;

    const result = await listActivity(prisma, userId, { cursor, limit: 2 });

    expect(result).toEqual({ items: events.slice(0, 2), nextCursor: "2" });
    expect(findFirst).toHaveBeenCalledWith({ where: { id: cursor, userId }, select: { id: true } });
    expect(findMany).toHaveBeenCalledWith({
      where: { userId },
      select: { id: true, type: true, metadata: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3,
      cursor: { id: cursor },
      skip: 1,
    });
  });

  it("rejects a missing or foreign cursor", async () => {
    const prisma = {
      activityEvent: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn() },
    } as unknown as PrismaClient;

    await expect(listActivity(prisma, userId, { cursor, limit: 20 })).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_CURSOR",
    });
    expect(prisma.activityEvent.findMany).not.toHaveBeenCalled();
  });
});
