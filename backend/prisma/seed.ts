import { PrismaClient, RewardRarity, RewardType } from "@prisma/client";

const prisma = new PrismaClient();

const catalog = [
  {
    slug: "wanderers-cloak",
    name: "Wanderer's Cloak",
    description: "A quiet cloak for adventurers who keep showing up.",
    type: RewardType.COSMETIC,
    rarity: RewardRarity.COMMON,
    priceGold: 20,
    assetKey: "cosmetics/wanderers-cloak",
  },
  {
    slug: "ember-mantle",
    name: "Ember Mantle",
    description: "A bright mantle earned through steady momentum.",
    type: RewardType.COSMETIC,
    rarity: RewardRarity.RARE,
    priceGold: 80,
    assetKey: "cosmetics/ember-mantle",
  },
  {
    slug: "pathfinder",
    name: "Pathfinder",
    description: "A title for those who turn intentions into action.",
    type: RewardType.TITLE,
    rarity: RewardRarity.COMMON,
    priceGold: 20,
    assetKey: null,
  },
  {
    slug: "relentless",
    name: "The Relentless",
    description: "A title reserved for committed adventurers.",
    type: RewardType.TITLE,
    rarity: RewardRarity.EPIC,
    priceGold: 160,
    assetKey: null,
  },
  {
    slug: "verdant-journal",
    name: "Verdant Journal",
    description: "A calm green theme for the next chapter.",
    type: RewardType.THEME,
    rarity: RewardRarity.RARE,
    priceGold: 100,
    assetKey: "themes/verdant-journal",
  },
  {
    slug: "first-light",
    name: "First Light",
    description: "A badge for beginning the journey with purpose.",
    type: RewardType.BADGE,
    rarity: RewardRarity.COMMON,
    priceGold: 40,
    assetKey: "badges/first-light",
  },
] as const;

async function main() {
  await prisma.$transaction(
    catalog.map((item) =>
      prisma.rewardItem.upsert({
        where: { slug: item.slug },
        update: { ...item, isActive: true },
        create: { ...item, isActive: true },
      }),
    ),
  );
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
