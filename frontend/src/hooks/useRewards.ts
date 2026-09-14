import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { EquipRewardResponse, InventoryItem, PurchaseRewardResponse, RewardItem } from "../types/api";

export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.shop,
    queryFn: () => apiRequest<RewardItem[]>("/api/v1/rewards"),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => apiRequest<InventoryItem[]>("/api/v1/inventory"),
  });
}

function useRefreshRewards() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.shop }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
    ]);
}

export function usePurchaseReward() {
  const refresh = useRefreshRewards();
  return useMutation({
    mutationFn: (rewardId: string) =>
      apiRequest<PurchaseRewardResponse>(`/api/v1/rewards/${rewardId}/purchase`, { method: "POST" }),
    onSettled: refresh,
  });
}

export function useSetRewardEquipped() {
  const refresh = useRefreshRewards();
  return useMutation({
    mutationFn: ({ inventoryItemId, equipped }: { inventoryItemId: string; equipped: boolean }) =>
      apiRequest<EquipRewardResponse>(
        `/api/v1/inventory/${inventoryItemId}/${equipped ? "equip" : "unequip"}`,
        { method: "POST" },
      ),
    onSettled: refresh,
  });
}
