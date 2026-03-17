import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { instanceApi } from "@/lib/http/instanceApi";

interface UseInstanceGuideLikesProps {
  isAuthenticated: boolean;
  archetypeId?: string;
  instanceId?: number;
  userId?: string;
  ownerId?: string;
}

export const useInstanceGuideLikes = ({
  isAuthenticated,
  archetypeId,
  instanceId,
  userId,
  ownerId,
}: UseInstanceGuideLikesProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const queryClient = useQueryClient();

  const loadLikeStatus = async () => {
    if (isAuthenticated && archetypeId && instanceId) {
      try {
        const response = await instanceApi.getGuideLikeStatus(
          parseInt(archetypeId),
          instanceId,
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

    if (userId && ownerId && userId === ownerId) {
      alert("You cannot like your own guide");
      return;
    }

    try {
      const response = await instanceApi.toggleLike(
        parseInt(archetypeId),
        instanceId,
      );
      setLiked(response.liked);
      setLikeCount(response.likes);

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
