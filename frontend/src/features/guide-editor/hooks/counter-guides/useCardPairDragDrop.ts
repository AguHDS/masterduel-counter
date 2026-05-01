import { useState, type DragEvent } from "react";

interface UseCardPairDragDropParams {
  pairId: string;
  onReorderTopCards?: (oldIndex: number, newIndex: number) => void;
  onReorderBottomCards?: (oldIndex: number, newIndex: number) => void;
  onMoveCardToTop?: (cardIndex: number, targetIndex: number) => void;
  onMoveCardToBottom?: (cardIndex: number, targetIndex: number) => void;
}

/**
 * Handles card drag-and-drop state and events for a single card pair
 */
export const useCardPairDragDrop = ({
  pairId,
  onReorderTopCards,
  onReorderBottomCards,
  onMoveCardToTop,
  onMoveCardToBottom,
}: UseCardPairDragDropParams) => {
  const [draggedTopCardIndex, setDraggedTopCardIndex] = useState<number | null>(null);
  const [dragOverTopCardIndex, setDragOverTopCardIndex] = useState<number | null>(null);
  const [draggedBottomCardIndex, setDraggedBottomCardIndex] = useState<number | null>(null);
  const [dragOverBottomCardIndex, setDragOverBottomCardIndex] = useState<number | null>(null);
  const [currentDragPairId, setCurrentDragPairId] = useState<string | null>(null);

  const resetDragState = () => {
    setDraggedTopCardIndex(null);
    setDraggedBottomCardIndex(null);
    setDragOverTopCardIndex(null);
    setDragOverBottomCardIndex(null);
    setCurrentDragPairId(null);
  };

  const handleTopCardDragStart = (e: DragEvent, index: number) => {
    setDraggedTopCardIndex(index);
    setCurrentDragPairId(pairId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("cardSection", "top");
    e.dataTransfer.setData("cardIndex", index.toString());
    e.dataTransfer.setData("pairId", pairId);
  };

  const handleTopCardDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();

    if (currentDragPairId && currentDragPairId !== pairId) {
      e.dataTransfer.dropEffect = "none";
      setDragOverTopCardIndex(null);
      return;
    }

    e.dataTransfer.dropEffect = "move";
    setDragOverTopCardIndex(index);
  };

  const handleTopCardDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const dragSection = e.dataTransfer.getData("cardSection");
    const dragIndex = parseInt(e.dataTransfer.getData("cardIndex"), 10);
    const dragPairId = e.dataTransfer.getData("pairId");

    if (dragPairId !== pairId || isNaN(dragIndex)) {
      resetDragState();
      return;
    }

    if (dragSection === "top") {
      if (dragIndex !== dropIndex) {
        onReorderTopCards?.(dragIndex, dropIndex);
      }
    } else if (dragSection === "bottom") {
      onMoveCardToTop?.(dragIndex, dropIndex);
    }

    resetDragState();
  };

  const handleTopCardDragEnd = () => {
    setDraggedTopCardIndex(null);
    setDragOverTopCardIndex(null);
    setCurrentDragPairId(null);
  };

  const handleBottomCardDragStart = (e: DragEvent, index: number) => {
    setDraggedBottomCardIndex(index);
    setCurrentDragPairId(pairId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("cardSection", "bottom");
    e.dataTransfer.setData("cardIndex", index.toString());
    e.dataTransfer.setData("pairId", pairId);
  };

  const handleBottomCardDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();

    if (currentDragPairId && currentDragPairId !== pairId) {
      e.dataTransfer.dropEffect = "none";
      setDragOverBottomCardIndex(null);
      return;
    }

    e.dataTransfer.dropEffect = "move";
    setDragOverBottomCardIndex(index);
  };

  const handleBottomCardDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const dragSection = e.dataTransfer.getData("cardSection");
    const dragIndex = parseInt(e.dataTransfer.getData("cardIndex"), 10);
    const dragPairId = e.dataTransfer.getData("pairId");

    if (dragPairId !== pairId || isNaN(dragIndex)) {
      resetDragState();
      return;
    }

    if (dragSection === "bottom") {
      if (dragIndex !== dropIndex) {
        onReorderBottomCards?.(dragIndex, dropIndex);
      }
    } else if (dragSection === "top") {
      onMoveCardToBottom?.(dragIndex, dropIndex);
    }

    resetDragState();
  };

  const handleBottomCardDragEnd = () => {
    setDraggedBottomCardIndex(null);
    setDragOverBottomCardIndex(null);
    setCurrentDragPairId(null);
  };

  return {
    draggedTopCardIndex,
    dragOverTopCardIndex,
    draggedBottomCardIndex,
    dragOverBottomCardIndex,
    handleTopCardDragStart,
    handleTopCardDragOver,
    handleTopCardDrop,
    handleTopCardDragEnd,
    handleBottomCardDragStart,
    handleBottomCardDragOver,
    handleBottomCardDrop,
    handleBottomCardDragEnd,
  };
};
