import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { ActivityPage } from "../types/api";

export function useActivity() {
  return useInfiniteQuery({
    queryKey: queryKeys.activity,
    queryFn: ({ pageParam }) =>
      apiRequest<ActivityPage>(`/api/v1/activity?limit=10${pageParam ? `&cursor=${pageParam}` : ""}`),
    initialPageParam: "" as string,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}
