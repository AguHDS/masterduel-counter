import { useEffect } from "react";

interface CardPair {
  id: string;
  topCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
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
      imageUrlCropped: string;
    }>;
    bottomCards: Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>;
    effectiveness?: string;
    comment?: string;
  }>;
  instance: {
    id: number;
    title: string;
    generalTip?: string | null;
    likes: number;
    favorites: number;
  };
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
  } | null;
  userName?: string;
}

interface UseInstanceDataProps {
  isCreatingNew: boolean;
  userInstanceData?: UserInstanceData;
  isError: boolean;
  isOwner: boolean;
  onDataLoaded: (data: {
    pairs: CardPair[];
    title: string;
    generalTip: string;
    headerCard: HeaderCard | null;
    likes: number;
    favorites: number;
  }) => void;
  onNewInstance: () => void;
  onReset: () => void;
}

export const useInstanceData = ({
  isCreatingNew,
  userInstanceData,
  isError,
  onDataLoaded,
  onNewInstance,
  onReset,
}: UseInstanceDataProps) => {
  useEffect(() => {
    if (isCreatingNew) {
      // Creating new instance
      onNewInstance();
    } else if (userInstanceData) {
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
        favorites: userInstanceData.instance.favorites,
      });
    } else if (!isCreatingNew && isError) {
      // Error loading existing instance
      onReset();
    }
  }, [isCreatingNew, userInstanceData, isError]);
};
