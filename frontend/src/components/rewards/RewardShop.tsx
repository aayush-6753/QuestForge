import { Badge, Check, Gift, Palette, Shirt, ShoppingCart, Store, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalog, useInventory, usePurchaseReward, useSetRewardEquipped } from "../../hooks/useRewards";
import { cn } from "../../lib/cn";
import type { InventoryItem, RewardItem, RewardType } from "../../types/api";
import { Button } from "../ui/AppButton";

const rewardIcons: Record<RewardType, LucideIcon> = {
  COSMETIC: Shirt,
  TITLE: Tag,
  THEME: Palette,
  BADGE: Badge,
};

function RewardRow({
  reward,
  owned,
  gold,
  pending,
  onPurchase,
  onEquip,
}: {
  reward: RewardItem;
  owned?: InventoryItem;
  gold: number;
  pending: boolean;
  onPurchase: () => void;
  onEquip: (equipped: boolean) => void;
}) {
  const Icon = rewardIcons[reward.type] ?? Gift;
  return (
    <li className="grid gap-3 py-4 first:pt-1 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex min-w-0 gap-3">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-emerald" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-vellum">{reward.name}</h3>
            <span className="text-xs font-bold uppercase text-ember">{reward.rarity}</span>
          </div>
          <p className="mt-1 text-sm leading-5 text-parchment/65">{reward.description}</p>
          <p className="mt-1 text-xs uppercase text-parchment/50">{reward.type}</p>
        </div>
      </div>

      {owned ? (
        <Button variant={owned.isEquipped ? "secondary" : "primary"} disabled={pending} onClick={() => onEquip(!owned.isEquipped)}>
          <Check className="h-4 w-4" aria-hidden="true" />
          {owned.isEquipped ? "Unequip" : "Equip"}
        </Button>
      ) : (
        <Button disabled={pending || gold < reward.priceGold} onClick={onPurchase}>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {reward.priceGold} gold
        </Button>
      )}
    </li>
  );
}

export function RewardShop({ gold }: { gold: number }) {
  const [view, setView] = useState<"catalog" | "inventory">("catalog");
  const catalog = useCatalog();
  const inventory = useInventory();
  const purchase = usePurchaseReward();
  const equipment = useSetRewardEquipped();
  const ownedByRewardId = useMemo(
    () => new Map(inventory.data?.map((item) => [item.rewardItemId, item]) ?? []),
    [inventory.data],
  );
  const rewards = view === "catalog" ? catalog.data ?? [] : inventory.data?.map((item) => item.rewardItem) ?? [];
  const activeQuery = view === "catalog" ? catalog : inventory;
  const mutationError = purchase.error ?? equipment.error;
  const pending = purchase.isPending || equipment.isPending;

  return (
    <section id="shop" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Store className="mt-1 h-6 w-6 text-emerald" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase text-ember">Rewards</p>
            <h2 className="font-display text-2xl text-vellum">Guild Shop</h2>
          </div>
        </div>
        <p className="text-sm font-bold text-ember">{gold} gold</p>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-md border border-vellum/10 p-1" aria-label="Reward view">
        {(["catalog", "inventory"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              "min-h-10 rounded px-3 text-sm font-semibold capitalize text-parchment/65 transition",
              view === option && "bg-ember text-ink",
            )}
            aria-pressed={view === option}
            onClick={() => setView(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {activeQuery.isLoading ? <p className="mt-5 text-sm text-parchment/70">Opening the shop...</p> : null}
      {activeQuery.isError ? (
        <div className="mt-5" role="alert">
          <p className="text-sm text-ruby">{activeQuery.error.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void activeQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : null}
      {mutationError ? <p className="mt-4 text-sm text-ruby" role="alert">{mutationError.message}</p> : null}

      {!activeQuery.isLoading && !activeQuery.isError && rewards.length === 0 ? (
        <p className="mt-5 text-sm text-parchment/70">
          {view === "inventory" ? "Your inventory is empty." : "No rewards are available."}
        </p>
      ) : null}

      {rewards.length > 0 ? (
        <ul className="mt-4 divide-y divide-vellum/10">
          {rewards.map((reward) => {
            const owned = ownedByRewardId.get(reward.id);
            return (
              <RewardRow
                key={reward.id}
                reward={reward}
                owned={owned}
                gold={gold}
                pending={pending}
                onPurchase={() => purchase.mutate(reward.id)}
                onEquip={(equipped) => owned && equipment.mutate({ inventoryItemId: owned.id, equipped })}
              />
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
