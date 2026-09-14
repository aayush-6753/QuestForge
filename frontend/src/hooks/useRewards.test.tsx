import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import { usePurchaseReward, useSetRewardEquipped } from "./useRewards";

vi.mock("../lib/api-client", () => ({ apiRequest: vi.fn() }));

describe("reward mutations", () => {
  beforeEach(() => vi.resetAllMocks());

  it("refreshes economy state after a purchase", async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePurchaseReward(), { wrapper });

    await act(async () => void (await result.current.mutateAsync("reward-1")));

    expect(apiRequest).toHaveBeenCalledWith("/api/v1/rewards/reward-1/purchase", { method: "POST" });
    for (const queryKey of [queryKeys.shop, queryKeys.inventory, queryKeys.me, queryKeys.activity]) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey });
    }
  });

  it("uses explicit equip and unequip endpoints", async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSetRewardEquipped(), { wrapper });

    await act(async () => void (await result.current.mutateAsync({ inventoryItemId: "item-1", equipped: true })));
    await act(async () => void (await result.current.mutateAsync({ inventoryItemId: "item-1", equipped: false })));

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/v1/inventory/item-1/equip", { method: "POST" });
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/v1/inventory/item-1/unequip", { method: "POST" });
  });
});
