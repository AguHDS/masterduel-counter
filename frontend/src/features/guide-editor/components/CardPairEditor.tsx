import { useState, useEffect } from "react";
import { CardPairItem } from "./CardPairItem";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import type { CardPair, Card } from "@/features/archetypes/types";

interface CardPairEditorProps {
  isEditMode: boolean;
  initialPairs?: CardPair[];
  pairs: CardPair[];
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  onAddPair?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({
  isEditMode,
  initialPairs = [],
  pairs,
  setPairs,
  onAddPair,
  onModalStateChange,
  forceCloseModal = false,
}: CardPairEditorProps) => {
  const [selectingPosition, setSelectingPosition] =
    useState<SelectingPosition>(null);

  // Close modal when forced from parent
  useEffect(() => {
    if (forceCloseModal && selectingPosition) {
      setSelectingPosition(null);
    }
  }, [forceCloseModal]);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(!!selectingPosition);
    }
  }, [selectingPosition, onModalStateChange]);

  useEffect(() => {
    setPairs(initialPairs);
  }, [initialPairs]);

  const removePair = (pairId: string) => {
    setPairs(pairs.filter((p) => p.id !== pairId));
  };

  const removeCard = (
    pairId: string,
    position: "top" | "bottom",
    cardIndex: number,
  ) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const cards =
            position === "top" ? [...pair.topCards] : [...pair.bottomCards];
          cards.splice(cardIndex, 1);
          return {
            ...pair,
            [position === "top" ? "topCards" : "bottomCards"]: cards,
          };
        }
        return pair;
      }),
    );
  };

  const openCardSelection = (pairId: string, position: "top" | "bottom") => {
    setSelectingPosition({ pairId, position });
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingPosition) return;

    setPairs(
      pairs.map((pair) => {
        if (pair.id === selectingPosition.pairId) {
          const currentCards =
            selectingPosition.position === "top"
              ? pair.topCards
              : pair.bottomCards;
          return {
            ...pair,
            [selectingPosition.position === "top" ? "topCards" : "bottomCards"]:
              [...currentCards, card],
          };
        }
        return pair;
      }),
    );

    setSelectingPosition(null);
  };

  const handleEffectivenessChange = (pairId: string, effectiveness: string) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === pairId ? { ...pair, effectiveness } : pair,
      ),
    );
  };

  const handleCommentChange = (pairId: string, comment: string) => {
    setPairs(
      pairs.map((pair) => (pair.id === pairId ? { ...pair, comment } : pair)),
    );
  };

  const movePairLeft = (pairId: string) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    if (index > 0) {
      const newPairs = [...pairs];
      [newPairs[index - 1], newPairs[index]] = [
        newPairs[index],
        newPairs[index - 1],
      ];
      setPairs(newPairs);
    }
  };

  const movePairRight = (pairId: string) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    if (index < pairs.length - 1) {
      const newPairs = [...pairs];
      [newPairs[index], newPairs[index + 1]] = [
        newPairs[index + 1],
        newPairs[index],
      ];
      setPairs(newPairs);
    }
  };

  const renderPairsWithSeparators = () => {
    const items = [];

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      items.push(
        <div key={pair.id} className="flex justify-center">
          <CardPairItem
            topCards={pair.topCards}
            bottomCards={pair.bottomCards}
            effectiveness={pair.effectiveness}
            comment={pair.comment}
            onSelectTop={() => openCardSelection(pair.id, "top")}
            onSelectBottom={() => openCardSelection(pair.id, "bottom")}
            onRemoveTopCard={(cardIndex) =>
              removeCard(pair.id, "top", cardIndex)
            }
            onRemoveBottomCard={(cardIndex) =>
              removeCard(pair.id, "bottom", cardIndex)
            }
            onEffectivenessChange={(value) =>
              handleEffectivenessChange(pair.id, value)
            }
            onCommentChange={(value) => handleCommentChange(pair.id, value)}
            onRemove={() => removePair(pair.id)}
            onMoveLeft={() => movePairLeft(pair.id)}
            onMoveRight={() => movePairRight(pair.id)}
            canMoveLeft={i > 0}
            canMoveRight={i < pairs.length - 1}
            isEditMode={isEditMode}
          />
        </div>,
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 w-full">
        {pairs.length > 0 ? (
          <div className="flex flex-wrap gap-8 justify-center">
            {renderPairsWithSeparators()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-400">
            <p className="text-lg mb-4">No card pairs yet</p>
            {isEditMode && onAddPair && (
              <p className="text-sm">
                Click "Add Card Pair" below to get started
              </p>
            )}
          </div>
        )}
      </div>

      {selectingPosition && (
        <CardSearchModal
          isOpen={!!selectingPosition}
          onClose={() => setSelectingPosition(null)}
          onSelectCard={handleCardSelected}
          title={
            selectingPosition.position === "top"
              ? "Select Target Card"
              : "Select Counter Card"
          }
          variant="sidebar"
          autoCloseAfterSelect={false}
        />
      )}
    </div>
  );
};
