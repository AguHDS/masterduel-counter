import { useState, useEffect } from "react";
import { CardPairItem } from "./CardPairItem";
import { CardSearchModal } from "./CardSearchModal";
import { type Card } from "../api/cardApi";

interface CardPair {
  id: string;
  topCards: Card[];
  bottomCards: Card[];
  effectiveness?: string;
  comment?: string;
}

interface CardPairEditorProps {
  isEditMode: boolean;
  onSave: (pairs: CardPair[]) => Promise<void>;
  onCancel?: () => void;
  initialPairs?: CardPair[];
  pairs: CardPair[];
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  onAddPair?: () => void;
  saving?: boolean;
  validationError?: string | null;
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({
  isEditMode,
  initialPairs = [],
  pairs,
  setPairs,
  onAddPair,
  validationError = null,
}: CardPairEditorProps) => {
  const [selectingPosition, setSelectingPosition] =
    useState<SelectingPosition>(null);

  // Actualizar pares cuando cambian los initialPairs
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

  return (
    <div className="flex flex-col">
      {validationError && (
        <div className="mb-4 text-red-400 font-semibold text-sm text-center">
          {validationError}
        </div>
      )}
      {/* Card Pairs Grid */}
      <div className="flex-1">
        {pairs.length > 0 ? (
          <div className="flex flex-wrap gap-10 justify-center">
            {pairs.map((pair, index) => (
              <CardPairItem
                key={pair.id}
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
                canMoveLeft={index > 0}
                canMoveRight={index < pairs.length - 1}
                isEditMode={isEditMode}
              />
            ))}
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
        />
      )}
    </div>
  );
};
