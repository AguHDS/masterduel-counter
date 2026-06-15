import { useEffect } from "react";
import type { CardPair } from "@/features/archetypes/types";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface CounterGuideInstanceData {
  cardPairs: Array<{
    id: number;
    pairSection?: "HANDTRAP" | "BOARD_BREAKER" | null;
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
      effectiveness?: string;
    }>;
    comment?: string;
  }>;
  instance: {
    id: number;
    title: string;
    generalTip?: string | null;
    likes: number;
    favorites: number;
    guideType?: string;
  };
  headerCard?: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlCropped: string;
  } | null;
  userName?: string;
  initialHands?: unknown; // Optional for compatibility with full guide data
}

interface UseCounterGuideDataProps {
  isCreatingNew: boolean;
  guideInstanceData?: CounterGuideInstanceData;
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

/**
 * Loads and transforms Counter guide data from the server into editor format
 * 
 * Handles three scenarios:
 * - Creating a new Counter guide: calls onNewInstance
 * - Loading existing Counter guide: transforms cardPairs data and calls onDataLoaded
 * - Error loading guide: calls onReset
 */
export const useCounterGuideData = ({
  isCreatingNew,
  guideInstanceData,
  isError,
  onDataLoaded,
  onNewInstance,
  onReset,
}: UseCounterGuideDataProps) => {
  useEffect(() => {
    if (guideInstanceData) {
      // Load existing guide instance data (published or draft)
      const pairs: CardPair[] = guideInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        section: pair.pairSection ?? null,
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
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
    } else if (isCreatingNew) {
      // Creating new guide instance (no existing data)
      onNewInstance();
    } else if (isError) {
      // Error loading existing guide instance
      onReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatingNew, guideInstanceData, isError]);
};
