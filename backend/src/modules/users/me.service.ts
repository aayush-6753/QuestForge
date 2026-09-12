import { AttributeType, type PrismaClient } from "@prisma/client";

const attributeTypes = [
  AttributeType.STRENGTH,
  AttributeType.INTELLECT,
  AttributeType.DISCIPLINE,
  AttributeType.CREATIVITY,
  AttributeType.VITALITY,
] as const;

export async function getOrCreateUserFoundation(prisma: PrismaClient, userId: string) {
  return prisma.$transaction(async (tx) => {
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
