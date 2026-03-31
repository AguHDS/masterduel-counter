import { useState, useEffect } from "react";
import { CardPairItem } from "./CardPairItem";
import { FloatingCardSearchModal } from "./FloatingCardSearchModal";
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
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

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

  const openCardSelection = (pairId: string, position: "top" | "bottom", anchor: HTMLElement) => {
    setAnchorElement(anchor);
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
          
          // Check max cards limit
          if (selectingPosition.position === "top" && currentCards.length >= 8) {
            return pair;
          }
          if (selectingPosition.position === "bottom" && currentCards.length >= 8) {
            return pair;
          }

          if (selectingPosition.position === "top") {
            return {
              ...pair,
              topCards: [...currentCards, card],
            };
          } else {
            // For bottom cards, add efficiency as undefined
            return {
              ...pair,
              bottomCards: [...currentCards, { ...card, effectiveness: undefined }],
            };
          }
        }
        return pair;
      }),
    );

    setSelectingPosition(null);
  };

  const handleBottomCardEffectivenessChange = (
    pairId: string,
    cardIndex: number,
    effectiveness: string,
  ) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const updatedBottomCards = pair.bottomCards.map((card, idx) =>
            idx === cardIndex
              ? { ...card, effectiveness: effectiveness || undefined }
              : card,
          );
          return { ...pair, bottomCards: updatedBottomCards };
        }
        return pair;
      }),
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
            comment={pair.comment}
            onSelectTop={(e?: React.MouseEvent<HTMLButtonElement>) => {
              if (e?.currentTarget) setAnchorElement(e.currentTarget);
              openCardSelection(pair.id, "top", e?.currentTarget || document.body);
            }}
            onSelectBottom={(e?: React.MouseEvent<HTMLButtonElement>) => {
              if (e?.currentTarget) setAnchorElement(e.currentTarget);
              openCardSelection(pair.id, "bottom", e?.currentTarget || document.body);
            }}
            onRemoveTopCard={(cardIndex) =>
              removeCard(pair.id, "top", cardIndex)
            }
            onRemoveBottomCard={(cardIndex) =>
              removeCard(pair.id, "bottom", cardIndex)
            }
            onBottomCardEffectivenessChange={(cardIndex, value) =>
              handleBottomCardEffectivenessChange(pair.id, cardIndex, value)
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
        <FloatingCardSearchModal
          isOpen={!!selectingPosition}
          onClose={() => {
            setSelectingPosition(null);
            setAnchorElement(null);
          }}
          onSelectCard={handleCardSelected}
          title={
            selectingPosition.position === "top"
              ? "Select Target Card"
              : "Select Counter Card"
          }
          anchorElement={anchorElement}
          autoCloseAfterSelect={false}
        />
      )}
    </div>
  );
};
