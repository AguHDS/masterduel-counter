import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { instanceApi } from "@/lib/http/instanceApi";

interface UseInstanceLikesProps {
  isAuthenticated: boolean;
  archetypeId?: string;
  instanceId?: number;
}

export const useInstanceLikes = ({
  isAuthenticated,
  archetypeId,
  instanceId,
}: UseInstanceLikesProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const queryClient = useQueryClient();

  const loadLikeStatus = async () => {
    if (isAuthenticated && archetypeId && instanceId) {
      try {
        const response = await instanceApi.getInstanceLikeStatus(
          parseInt(archetypeId),
          instanceId
        );
        setLiked(response.liked);
      } catch (error) {
        console.error("Error loading like status:", error);
      }
    } else {
      setLiked(false);
    }
  };

  const toggleLike = async () => {
    if (!isAuthenticated || !instanceId || !archetypeId) return;

    try {
      const response = await instanceApi.toggleInstanceLike(
        parseInt(archetypeId),
        instanceId
      );
      setLiked(response.liked);
      setLikeCount(response.likes);

      // Invalidate instances list query to update likes count everywhere
      queryClient.invalidateQueries({
        queryKey: ["archetypeInstances", parseInt(archetypeId)],
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like. Please try again.");
    }
  };

  return {
    liked,
    setLiked,
    likeCount,
    setLikeCount,
    loadLikeStatus,
    toggleLike,
  };
};
