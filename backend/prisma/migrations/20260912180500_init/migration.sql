-- Required for gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "attribute_type" AS ENUM ('strength', 'intellect', 'discipline', 'creativity', 'vitality');

-- CreateEnum
CREATE TYPE "quest_difficulty" AS ENUM ('easy', 'medium', 'hard', 'epic');

-- CreateEnum
CREATE TYPE "quest_status" AS ENUM ('active', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "quest_category" AS ENUM ('fitness', 'learning', 'work', 'creative', 'wellness', 'personal');

-- CreateEnum
CREATE TYPE "quest_recurrence" AS ENUM ('none', 'daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "reward_type" AS ENUM ('cosmetic', 'title', 'theme', 'badge');

-- CreateEnum
CREATE TYPE "reward_rarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- CreateEnum
CREATE TYPE "activity_event_type" AS ENUM ('quest_created', 'quest_completed', 'quest_archived', 'level_up', 'streak_updated', 'reward_purchased', 'reward_equipped');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "display_name" TEXT,
    "avatar_key" TEXT,
    "title" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "attribute_type" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "quest_category" NOT NULL,
    "difficulty" "quest_difficulty" NOT NULL,
    "target_attribute" "attribute_type" NOT NULL,
    "status" "quest_status" NOT NULL DEFAULT 'active',
    "recurrence" "quest_recurrence" NOT NULL DEFAULT 'none',
    "base_xp" INTEGER NOT NULL DEFAULT 10,
    "base_gold" INTEGER NOT NULL DEFAULT 5,
    "due_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_completions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "completed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awarded_xp" INTEGER NOT NULL,
    "awarded_gold" INTEGER NOT NULL,
    "attribute_type" "attribute_type" NOT NULL,
    "awarded_attribute_xp" INTEGER NOT NULL,

    CONSTRAINT "quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "reward_type" NOT NULL,
    "price_gold" INTEGER NOT NULL,
    "rarity" "reward_rarity" NOT NULL,
    "asset_key" TEXT,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reward_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "reward_item_id" UUID NOT NULL,
    "is_equipped" BOOLEAN NOT NULL DEFAULT false,
    "purchased_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipped_at" TIMESTAMPTZ(3),

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "activity_event_type" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "characters_user_id_key" ON "characters"("user_id");

-- CreateIndex
CREATE INDEX "characters_level_idx" ON "characters"("level");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_user_id_type_key" ON "attributes"("user_id", "type");

-- CreateIndex
CREATE INDEX "quests_user_id_status_due_at_idx" ON "quests"("user_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "quests_user_id_category_idx" ON "quests"("user_id", "category");

-- CreateIndex
CREATE INDEX "quest_completions_user_id_completed_at_idx" ON "quest_completions"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "quest_completions_quest_id_idx" ON "quest_completions"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "reward_items_slug_key" ON "reward_items"("slug");

-- CreateIndex
CREATE INDEX "reward_items_is_active_rarity_idx" ON "reward_items"("is_active", "rarity");

-- CreateIndex
CREATE INDEX "inventory_items_reward_item_id_idx" ON "inventory_items"("reward_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_user_id_reward_item_id_key" ON "inventory_items"("user_id", "reward_item_id");

-- CreateIndex
CREATE INDEX "activity_events_user_id_created_at_idx" ON "activity_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_events_user_id_type_created_at_idx" ON "activity_events"("user_id", "type", "created_at");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_reward_item_id_fkey" FOREIGN KEY ("reward_item_id") REFERENCES "reward_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Base integrity checks for server-owned progression values.
ALTER TABLE "characters" ADD CONSTRAINT "characters_level_check" CHECK ("level" >= 1);
ALTER TABLE "characters" ADD CONSTRAINT "characters_total_xp_check" CHECK ("total_xp" >= 0);
ALTER TABLE "characters" ADD CONSTRAINT "characters_gold_check" CHECK ("gold" >= 0);
ALTER TABLE "characters" ADD CONSTRAINT "characters_current_streak_check" CHECK ("current_streak" >= 0);
ALTER TABLE "characters" ADD CONSTRAINT "characters_longest_streak_check" CHECK ("longest_streak" >= 0);
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_level_check" CHECK ("level" >= 1);
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_xp_check" CHECK ("xp" >= 0);
ALTER TABLE "quests" ADD CONSTRAINT "quests_base_xp_check" CHECK ("base_xp" >= 0);
ALTER TABLE "quests" ADD CONSTRAINT "quests_base_gold_check" CHECK ("base_gold" >= 0);
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_awarded_xp_check" CHECK ("awarded_xp" >= 0);
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_awarded_gold_check" CHECK ("awarded_gold" >= 0);
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_awarded_attribute_xp_check" CHECK ("awarded_attribute_xp" >= 0);
ALTER TABLE "reward_items" ADD CONSTRAINT "reward_items_price_gold_check" CHECK ("price_gold" >= 0);

-- Supabase Data API lockdown. Gameplay state is owned by the Express API.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "characters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attributes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quest_completions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reward_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_events" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  "profiles",
  "characters",
  "attributes",
  "quests",
  "quest_completions",
  "reward_items",
  "inventory_items",
  "activity_events"
FROM anon, authenticated;
