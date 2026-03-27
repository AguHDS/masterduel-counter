import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

export interface InitialHand {
  id: string;
  cards: Card[];
}

interface InitialHandsEditorProps {
  isEditMode: boolean;
  initialHands: InitialHand[];
  setInitialHands: React.Dispatch<React.SetStateAction<InitialHand[]>>;
  onAddHand?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

export const InitialHandsEditor = ({
  isEditMode,
  initialHands,
  setInitialHands,
  onAddHand,
  onModalStateChange,
  forceCloseModal = false,
}: InitialHandsEditorProps) => {
  const [selectingHandId, setSelectingHandId] = useState<string | null>(null);

  // Close modal when forced from parent
  useEffect(() => {
    if (forceCloseModal && selectingHandId) {
      setSelectingHandId(null);
    }
  }, [forceCloseModal]);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(!!selectingHandId);
    }
  }, [selectingHandId, onModalStateChange]);

  const addInitialHand = () => {
    const newHand: InitialHand = {
      id: `hand-${Date.now()}`,
      cards: [],
    };
    setInitialHands([...initialHands, newHand]);
  };

  const removeInitialHand = (handId: string) => {
    setInitialHands(initialHands.filter((h) => h.id !== handId));
  };

  const removeCardFromHand = (handId: string, cardIndex: number) => {
    setInitialHands(
      initialHands.map((hand) => {
        if (hand.id === handId) {
          const newCards = [...hand.cards];
          newCards.splice(cardIndex, 1);
          return { ...hand, cards: newCards };
        }
        return hand;
      }),
    );
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingHandId) return;

    setInitialHands(
      initialHands.map((hand) => {
        if (hand.id === selectingHandId) {
          if (hand.cards.length >= 5) {
            alert("Maximum 5 cards per initial hand");
            return hand;
          }
          return {
            ...hand,
            cards: [...hand.cards, card],
          };
        }
        return hand;
      }),
    );

    setSelectingHandId(null);
  };

  const getCardRotation = (index: number, totalCards: number) => {
    if (totalCards === 1) return 0;
    // Increased rotation angles for better fan effect
    const maxRotation = totalCards === 5 ? 60 : totalCards === 4 ? 50 : totalCards === 3 ? 45 : totalCards === 2 ? 25 : 0;
    const step = (maxRotation * 2) / (totalCards - 1);
    return -maxRotation + step * index;
  };

  const getCardTranslateY = (index: number, totalCards: number) => {
    if (totalCards === 1) return 14;
    const center = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - center);

    // For a proper fan effect: center cards should be elevated (high translateY = more negative in template)
    // and edge cards should be lower (low translateY = less negative or zero)
    const maxElevation = totalCards === 5 ? 22 : totalCards === 4 ? 20 : totalCards === 3 ? 22 : totalCards === 2 ? 15 : 0;
    const dropFactor = totalCards === 5 ? 3.5 : totalCards === 4 ? 3.8 : totalCards === 3 ? 4 : 3;

    // Center cards get max elevation, outer cards drop down
    return maxElevation - (distanceFromCenter * distanceFromCenter * dropFactor);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-blue-300">Initial Hands</h3>
          {isEditMode && (
            <p className="text-sm text-gray-400">
              Add sample starting hands (max 5 cards each)
            </p>
          )}
        </div>
      </div>

      {initialHands.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400 text-center mb-4">
            No initial hands added yet
          </p>
          {isEditMode && (
            <button
              onClick={addInitialHand}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Hand</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {initialHands.map((hand, index) => (
            <div
              key={hand.id}
              className={`relative bg-gray-900/50 border rounded-sm p-3 flex flex-col overflow-hidden transition-all ${
                isEditMode 
                  ? 'border-blue-500/40 hover:border-blue-500/70 cursor-default' 
                  : 'border-blue-500/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'
              }`}
              onClick={() => !isEditMode && console.log('Future: Open initial hand detail')}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-yellow-200">
                  Hand #{index + 1}
                </h4>

                {isEditMode && (
                  <button
                    onClick={() => removeInitialHand(hand.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-red-500"
                    title="Remove this hand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!isEditMode && (
                <div className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded">
                    SELECT
                  </div>
                </div>
              )}

              <div className="flex items-end justify-center h-24 relative px-2">
                {hand.cards.length === 0 ? (
                  <div className="text-gray-500 text-xs">Empty</div>
                ) : (
                  <div className="relative flex justify-center items-end h-full w-full scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100">
                    {hand.cards.map((card, cardIndex) => {
                      const rotation = getCardRotation(cardIndex, hand.cards.length);
                      const translateY = getCardTranslateY(cardIndex, hand.cards.length);
                      const zIndex = cardIndex;
                      // Improved spacing for better fan effect
                      const spacingScale = hand.cards.length === 5 ? 15 : hand.cards.length === 4 ? 14 : hand.cards.length === 3 ? 16 : hand.cards.length === 2 ? 12 : 0;
                      const horizontalOffset = (cardIndex - (hand.cards.length - 1) / 2) * spacingScale;

                      return (
                        <div
                          key={`${hand.id}-${card.id}-${cardIndex}`}
                          className="absolute group"
                          style={{
                            transform: `translateX(${horizontalOffset}px) translateY(-${translateY}px) rotate(${rotation}deg)`,
                            transformOrigin: 'center bottom',
                            zIndex: zIndex,
                            transition: 'transform 0.3s ease',
                            bottom: '0',
                          }}
                        >
                          <CardTooltip
                            cardId={card.id}
                            imageUrl={card.imageUrl || card.imageUrlSmall}
                            cardName={card.name}
                          >
                            <img
                              src={card.imageUrl || card.imageUrlSmall}
                              alt={card.name}
                              className="w-14 h-20 object-cover rounded border-2 border-amber-500/50 shadow-lg hover:scale-110 hover:-translate-y-6 transition-all"
                            />
                          </CardTooltip>

                          {isEditMode && (
                            <button
                              onClick={() => removeCardFromHand(hand.id, cardIndex)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              title="Remove card"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isEditMode && hand.cards.length < 5 && (
                <button
                  onClick={() => setSelectingHandId(hand.id)}
                  className="mt-2 w-full py-1 border-2 border-dashed border-blue-500 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                </button>
              )}

              <div className="mt-1 text-xs text-gray-400 text-center">
                {hand.cards.length}/5
              </div>
            </div>
          ))}
        </div>
      )}

      <CardSearchModal
        isOpen={!!selectingHandId}
        onClose={() => setSelectingHandId(null)}
        onSelectCard={handleCardSelected}
        title="Select Card for Initial Hand"
        variant="sidebar"
        autoCloseAfterSelect={false}
      />
    </div>
  );
};
