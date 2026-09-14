import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { CompleteQuestResponse } from "../types/api";
import { useCompleteQuest } from "./useQuests";

vi.mock("../lib/api-client", () => ({ apiRequest: vi.fn() }));

const apiRequestMock = vi.mocked(apiRequest);

describe("useCompleteQuest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reconciles quest, character, and activity caches after completion", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    apiRequestMock.mockResolvedValue({} as CompleteQuestResponse);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCompleteQuest(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("5debf760-d8f8-4077-8b72-e67a1df62ef6");
    });

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/api/v1/quests/5debf760-d8f8-4077-8b72-e67a1df62ef6/complete",
      { method: "POST" },
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.quests });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.activity });
  });
});
