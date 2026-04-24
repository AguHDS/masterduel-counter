import { useState } from "react";
import type { CardPair, Card } from "@/features/archetypes/types";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

export type { HeaderCard };

/** Hook to handle the state and logic for editing an instance of a guide */
export const useInstanceGuideEditor = (initialData?: {
  title?: string;
  generalTip?: string;
  headerCard?: HeaderCard | null;
  pairs?: CardPair[];
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadedPairs, setLoadedPairs] = useState<CardPair[]>(
    initialData?.pairs || [],
  );
  const [headerCard, setHeaderCard] = useState<HeaderCard | null>(
    initialData?.headerCard || null,
  );
  const [title, setTitle] = useState<string>(initialData?.title || "Title");
  const [generalTip, setGeneralTip] = useState<string>(
    initialData?.generalTip || "",
  );
  const [isSelectingHeader, setIsSelectingHeader] = useState(false);

  const resetToInitialData = (data: {
    title?: string;
    generalTip?: string;
    headerCard?: HeaderCard | null;
    pairs?: CardPair[];
  }) => {
    setLoadedPairs(data.pairs || []);
    setHeaderCard(data.headerCard || null);
    setTitle(data.title || "Title");
    setGeneralTip(data.generalTip || "");
  };

  const handleHeaderCardSelected = (card: Card) => {
    setHeaderCard({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      imageUrlCropped: card.imageUrlCropped,
    });
    setIsSelectingHeader(false);
  };

  return {
    isEditMode,
    setIsEditMode,
    loadedPairs,
    setLoadedPairs,
    headerCard,
    setHeaderCard,
    title,
    setTitle,
    generalTip,
    setGeneralTip,
    isSelectingHeader,
    setIsSelectingHeader,
    resetToInitialData,
    handleHeaderCardSelected,
  };
};
