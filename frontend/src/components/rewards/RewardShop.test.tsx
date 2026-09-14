import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InventoryItem, RewardItem } from "../../types/api";
import { RewardShop } from "./RewardShop";

const mocks = vi.hoisted(() => ({ purchase: vi.fn(), equip: vi.fn(), useCatalog: vi.fn(), useInventory: vi.fn() }));
vi.mock("../../hooks/useRewards", () => ({
  useCatalog: mocks.useCatalog,
  useInventory: mocks.useInventory,
  usePurchaseReward: () => ({ mutate: mocks.purchase, isPending: false, error: null }),
  useSetRewardEquipped: () => ({ mutate: mocks.equip, isPending: false, error: null }),
}));

const reward: RewardItem = {
  id: "reward-1",
  slug: "pathfinder",
  name: "Pathfinder",
  description: "A title for action.",
  type: "TITLE",
  priceGold: 20,
  rarity: "COMMON",
  assetKey: null,
  metadata: null,
};

function query(data: unknown) {
  return { data, isLoading: false, isError: false, error: null, refetch: vi.fn() };
}

describe("RewardShop", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useCatalog.mockReturnValue(query([reward]));
    mocks.useInventory.mockReturnValue(query([]));
  });

  afterEach(cleanup);

  it("purchases a server-priced reward when affordable", () => {
    render(<RewardShop gold={40} />);

    fireEvent.click(screen.getByRole("button", { name: "20 gold" }));
    expect(mocks.purchase).toHaveBeenCalledWith(reward.id);
  });

  it("shows persistent inventory equipment controls", () => {
    const owned: InventoryItem = {
      id: "inventory-1",
      userId: "user-1",
      rewardItemId: reward.id,
      isEquipped: false,
      purchasedAt: "2026-09-14T12:00:00.000Z",
      equippedAt: null,
      rewardItem: reward,
    };
    mocks.useInventory.mockReturnValue(query([owned]));

    render(<RewardShop gold={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Equip" }));
    expect(mocks.equip).toHaveBeenCalledWith({ inventoryItemId: owned.id, equipped: true });
  });
});
