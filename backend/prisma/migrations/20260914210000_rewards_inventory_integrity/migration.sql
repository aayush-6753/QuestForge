ALTER TYPE "activity_event_type" ADD VALUE IF NOT EXISTS 'reward_unequipped';

ALTER TABLE "inventory_items"
  ADD CONSTRAINT "inventory_items_equipped_at_check"
  CHECK (("is_equipped" = true) = ("equipped_at" IS NOT NULL)) NOT VALID;

ALTER TABLE "inventory_items"
  VALIDATE CONSTRAINT "inventory_items_equipped_at_check";

CREATE INDEX "inventory_items_user_id_is_equipped_idx"
  ON "inventory_items"("user_id", "is_equipped");
