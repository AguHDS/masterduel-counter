import { useQuery } from "@tanstack/react-query";
import { latestUpdatesApi } from "../api/latestUpdatesApi";

export const useLatestUpdates = () => {
  return useQuery({
    queryKey: ["latestUpdates", "list"],
    queryFn: () => latestUpdatesApi.getAllLastestUpdate(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
