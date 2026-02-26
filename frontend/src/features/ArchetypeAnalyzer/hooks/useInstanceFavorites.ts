import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { instanceApi } from "@/lib/http/instanceApi";

interface UseInstanceFavoritesProps {
  isAuthenticated: boolean;
  archetypeId?: string;
  instanceId?: number;
}

export const useInstanceFavorites = ({
  isAuthenticated,
  archetypeId,
  instanceId,
}: UseInstanceFavoritesProps) => {
  const [favorited, setFavorited] = useState(false);
  const queryClient = useQueryClient();

  const loadFavoriteStatus = async () => {
    if (isAuthenticated && archetypeId && instanceId) {
      try {
        const response = await instanceApi.getInstanceFavoriteStatus(
          parseInt(archetypeId),
          instanceId,
        );
        setFavorited(response.favorited);
      } catch (error) {
        console.error("Error loading favorite status:", error);
      }
    } else {
      setFavorited(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated || !instanceId || !archetypeId) return;

    try {
      const response = await instanceApi.toggleInstanceFavorite(
        parseInt(archetypeId),
        instanceId,
      );
      setFavorited(response.favorited);

      // Invalidate relevant queries to update lists
      queryClient.invalidateQueries({
        queryKey: ["archetypeInstances", parseInt(archetypeId)],
      });
      // Also invalidate profile queries if they exist
      queryClient.invalidateQueries({
        queryKey: ["favoritedGuides"],
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite. Please try again.");
    }
  };

  return {
    favorited,
    setFavorited,
    loadFavoriteStatus,
    toggleFavorite,
  };
};
