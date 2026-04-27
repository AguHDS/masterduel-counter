import { useState } from "react";
import type { CardPair } from "@/features/archetypes/types";
import { useSharedGuideEditor, type HeaderCard } from "../useSharedGuideEditor";

/**
 * Extends shared guide editor with Counter-specific state (card pairs)
 * 
 * Manages the complete editing state for Counter guides including:
 * - Shared fields: title, generalTip, headerCard (via useSharedGuideEditor)
 * - Counter-specific: loadedPairs (card matchups with handtraps/board breakers)
 * 
 * Counter guides use card pairs to show which cards counter which threats
 */
export const useCounterGuideEditor = (initialData?: {
  title?: string;
  generalTip?: string;
  headerCard?: HeaderCard | null;
  pairs?: CardPair[];
}) => {
  // Shared editing state (title, generalTip, headerCard, edit mode, etc.)
  const sharedEditor = useSharedGuideEditor(initialData);

  // Counter-specific state: card pairs
  const [loadedPairs, setLoadedPairs] = useState<CardPair[]>(
    initialData?.pairs || [],
  );

  const resetToInitialData = (data: {
    title?: string;
    generalTip?: string;
    headerCard?: HeaderCard | null;
    pairs?: CardPair[];
  }) => {
    sharedEditor.resetToInitialData(data);
    setLoadedPairs(data.pairs || []);
  };

  return {
    ...sharedEditor,
    loadedPairs,
    setLoadedPairs,
    resetToInitialData,
  };
};
