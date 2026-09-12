import { PrismaClient, RewardRarity, RewardType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.rewardItem.upsert({
    where: { slug: "wanderers-cloak" },
    update: {},
    create: {
      slug: "wanderers-cloak",
      name: "Wanderer's Cloak",
      description: "A quiet cosmetic reward for adventurers who keep showing up.",
      type: RewardType.COSMETIC,
      rarity: RewardRarity.COMMON,
      priceGold: 100,
      assetKey: "cosmetics/wanderers-cloak",
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
