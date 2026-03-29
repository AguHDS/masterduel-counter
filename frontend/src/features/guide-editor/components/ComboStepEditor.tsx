import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep, Card } from "@/features/archetypes/types";

interface ComboStepEditorProps {
  comboSteps: ComboStep[];
  setComboSteps: React.Dispatch<React.SetStateAction<ComboStep[]>>;
  initialHandId: string;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

type CardSelectionMode = {
  stepId: string;
  type: "main" | "sub" | "leftSub";
} | null;

export const ComboStepEditor = ({
  comboSteps,
  setComboSteps,
  initialHandId: _initialHandId,
  onModalStateChange,
  forceCloseModal = false,
}: ComboStepEditorProps) => {
  const [selectingCards, setSelectingCards] = useState<CardSelectionMode>(null);

  useEffect(() => {
    if (forceCloseModal && selectingCards) {
      setSelectingCards(null);
    }
  }, [forceCloseModal]);

  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(!!selectingCards);
    }
  }, [selectingCards, onModalStateChange]);

  const addStep = () => {
    const newStep: ComboStep = {
      id: `step-${Date.now()}`,
      stepOrder: comboSteps.length,
      description: "",
      mainCards: [],
      subCards: [],
      leftSubCards: [],
    };
    setComboSteps([...comboSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setComboSteps(comboSteps.filter((s) => s.id !== stepId));
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingCards) return;

    setComboSteps(
      comboSteps.map((step) => {
        if (step.id === selectingCards.stepId) {
          if (selectingCards.type === "main") {
            // Limit to 1 main card per step
            if (step.mainCards.length >= 1) {
              alert("Maximum 1 main card per step");
              return step;
            }
            return { ...step, mainCards: [card] };
          } else if (selectingCards.type === "sub") {
            if (step.subCards.length >= 5) {
              alert("Maximum 5 sub cards per step");
              return step;
            }
            return { ...step, subCards: [...step.subCards, card] };
          } else if (selectingCards.type === "leftSub") {
            if (step.leftSubCards.length >= 5) {
              alert("Maximum 5 left sub cards per step");
              return step;
            }
            return { ...step, leftSubCards: [...step.leftSubCards, card] };
          }
        }
        return step;
      }),
    );
  };

  const removeCard = (
    stepId: string,
    cardIndex: number,
    type: "main" | "sub" | "leftSub",
  ) => {
    setComboSteps(
      comboSteps.map((step) => {
        if (step.id === stepId) {
          if (type === "main") {
            // When removing main card, also remove all sub cards
            return { ...step, mainCards: [], subCards: [], leftSubCards: [] };
          } else if (type === "sub") {
            const newSubCards = [...step.subCards];
            newSubCards.splice(cardIndex, 1);
            return { ...step, subCards: newSubCards };
          } else if (type === "leftSub") {
            const newLeftSubCards = [...step.leftSubCards];
            newLeftSubCards.splice(cardIndex, 1);
            return { ...step, leftSubCards: newLeftSubCards };
          }
        }
        return step;
      }),
    );
  };

  const handleDescriptionChange = (stepId: string, description: string) => {
    setComboSteps(
      comboSteps.map((step) =>
        step.id === stepId ? { ...step, description } : step,
      ),
    );
  };

  const sortedSteps = [...comboSteps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="space-y-4">
      {sortedSteps.length === 0 ? (
        <button
          onClick={addStep}
          className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-500/50 rounded-lg hover:border-blue-400 hover:bg-blue-500/10 transition-colors group"
        >
          <Plus className="w-8 h-8 text-blue-400 group-hover:text-blue-300 mb-2" />
          <span className="text-sm text-blue-400 group-hover:text-blue-300">
            Add First Step
          </span>
        </button>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {sortedSteps.map((step, index) => (
              <div
                key={step.id}
                className="relative bg-slate-800/50 border-2 border-blue-500/40 rounded-lg p-8"
              >
                {/* Step Number Badge - Top Left */}
                <div className="absolute top-2 left-2">
                  <span className="inline-block px-2 py-0.5 text-yellow-500 text-xs font-bold rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                  title="Remove step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Vertical Layout: Left Sub Cards + Main Cards + Right Sub Cards */}
                <div className="mb-3">
                  <div className="flex justify-center m-auto items-start gap-3 w-fit">
                    {/* Left Sub Cards with placeholders (vertical stack) - Always show 5 slots */}
                    {step.mainCards.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {[...Array(5)].map((_, slotIndex) => {
                          const card = step.leftSubCards[slotIndex];
                          return (
                            <div key={slotIndex}>
                              {card ? (
                                <div className="relative group">
                                  <CardTooltip
                                    cardId={card.id}
                                    imageUrl={
                                      card.imageUrl || card.imageUrlSmall
                                    }
                                    cardName={card.name}
                                  >
                                    <img
                                      src={card.imageUrlSmall || card.imageUrl}
                                      alt={card.name}
                                      className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                    />
                                  </CardTooltip>
                                  <button
                                    onClick={() =>
                                      removeCard(step.id, slotIndex, "leftSub")
                                    }
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    title="Remove card"
                                  >
                                    <X className="w-2 h-2 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setSelectingCards({
                                      stepId: step.id,
                                      type: "leftSub",
                                    })
                                  }
                                  className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                  title="Add card"
                                >
                                  <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Equals separator - Always visible when there's a main card (in edit mode) */}
                    {step.mainCards.length > 0 && (
                      <span className="text-blue-400 text-2xl font-bold self-center">
                        =
                      </span>
                    )}

                    {/* Main Card */}
                    <div className="flex gap-2">
                      {step.mainCards.map((card, cardIndex) => (
                        <div key={cardIndex} className="relative group">
                          <CardTooltip
                            cardId={card.id}
                            imageUrl={card.imageUrl || card.imageUrlSmall}
                            cardName={card.name}
                          >
                            <img
                              src={card.imageUrlSmall || card.imageUrl}
                              alt={card.name}
                              className="w-20 h-28 object-cover hover:scale-105 transition-transform"
                            />
                          </CardTooltip>
                          <button
                            onClick={() =>
                              removeCard(step.id, cardIndex, "main")
                            }
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                            title="Remove card"
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      {step.mainCards.length === 0 && (
                        <button
                          onClick={() =>
                            setSelectingCards({ stepId: step.id, type: "main" })
                          }
                          className="w-20 h-28 border-2 border-dashed border-blue-500 rounded flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-blue-400 mb-1" />
                          <span className="text-[10px] text-blue-400">
                            Main
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Plus separator (only if there are main cards) */}
                    {step.mainCards.length > 0 && (
                      <span className="text-blue-400 text-2xl font-bold self-center">
                        +
                      </span>
                    )}

                    {/* Sub Cards with placeholders (vertical stack) - Always show 5 slots */}
                    {step.mainCards.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {[...Array(5)].map((_, slotIndex) => {
                          const card = step.subCards[slotIndex];
                          return (
                            <div key={slotIndex}>
                              {card ? (
                                <div className="relative group">
                                  <CardTooltip
                                    cardId={card.id}
                                    imageUrl={
                                      card.imageUrl || card.imageUrlSmall
                                    }
                                    cardName={card.name}
                                  >
                                    <img
                                      src={card.imageUrlSmall || card.imageUrl}
                                      alt={card.name}
                                      className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                    />
                                  </CardTooltip>
                                  <button
                                    onClick={() =>
                                      removeCard(step.id, slotIndex, "sub")
                                    }
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    title="Remove card"
                                  >
                                    <X className="w-2 h-2 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setSelectingCards({
                                      stepId: step.id,
                                      type: "sub",
                                    })
                                  }
                                  className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                  title="Add card"
                                >
                                  <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Remove add main card button - only 1 main card allowed */}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-blue-400 font-semibold text-xs mb-2 m-auto flex justify-center">
                    Description (Optional)
                  </label>
                  <textarea
                    value={step.description || ""}
                    onChange={(e) =>
                      handleDescriptionChange(step.id, e.target.value)
                    }
                    maxLength={500}
                    placeholder="Describe this step (Max. 500 characters)..."
                    className="w-full max-w-[280px] px-2 py-1.5 bg-slate-700/50 text-white text-xs rounded 
                               border border-slate-600 focus:outline-none focus:border-blue-500 
                               resize-y min-h-[60px] scrollbar-homeAllPages"
                    rows={3}
                  />
                  <div className="text-xs text-slate-400 mt-0.5 text-right max-w-[280px]">
                    {(step.description || "").length}/500
                  </div>
                </div>
              </div>
            ))}
            {/* Add Step Placeholder */}
            <button
              onClick={addStep}
              className="relative bg-slate-800/30 border-2 border-dashed border-blue-500/50 max-w-[60%] rounded-lg p-4 pt-8 hover:border-blue-400 hover:bg-blue-500/10 transition-colors group flex items-center justify-center"
            >
              <div className="flex flex-col items-center">
                <Plus className="w-8 h-8 text-blue-400 group-hover:text-blue-300 mb-2" />
                <span className="text-sm text-blue-400 group-hover:text-blue-300">
                  Add Combo Step
                </span>
              </div>
            </button>
          </div>
        </>
      )}

      <CardSearchModal
        isOpen={!!selectingCards}
        onClose={() => setSelectingCards(null)}
        onSelectCard={handleCardSelected}
        title={
          selectingCards?.type === "main"
            ? "Select Main Card"
            : selectingCards?.type === "leftSub"
              ? "Select Left Sub Card"
              : "Select Right Sub Card"
        }
        variant="sidebar"
        autoCloseAfterSelect={false}
      />
    </div>
  );
};
