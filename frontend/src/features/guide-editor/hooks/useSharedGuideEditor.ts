import { useState } from "react";
import type { Card } from "@/features/archetypes/types";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

export type { HeaderCard };

/**
 * Manages shared editing state for both Counter and Deck guides
 * 
 * Handles common guide properties:
 * - Title and general description (generalTip)
 * - Header card selection and modal state
 * - Edit mode toggle
 */
export const useSharedGuideEditor = (initialData?: {
  title?: string;
  generalTip?: string;
  headerCard?: HeaderCard | null;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
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
  }) => {
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
