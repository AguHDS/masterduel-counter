import { useQuery } from "@tanstack/react-query";
import { latestUpdatesApi } from "../api/latestUpdatesApi";

export const useLatestUpdateById = (id: number | null) => {
  return useQuery({
    queryKey: ["latestUpdates", "detail", id],
    queryFn: () => latestUpdatesApi.getLastestUpdatesById(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
