import { useEffect } from "react";
import type { CardPair } from "@/features/archetypes/types";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface GuideInstanceData {
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
    imageUrlCropped: string;
  } | null;
  userName?: string;
}

interface UseInstanceGuideDataProps {
  isCreatingNew: boolean;
  guideInstanceData?: GuideInstanceData;
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

export const useInstanceGuideData = ({
  isCreatingNew,
  guideInstanceData,
  isError,
  onDataLoaded,
  onNewInstance,
  onReset,
}: UseInstanceGuideDataProps) => {
  useEffect(() => {
    if (isCreatingNew) {
      // Creating new instance
      onNewInstance();
    } else if (guideInstanceData) {
      // Load existing instance data
      const pairs: CardPair[] = guideInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));

      const headerCard: HeaderCard | null = guideInstanceData.headerCard
        ? {
            id: guideInstanceData.headerCard.id,
            name: guideInstanceData.headerCard.name,
            imageUrl: guideInstanceData.headerCard.imageUrl,
            imageUrlCropped: guideInstanceData.headerCard.imageUrlCropped,
          }
        : null;

      onDataLoaded({
        pairs,
        title: guideInstanceData.instance.title || "Title",
        generalTip: guideInstanceData.instance.generalTip || "",
        headerCard,
        likes: guideInstanceData.instance.likes,
        favorites: guideInstanceData.instance.favorites,
      });
    } else if (!isCreatingNew && isError) {
      // Error loading existing instance
      onReset();
    }
  }, [isCreatingNew, guideInstanceData, isError]);
};
