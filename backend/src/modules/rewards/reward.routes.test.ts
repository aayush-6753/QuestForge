import { RewardRarity, RewardType } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { supabase } from "../../lib/supabase.js";
import { listCatalog, listInventory, purchaseReward, setRewardEquipped } from "./reward.service.js";

vi.mock("../../lib/supabase.js", () => ({ supabase: { auth: { getUser: vi.fn() } } }));
vi.mock("./reward.service.js", () => ({
  listCatalog: vi.fn(),
  listInventory: vi.fn(),
  purchaseReward: vi.fn(),
  setRewardEquipped: vi.fn(),
}));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const rewardId = "5debf760-d8f8-4077-8b72-e67a1df62ef6";
const inventoryItemId = "796eb5ac-8b04-4e5d-883a-28f94833bf2b";
const authorization = { Authorization: "Bearer valid-token" };
const reward = {
  id: rewardId,
  slug: "pathfinder",
  name: "Pathfinder",
  description: "A title.",
  type: RewardType.TITLE,
  priceGold: 20,
  rarity: RewardRarity.COMMON,
  assetKey: null,
  metadata: null,
};

describe("reward routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: userId } }, error: null });
    vi.mocked(listCatalog).mockResolvedValue([reward]);
    vi.mocked(listInventory).mockResolvedValue([]);
    vi.mocked(purchaseReward).mockResolvedValue({ inventoryItem: {} as never, character: {} as never });
    vi.mocked(setRewardEquipped).mockResolvedValue({ inventoryItem: {} as never, profile: {} as never });
  });

  it("exposes catalog and owned inventory", async () => {
    expect((await request(app).get("/api/v1/rewards").set(authorization)).status).toBe(200);
    expect((await request(app).get("/api/v1/inventory").set(authorization)).status).toBe(200);
    expect(listInventory).toHaveBeenCalledWith(expect.anything(), userId);
  });

  it("purchases without accepting client prices", async () => {
    const response = await request(app).post(`/api/v1/rewards/${rewardId}/purchase`).set(authorization);

    expect(response.status).toBe(201);
    expect(purchaseReward).toHaveBeenCalledWith(expect.anything(), userId, rewardId);

    const rejected = await request(app)
      .post(`/api/v1/rewards/${rewardId}/purchase`)
      .set(authorization)
      .send({ priceGold: 0 });
    expect(rejected.status).toBe(400);
  });

  it.each([["equip", true], ["unequip", false]] as const)("supports %s", async (action, equipped) => {
    const response = await request(app)
      .post(`/api/v1/inventory/${inventoryItemId}/${action}`)
      .set(authorization);

    expect(response.status).toBe(200);
    expect(setRewardEquipped).toHaveBeenCalledWith(expect.anything(), userId, inventoryItemId, equipped);
  });
});
