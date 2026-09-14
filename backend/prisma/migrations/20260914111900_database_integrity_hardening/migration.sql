-- One permanent completion per quest, with ownership enforced by PostgreSQL.
ALTER TABLE "quests"
  ADD CONSTRAINT "quests_id_user_id_key" UNIQUE ("id", "user_id");

ALTER TABLE "quest_completions"
  ADD CONSTRAINT "quest_completions_quest_id_user_id_key" UNIQUE ("quest_id", "user_id");

ALTER TABLE "quest_completions"
  ADD CONSTRAINT "quest_completions_quest_id_user_id_fkey"
  FOREIGN KEY ("quest_id", "user_id")
  REFERENCES "quests"("id", "user_id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "quest_completions"
  DROP CONSTRAINT "quest_completions_quest_id_fkey";

-- Row-level domain invariants. NOT VALID reduces the initial lock duration;
-- validation still checks every existing row before this migration completes.
ALTER TABLE "quests"
  ADD CONSTRAINT "quests_title_nonempty_check"
  CHECK (length(btrim("title")) > 0) NOT VALID;

ALTER TABLE "quests"
  ADD CONSTRAINT "quests_status_completed_at_check"
  CHECK (("status" = 'completed') = ("completed_at" IS NOT NULL)) NOT VALID;

ALTER TABLE "characters"
  ADD CONSTRAINT "characters_streak_order_check"
  CHECK ("longest_streak" >= "current_streak") NOT VALID;

ALTER TABLE "quests" VALIDATE CONSTRAINT "quests_title_nonempty_check";
ALTER TABLE "quests" VALIDATE CONSTRAINT "quests_status_completed_at_check";
ALTER TABLE "characters" VALIDATE CONSTRAINT "characters_streak_order_check";
