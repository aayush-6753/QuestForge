import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { CompleteQuestResponse, Quest, QuestStatus, SaveQuestInput } from "../types/api";

export function useQuests(status: QuestStatus) {
  return useQuery({
    queryKey: [...queryKeys.quests, status],
    queryFn: () => apiRequest<Quest[]>(`/api/v1/quests?status=${status}`),
  });
}

function useRefreshQuests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.quests });
}

export function useCreateQuest() {
  const refreshQuests = useRefreshQuests();

  return useMutation({
    mutationFn: (input: SaveQuestInput) =>
      apiRequest<Quest>("/api/v1/quests", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: refreshQuests,
  });
}

export function useUpdateQuest() {
  const refreshQuests = useRefreshQuests();

  return useMutation({
    mutationFn: ({ questId, input }: { questId: string; input: SaveQuestInput }) =>
      apiRequest<Quest>(`/api/v1/quests/${questId}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: refreshQuests,
  });
}

export function useArchiveQuest() {
  const refreshQuests = useRefreshQuests();

  return useMutation({
    mutationFn: (questId: string) => apiRequest<Quest>(`/api/v1/quests/${questId}`, { method: "DELETE" }),
    onSuccess: refreshQuests,
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questId: string) =>
      apiRequest<CompleteQuestResponse>(`/api/v1/quests/${questId}/complete`, { method: "POST" }),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.quests }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activity }),
      ]),
  });
}
