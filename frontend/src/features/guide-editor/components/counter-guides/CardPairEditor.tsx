import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CardPairItem } from "./CardPairItem";
import { FloatingCardSearchModal } from "../../../archetypes/components/FloatingCardSearchModal";
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

const DEFAULT_PAIR_WIDTH = 360;
const RESPONSIVE_PAIR_BREAKPOINT = 956;

const calculatePairWidth = (viewportWidth: number) => {
  if (viewportWidth > RESPONSIVE_PAIR_BREAKPOINT) {
    return DEFAULT_PAIR_WIDTH;
  }

  // Keep two pairs per row by reducing width progressively on smaller viewports.
  const targetWidth = Math.floor((viewportWidth - 300) / 2);
  return Math.max(170, Math.min(DEFAULT_PAIR_WIDTH, targetWidth));
};

/**
 * Editor component for managing Counter guide card pairs
 * Allows users to add, edit, reorder, and remove card pairs
 * Supports both HANDTRAP and BOARD_BREAKER sections
 */
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
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pairWidth = calculatePairWidth(viewportWidth);

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

  const reorderTopCards = (pairId: string, oldIndex: number, newIndex: number) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const newTopCards = [...pair.topCards];
          // Swap positions instead of splice
          const temp = newTopCards[oldIndex];
          newTopCards[oldIndex] = newTopCards[newIndex];
          newTopCards[newIndex] = temp;
          return { ...pair, topCards: newTopCards };
        }
        return pair;
      }),
    );
  };

  const reorderBottomCards = (pairId: string, oldIndex: number, newIndex: number) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const newBottomCards = [...pair.bottomCards];
          // Swap positions instead of splice
          const temp = newBottomCards[oldIndex];
          newBottomCards[oldIndex] = newBottomCards[newIndex];
          newBottomCards[newIndex] = temp;
          return { ...pair, bottomCards: newBottomCards };
        }
        return pair;
      }),
    );
  };

  const moveCardToTop = (pairId: string, bottomCardIndex: number, targetIndex: number) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const bottomCard = pair.bottomCards[bottomCardIndex];
          const topCard = pair.topCards[targetIndex];
          if (!bottomCard) return pair;
          
          const newBottomCards = [...pair.bottomCards];
          const newTopCards = [...pair.topCards];
          
          // Remove effectiveness from bottom card
          const { effectiveness: _eff, ...cardWithoutEffectiveness } = bottomCard;
          
          if (topCard) {
            // Swap: move top card to bottom with effectiveness
            const cardWithEffectiveness = { ...topCard, effectiveness: undefined };
            newBottomCards[bottomCardIndex] = cardWithEffectiveness;
            newTopCards[targetIndex] = cardWithoutEffectiveness as Card;
          } else {
            // No card at target, just move
            newBottomCards.splice(bottomCardIndex, 1);
            newTopCards[targetIndex] = cardWithoutEffectiveness as Card;
          }
          
          return { ...pair, topCards: newTopCards, bottomCards: newBottomCards };
        }
        return pair;
      }),
    );
  };

  const moveCardToBottom = (pairId: string, topCardIndex: number, targetIndex: number) => {
    setPairs(
      pairs.map((pair) => {
        if (pair.id === pairId) {
          const topCard = pair.topCards[topCardIndex];
          const bottomCard = pair.bottomCards[targetIndex];
          if (!topCard) return pair;
          
          const newTopCards = [...pair.topCards];
          const newBottomCards = [...pair.bottomCards];
          
          // Add effectiveness to top card
          const cardWithEffectiveness = { ...topCard, effectiveness: undefined };
          
          if (bottomCard) {
            // Swap: move bottom card to top without effectiveness
            const { effectiveness: _eff, ...cardWithoutEffectiveness } = bottomCard;
            newTopCards[topCardIndex] = cardWithoutEffectiveness as Card;
            newBottomCards[targetIndex] = cardWithEffectiveness;
          } else {
            // No card at target, just move
            newTopCards.splice(topCardIndex, 1);
            newBottomCards[targetIndex] = cardWithEffectiveness;
          }
          
          return { ...pair, topCards: newTopCards, bottomCards: newBottomCards };
        }
        return pair;
      }),
    );
  };

  const renderPairsWithSeparators = () => {
    const items = [];

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];

      items.push(
        <div
          key={pair.id}
          className="flex justify-center"
          style={{ width: `${pairWidth}px` }}
        >
          <CardPairItem
            pairNumber={i + 1}
            pairId={pair.id}
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
            onReorderTopCards={(oldIndex, newIndex) =>
              reorderTopCards(pair.id, oldIndex, newIndex)
            }
            onReorderBottomCards={(oldIndex, newIndex) =>
              reorderBottomCards(pair.id, oldIndex, newIndex)
            }
            onMoveCardToTop={(bottomCardIndex, targetIndex) =>
              moveCardToTop(pair.id, bottomCardIndex, targetIndex)
            }
            onMoveCardToBottom={(topCardIndex, targetIndex) =>
              moveCardToBottom(pair.id, topCardIndex, targetIndex)
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
            pairWidth={pairWidth}
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
          style={{ width: `${pairWidth}px` }}
          aria-label={addPlaceholderLabel}
        >
          <div
            className="space-y-1.5"
            style={{ width: `${pairWidth}px` }}
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
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8">
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
