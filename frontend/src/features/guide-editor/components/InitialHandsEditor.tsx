import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import type { Card } from "@/features/archetypes/types";

export interface InitialHand {
  id: string;
  cards: Card[];
}

interface InitialHandsEditorProps {
  isEditMode: boolean;
  initialHands: InitialHand[];
  setInitialHands: React.Dispatch<React.SetStateAction<InitialHand[]>>;
  validationError?: string | null;
}

export const InitialHandsEditor = ({
  isEditMode,
  initialHands,
  setInitialHands,
  validationError = null,
}: InitialHandsEditorProps) => {
  const [selectingHandId, setSelectingHandId] = useState<string | null>(null);

  const addInitialHand = () => {
    if (initialHands.length >= 5) {
      alert("Maximum 5 initial hands allowed");
      return;
    }

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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-blue-300">Initial Hands</h3>
          <p className="text-sm text-gray-400">
            Add up to 5 sample starting hands (max 5 cards each)
          </p>
        </div>

        {isEditMode && initialHands.length < 5 && (
          <button
            onClick={addInitialHand}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hand</span>
          </button>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
          {validationError}
        </div>
      )}

      {/* Initial Hands List */}
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
        <div className="space-y-6">
          {initialHands.map((hand, index) => (
            <div
              key={hand.id}
              className="relative bg-gray-900/50 border-2 border-blue-500/30 rounded-lg p-6"
            >
              {/* Hand Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-yellow-200">
                  Starting Hand #{index + 1}
                </h4>

                {isEditMode && (
                  <button
                    onClick={() => removeInitialHand(hand.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Remove this hand"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Remove</span>
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div className="flex flex-wrap gap-3">
                {hand.cards.map((card, cardIndex) => (
                  <div
                    key={`${hand.id}-${card.id}-${cardIndex}`}
                    className="relative group"
                  >
                    <img
                      src={card.imageUrl || card.imageUrlSmall}
                      alt={card.name}
                      className="w-16 h-24 object-cover rounded border-2 border-amber-500/50 shadow-lg"
                    />

                    {isEditMode && (
                      <button
                        onClick={() => removeCardFromHand(hand.id, cardIndex)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove card"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}

                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded shadow">
                      {cardIndex + 1}
                    </div>
                  </div>
                ))}

                {/* Add Card Button */}
                {isEditMode && hand.cards.length < 5 && (
                  <button
                    onClick={() => setSelectingHandId(hand.id)}
                    className="w-16 h-24 border-2 border-dashed border-blue-500 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-blue-400" />
                  </button>
                )}
              </div>

              {/* Card count indicator */}
              <div className="mt-3 text-sm text-gray-400">
                {hand.cards.length} / 5 cards
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Selection Modal */}
      <CardSearchModal
        isOpen={!!selectingHandId}
        onClose={() => setSelectingHandId(null)}
        onSelectCard={handleCardSelected}
        title="Select Card for Initial Hand"
      />
    </div>
  );
};
