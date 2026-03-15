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
  initialPairs?: CardPair[];
  pairs: CardPair[];
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  onAddPair?: () => void;
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

  const getGridColumns = () => {
    const count = pairs.length;
    
    if (count <= 3) {
      return "grid-cols-1 md:grid-cols-3";
    } else if (count <= 6) {
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    } else {
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Función para renderizar los pares con separadores
  const renderPairsWithSeparators = () => {
    const items = [];
    
    for (let i = 0; i < pairs.length; i++) {
      // Agregar el par de cartas
      const pair = pairs[i];
      items.push(
        <div key={pair.id} className="w-full max-w-[400px]">
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
        </div>
      );

      if ((i + 1) % 3 === 0 && i < pairs.length - 1) {
        items.push(
          <div key={`separator-${i}`} className="col-span-full w-full">
            <div className="flex justify-center my-8">
              <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            </div>
          </div>
        );
      }
    }
    
    return items;
  };

  return (
    <div className="flex flex-col">
      {validationError && (
        <div className="mb-4 text-red-400 font-semibold text-sm text-center">
          {validationError}
        </div>
      )}
      <div className="flex-1">
        {pairs.length > 0 ? (
          <div className={`grid ${getGridColumns()} gap-10 justify-items-center`}>
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
        />
      )}
    </div>
  );
};