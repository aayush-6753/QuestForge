import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../lib/api-client";
import { useActivity } from "./useActivity";

vi.mock("../lib/api-client", () => ({ apiRequest: vi.fn() }));

describe("useActivity", () => {
  beforeEach(() => vi.resetAllMocks());

  it("loads the next cursor without duplicating request state", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ items: [{ id: "first" }], nextCursor: "cursor-1" })
      .mockResolvedValueOnce({ items: [{ id: "second" }], nextCursor: null });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useActivity(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => void (await result.current.fetchNextPage()));

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/api/v1/activity?limit=10");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/api/v1/activity?limit=10&cursor=cursor-1");
    expect(apiRequest).toHaveBeenCalledTimes(2);
  });
});
