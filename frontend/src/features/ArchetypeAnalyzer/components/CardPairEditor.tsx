import { Plus, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { CardPairItem } from "./CardPairItem";
import { CardSearchModal } from "./CardSearchModal";
import { type Card } from "../api/cardApi";

interface CardPair {
  id: string;
  topCard: Card | null;
  bottomCard: Card | null;
  effectiveness?: string;
  comment?: string;
}

interface CardPairEditorProps {
  isEditMode: boolean;
  onSave: (pairs: CardPair[]) => Promise<void>;
  onCancel?: () => void;
  initialPairs?: CardPair[];
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({ isEditMode, onSave, onCancel, initialPairs = [] }: CardPairEditorProps) => {
  const [pairs, setPairs] = useState<CardPair[]>(initialPairs);
  const [selectingPosition, setSelectingPosition] = useState<SelectingPosition>(null);
  const [saving, setSaving] = useState(false);

  // Actualizar pares cuando cambian los initialPairs
  useEffect(() => {
    setPairs(initialPairs);
  }, [initialPairs]);

  const addPair = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}`,
      topCard: null,
      bottomCard: null,
      effectiveness: undefined,
      comment: undefined,
    };
    setPairs([...pairs, newPair]);
  };

  const removePair = (pairId: string) => {
    setPairs(pairs.filter((p) => p.id !== pairId));
  };

  const openCardSelection = (pairId: string, position: "top" | "bottom") => {
    setSelectingPosition({ pairId, position });
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingPosition) return;

    setPairs(
      pairs.map((pair) => {
        if (pair.id === selectingPosition.pairId) {
          return {
            ...pair,
            [selectingPosition.position === "top" ? "topCard" : "bottomCard"]: card,
          };
        }
        return pair;
      })
    );

    setSelectingPosition(null);
  };

  const handleEffectivenessChange = (pairId: string, effectiveness: string) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === pairId ? { ...pair, effectiveness } : pair
      )
    );
  };

  const handleCommentChange = (pairId: string, comment: string) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === pairId ? { ...pair, comment } : pair
      )
    );
  };

  const handleSave = async () => {
    const completePairs = pairs.filter((p) => p.topCard && p.bottomCard);
    
    if (completePairs.length === 0) {
      alert("Please add at least one complete card pair before saving.");
      return;
    }
    
    setSaving(true);
    try {
      await onSave(completePairs);
    } catch (error) {
      console.error("Error saving pairs:", error);
      alert("Failed to save card pairs. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Pairs Grid */}
      {pairs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pairs.map((pair) => (
            <CardPairItem
              key={pair.id}
              topCard={pair.topCard}
              bottomCard={pair.bottomCard}
              effectiveness={pair.effectiveness}
              comment={pair.comment}
              onSelectTop={() => openCardSelection(pair.id, "top")}
              onSelectBottom={() => openCardSelection(pair.id, "bottom")}
              onEffectivenessChange={(value) => handleEffectivenessChange(pair.id, value)}
              onCommentChange={(value) => handleCommentChange(pair.id, value)}
              onRemove={() => removePair(pair.id)}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {isEditMode && (
        <div className="flex justify-center gap-4 pt-7">
          <button
            onClick={addPair}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card Pair</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors shadow-lg text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors shadow-lg text-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Card Search Modal */}
      {selectingPosition && (
        <CardSearchModal
          isOpen={!!selectingPosition}
          onClose={() => setSelectingPosition(null)}
          onSelectCard={handleCardSelected}
          title={selectingPosition.position === "top" ? "Select Target Card" : "Select Counter Card"}
        />
      )}
    </div>
  );
};
