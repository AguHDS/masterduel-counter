import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { CardPairItem } from "./CardPairItem";
import { CardSearchModal } from "./CardSearchModal";
import { type Card } from "../api/cardApi";

interface CardPair {
  id: string;
  topCard: Card | null;
  bottomCard: Card | null;
}

interface CardPairEditorProps {
  isEditMode: boolean;
  onSave: (pairs: CardPair[]) => Promise<void>;
}

type SelectingPosition = { pairId: string; position: "top" | "bottom" } | null;

export const CardPairEditor = ({ isEditMode, onSave }: CardPairEditorProps) => {
  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [selectingPosition, setSelectingPosition] = useState<SelectingPosition>(null);
  const [saving, setSaving] = useState(false);

  const addPair = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}`,
      topCard: null,
      bottomCard: null,
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

  const handleSave = async () => {
    // Validación: al menos 1 par completo
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
              onSelectTop={() => openCardSelection(pair.id, "top")}
              onSelectBottom={() => openCardSelection(pair.id, "bottom")}
              onRemove={() => removePair(pair.id)}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      )}

      {/* Add Pair Button */}
      {isEditMode && (
        <div className="flex justify-center">
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
      {isEditMode && pairs.length > 0 && (
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
