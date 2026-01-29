import { useEffect } from "react";

interface CardPair {
  id: string;
  topCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  }>;
  effectiveness?: string;
  comment?: string;
}

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
}

interface UserInstanceData {
  cardPairs: Array<{
    id: number;
    topCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
    }>;
    bottomCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
    }>;
    effectiveness?: string;
    comment?: string;
  }>;
  instance: {
    id: number;
    title: string;
    generalTip?: string | null;
    likes: number;
  };
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
  } | null;
  userName?: string;
}

interface UseInstanceDataProps {
  instanceUserId?: string;
  userInstanceData?: UserInstanceData;
  isError: boolean;
  isOwner: boolean;
  onDataLoaded: (data: {
    pairs: CardPair[];
    title: string;
    generalTip: string;
    headerCard: HeaderCard | null;
    likes: number;
  }) => void;
  onNewInstance: () => void;
  onReset: () => void;
}

export const useInstanceData = ({
  instanceUserId,
  userInstanceData,
  isError,
  isOwner,
  onDataLoaded,
  onNewInstance,
  onReset,
}: UseInstanceDataProps) => {
  useEffect(() => {
    if (instanceUserId && userInstanceData) {
      // Load existing instance data
      const pairs: CardPair[] = userInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));

      const headerCard: HeaderCard | null = userInstanceData.headerCard
        ? {
            id: userInstanceData.headerCard.id,
            name: userInstanceData.headerCard.name,
            imageUrl: userInstanceData.headerCard.imageUrl,
          }
        : null;

      onDataLoaded({
        pairs,
        title: userInstanceData.instance.title || "Title",
        generalTip: userInstanceData.instance.generalTip || "",
        headerCard,
        likes: userInstanceData.instance.likes,
      });
    } else if (instanceUserId && isOwner && isError) {
      // New instance: user is owner but instance doesn't exist yet (404 error)
      onNewInstance();
    } else if (instanceUserId && !userInstanceData && !isError) {
      // Still loading, don't reset state yet
      // This prevents flickering while data is being fetched
    } else {
      onReset();
    }
  }, [instanceUserId, userInstanceData, isError, isOwner]);
};
