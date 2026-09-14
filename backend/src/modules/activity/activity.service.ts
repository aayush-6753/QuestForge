import type { PrismaClient } from "@prisma/client";
import { ApiError } from "../../utils/api-error.js";

export type ActivityPageInput = {
  cursor?: string;
  limit: number;
};

export async function listActivity(prisma: PrismaClient, userId: string, input: ActivityPageInput) {
  if (input.cursor) {
    const cursor = await prisma.activityEvent.findFirst({
      where: { id: input.cursor, userId },
      select: { id: true },
    });

    if (!cursor) throw new ApiError(400, "INVALID_CURSOR", "Activity cursor is invalid.");
  }

  const events = await prisma.activityEvent.findMany({
    where: { userId },
    select: { id: true, type: true, metadata: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = events.length > input.limit;
  const items = events.slice(0, input.limit);

  return {
    items,
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}
