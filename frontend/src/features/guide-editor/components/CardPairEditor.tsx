import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CardPairItem } from "./CardPairItem";
import { FloatingCardSearchModal } from "../../archetypes/components/FloatingCardSearchModal";
import type { CardPair, Card } from "@/features/archetypes/types";

interface CardPairEditorProps {
  isEditMode: boolean;
  pairs: CardPair[];
  setPairs: React.Dispatch<React.SetStateAction<CardPair[]>>;
  onAddPair?: () => void;
  addPlaceholderLabel?: string;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({
  isEditMode,
  pairs,
  setPairs,
  onAddPair,
  addPlaceholderLabel,
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
            pairNumber={i + 1}
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

    if (isEditMode && onAddPair && addPlaceholderLabel) {
      items.push(
        <button
          key="add-pair-placeholder"
          onClick={onAddPair}
          className="flex justify-center text-left"
          aria-label={addPlaceholderLabel}
        >
          <div
            className="space-y-1.5"
            style={{ width: "360px" }}
          >
            <div className="min-h-[28px]" />
            <div className="relative overflow-visible bg-gradient-to-br p-2 border border-dashed border-blue-500/50 hover:border-blue-400 transition-colors">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
              <div className="relative z-10 min-h-[520px] flex flex-col items-center justify-center gap-2 text-blue-300">
                <Plus className="w-9 h-9" />
                <span className="text-base font-semibold">{addPlaceholderLabel}</span>
              </div>
            </div>
          </div>
        </button>,
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
