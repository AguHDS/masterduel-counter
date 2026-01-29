import { Plus, Save, X } from "lucide-react";
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
      topCards: [],
      bottomCards: [],
      effectiveness: undefined,
      comment: undefined,
    };
    setPairs([...pairs, newPair]);
  };

  const removePair = (pairId: string) => {
    setPairs(pairs.filter((p) => p.id !== pairId));
  };

  const removeCard = (pairId: string, position: "top" | "bottom", cardIndex: number) => {
    setPairs(pairs.map((pair) => {
      if (pair.id === pairId) {
        const cards = position === "top" ? [...pair.topCards] : [...pair.bottomCards];
        cards.splice(cardIndex, 1);
        return {
          ...pair,
          [position === "top" ? "topCards" : "bottomCards"]: cards,
        };
      }
      return pair;
    }));
  };

  const openCardSelection = (pairId: string, position: "top" | "bottom") => {
    setSelectingPosition({ pairId, position });
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingPosition) return;

    setPairs(
      pairs.map((pair) => {
        if (pair.id === selectingPosition.pairId) {
          const currentCards = selectingPosition.position === "top" ? pair.topCards : pair.bottomCards;
          return {
            ...pair,
            [selectingPosition.position === "top" ? "topCards" : "bottomCards"]: [...currentCards, card],
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

  const movePairLeft = (pairId: string) => {
    const index = pairs.findIndex(p => p.id === pairId);
    if (index > 0) {
      const newPairs = [...pairs];
      [newPairs[index - 1], newPairs[index]] = [newPairs[index], newPairs[index - 1]];
      setPairs(newPairs);
    }
  };

  const movePairRight = (pairId: string) => {
    const index = pairs.findIndex(p => p.id === pairId);
    if (index < pairs.length - 1) {
      const newPairs = [...pairs];
      [newPairs[index], newPairs[index + 1]] = [newPairs[index + 1], newPairs[index]];
      setPairs(newPairs);
    }
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  // Limpiar errores de validación al salir de modo edición
  useEffect(() => {
    if (!isEditMode) {
      setValidationError(null);
    }
  }, [isEditMode]);

  const handleSave = async () => {
    // Validar que haya al menos un par con al menos una carta en top o bottom
    const validPairs = pairs.filter((p) => p.topCards.length > 0 || p.bottomCards.length > 0);
    if (validPairs.length === 0) {
      setValidationError("Please add at least one card (top or bottom) in at least one pair before saving.");
      return;
    }
    // Validar que cada par tenga al menos una carta en top o bottom
    for (let i = 0; i < pairs.length; i++) {
      if (pairs[i].topCards.length === 0 && pairs[i].bottomCards.length === 0) {
        setValidationError(`Pair #${i + 1} must have at least one card in Top or Bottom.`);
        return;
      }
    }
    setValidationError(null);
    setSaving(true);
    try {
      await onSave(validPairs);
    } catch (error) {
      console.error("Error saving pairs:", error);
      alert("Failed to save card pairs. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      {validationError && (
        <div className="mb-4 text-red-400 font-semibold text-sm text-center">{validationError}</div>
      )}
      {/* Card Pairs Grid */}
      <div className="flex-1">
        {pairs.length > 0 && (
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
                onRemoveTopCard={(cardIndex) => removeCard(pair.id, "top", cardIndex)}
                onRemoveBottomCard={(cardIndex) => removeCard(pair.id, "bottom", cardIndex)}
                onEffectivenessChange={(value) => handleEffectivenessChange(pair.id, value)}
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
        )}
      </div>

      {isEditMode && (
        <div className="flex justify-center gap-4 pt-8 mt-auto">
          <button
            onClick={addPair}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card Pair</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 disabled:bg-gray-600/50 text-white rounded-lg transition-colors shadow-md text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 disabled:bg-gray-600/50 text-white rounded-lg transition-colors shadow-md text-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

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
