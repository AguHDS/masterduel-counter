import { useQuery } from "@tanstack/react-query";
import { latestUpdatesApi } from "../api/latestUpdatesApi";

export const useAllLatestUpdates = (page: number, limit: number = 20) => {
  return useQuery({
    queryKey: ["latestUpdates", "paginated", page, limit],
    queryFn: () => latestUpdatesApi.getAllPaginatedLastestUpdates(page, limit),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
