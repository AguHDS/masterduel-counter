import { Plus, Save } from "lucide-react";
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
  initialPairs?: CardPair[];
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({ isEditMode, onSave, initialPairs = [] }: CardPairEditorProps) => {
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
    setSaving(true);
    try {
      const completePairs = pairs.filter((p) => p.topCard && p.bottomCard);
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

      {/* Add Pair Button */}
      {isEditMode && (
        <div className="flex justify-center pt-7">
          <button
            onClick={addPair}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Card Pair</span>
          </button>
        </div>
      )}

      {/* Save Button */}
      {isEditMode && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors shadow-lg font-semibold"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
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
