import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { MeResponse } from "../types/api";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiRequest<MeResponse>("/api/v1/me"),
  });
}
