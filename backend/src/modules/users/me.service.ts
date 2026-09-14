import { AttributeType, type Prisma, type PrismaClient } from "@prisma/client";

const attributeTypes = [
  AttributeType.STRENGTH,
  AttributeType.INTELLECT,
  AttributeType.DISCIPLINE,
  AttributeType.CREATIVITY,
  AttributeType.VITALITY,
] as const;

export type UpdateProfileInput = {
  displayName?: string | null;
  timezone?: string;
};

export async function ensureUserFoundation(tx: Prisma.TransactionClient, userId: string) {
  const profile = await tx.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const character = await tx.character.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await tx.attribute.createMany({
    data: attributeTypes.map((type) => ({ userId, type })),
    skipDuplicates: true,
  });

  return { profile, character };
}

export async function getOrCreateUserFoundation(prisma: PrismaClient, userId: string) {
  return prisma.$transaction(async (tx) => {
    const { profile, character } = await ensureUserFoundation(tx, userId);
    const attributes = await tx.attribute.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });

    return {
      profile,
      character,
      attributes,
    };
  });
}

export async function updateUserProfile(prisma: PrismaClient, userId: string, data: UpdateProfileInput) {
  return prisma.$transaction(async (tx) => {
    const { character } = await ensureUserFoundation(tx, userId);
    const profile = await tx.profile.update({ where: { userId }, data });
    const attributes = await tx.attribute.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });

    return { profile, character, attributes };
  });
}
