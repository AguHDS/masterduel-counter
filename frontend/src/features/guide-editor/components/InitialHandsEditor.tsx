import { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import { FloatingCardSearchModal } from "./FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card, ComboStep } from "@/features/archetypes/types";
import { FinalBoardPreview, type FieldBoard } from "./FinalBoardPreview";

export interface InitialHand {
  id: string;
  cards: Card[];
  description?: string;
}

interface InitialHandsEditorProps {
  isEditMode: boolean;
  initialHands: InitialHand[];
  setInitialHands: React.Dispatch<React.SetStateAction<InitialHand[]>>;
  onAddHand?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
  selectedHandId?: string | null;
  onSelectHand?: (handId: string) => void;
  onAddCombo?: (handId: string) => void;
  onShowCombo?: (handId: string) => void;
  comboSteps?: Map<string, ComboStep[]>;
  fieldBoards?: Map<string, FieldBoard>;
  onFieldBoardChange?: (handId: string, board: FieldBoard | null) => void;
}

export const InitialHandsEditor = ({
  isEditMode,
  initialHands,
  setInitialHands,
  onAddHand: _onAddHand,
  onModalStateChange,
  forceCloseModal = false,
  selectedHandId: _selectedHandId,
  onSelectHand: _onSelectHand,
  onAddCombo,
  onShowCombo,
  comboSteps,
  fieldBoards,
  onFieldBoardChange,
}: InitialHandsEditorProps) => {
  const [selectingHandId, setSelectingHandId] = useState<string | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [activeModalComponent, setActiveModalComponent] = useState<
    "card-search" | "field-board" | null
  >(null);
  const [selectedPreviewHandId, setSelectedPreviewHandId] = useState<
    string | null
  >(null);
  // handle green highlight in non-editing mode
  const [selectedShowHandId, setSelectedShowHandId] = useState<string | null>(
    null,
  );
  // state to manage which hand is being edited
  const [editingHandId, setEditingHandId] = useState<string | null>(null);

  useEffect(() => {
    if (forceCloseModal && selectingHandId) {
      setSelectingHandId(null);
    }
  }, [forceCloseModal]);

  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(activeModalComponent !== null);
    }
  }, [activeModalComponent, onModalStateChange]);

  useEffect(() => {
    // Reset selection state when editing mode changes
    if (!isEditMode) {
      setSelectedShowHandId(null);
      setSelectedPreviewHandId(null);
      setEditingHandId(null);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode && initialHands.length > 0 && !selectedShowHandId) {
      const firstHand = initialHands[0];
      if (
        comboSteps?.has(firstHand.id) &&
        comboSteps.get(firstHand.id)!.length > 0
      ) {
        setSelectedShowHandId(firstHand.id);
      }
    }
  }, [isEditMode, initialHands, comboSteps, selectedShowHandId]);

  const addInitialHand = () => {
    const newHand: InitialHand = {
      id: `hand-${Date.now()}`,
      cards: [],
    };
    setInitialHands([...initialHands, newHand]);
    // Auto-select the new hand for editing
    setEditingHandId(newHand.id);
    // Limpiar preview al crear nueva mano
    setSelectedPreviewHandId(null);
  };

  const removeInitialHand = (handId: string) => {
    setInitialHands(initialHands.filter((h) => h.id !== handId));
    if (fieldBoards && onFieldBoardChange) {
      onFieldBoardChange(handId, null);
    }
    if (selectedPreviewHandId === handId) {
      setSelectedPreviewHandId(null);
    }
    if (editingHandId === handId) {
      setEditingHandId(null);
    }
  };

  const updateHandDescription = (handId: string, description: string) => {
    const limitedDescription = description.slice(0, 50);
    setInitialHands(
      initialHands.map((hand) =>
        hand.id === handId
          ? { ...hand, description: limitedDescription }
          : hand,
      ),
    );
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
    setActiveModalComponent(null);
  };

  const handleAddFieldPreview = (handId: string) => {
    if (!onFieldBoardChange) return;

    setSelectedPreviewHandId(handId);

    if (fieldBoards?.has(handId)) {
      return;
    }

    const newBoard: FieldBoard = {
      id: `field-${Date.now()}`,
      fieldSpell: null,
      extraMonsters: [null, null],
      monsters: [null, null, null, null, null],
      spellTraps: [null, null, null, null, null],
      hand: [null, null, null, null, null],
      graveyard: [],
      banished: [],
    };

    onFieldBoardChange(handId, newBoard);
  };

  const handleDeleteFieldPreview = (handId: string) => {
    if (!onFieldBoardChange) return;
    onFieldBoardChange(handId, null);
    if (selectedPreviewHandId === handId) {
      setSelectedPreviewHandId(null);
    }
  };

  const handleEditHand = (handId: string) => {
    // if we are changing to a different hand, we clear the preview
    if (editingHandId !== handId) {
      setSelectedPreviewHandId(null);
      // notify parent that hand selection changed
      _onSelectHand?.(handId);
    }
    setEditingHandId(handId);
  };

  const getCardRotation = (index: number, totalCards: number) => {
    if (totalCards === 1) return 0;
    const maxRotation =
      totalCards === 5
        ? 60
        : totalCards === 4
          ? 50
          : totalCards === 3
            ? 45
            : totalCards === 2
              ? 25
              : 0;
    const step = (maxRotation * 2) / (totalCards - 1);
    return -maxRotation + step * index;
  };

  const getCardTranslateY = (index: number, totalCards: number) => {
    if (totalCards === 1) return 14;
    const center = (totalCards - 1) / 2;
    const distanceFromCenter = Math.abs(index - center);

    const maxElevation =
      totalCards === 5
        ? 22
        : totalCards === 4
          ? 20
          : totalCards === 3
            ? 22
            : totalCards === 2
              ? 15
              : 0;
    const dropFactor =
      totalCards === 5
        ? 3.5
        : totalCards === 4
          ? 3.8
          : totalCards === 3
            ? 4
            : 3;

    return maxElevation - distanceFromCenter * distanceFromCenter * dropFactor;
  };

  const getSelectedHandTitle = () => {
    if (!selectedPreviewHandId) return undefined;
    const index = initialHands.findIndex((h) => h.id === selectedPreviewHandId);
    return index !== -1 ? `Hand #${index + 1}` : undefined;
  };

  // Función para manejar el clic en "Show" en modo no-edición
  const handleShowHandContent = (handId: string) => {
    setSelectedShowHandId(handId);
    // Llamar a la función original si existe para mantener compatibilidad
    onShowCombo?.(handId);
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {initialHands.map((hand, index) => {
              const hasFieldBoard = fieldBoards?.has(hand.id);
              const isPreviewSelected = selectedPreviewHandId === hand.id;
              const isShowSelected =
                !isEditMode && selectedShowHandId === hand.id;
              const isEditing = isEditMode && editingHandId === hand.id;
              const isNewEmptyHand =
                hand.cards.length === 0 && !hand.description;

              return (
                <div key={hand.id} className="space-y-3">
                  <div
                    className={`relative bg-gray-900/50 border-blue-500/40 cursor-default border rounded-sm p-3 flex flex-col overflow-hidden transition-all ${
                      isPreviewSelected ? "ring-2 ring-green-500/50" : ""
                    } ${
                      isShowSelected
                        ? "ring-2 ring-green-500/70 bg-green-900/30"
                        : ""
                    } ${
                      isEditing
                        ? "ring-2 ring-yellow-500/90 bg-yellow-500/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-yellow-200">
                        Hand #{index + 1}
                      </h4>

                      <div className="flex items-center gap-1">
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingHandId(null);
                                  setSelectedPreviewHandId(null);
                                } else {
                                  handleEditHand(hand.id);
                                }
                              }}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-blue-400 hover:text-blue-300 transition-colors"
                              title={
                                isEditing ? "Cancel editing" : "Edit this hand"
                              }
                            >
                              {isEditing ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Edit2 className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => removeInitialHand(hand.id)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-red-500 hover:text-red-400 transition-colors"
                              title="Remove this hand"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditMode && !isEditing && isNewEmptyHand && (
                      <div className="relative top-10 text-md text-gray-400 text-center leading-tight h-0 pointer-events-auto z-10">
                        <button
                          onClick={() => handleEditHand(hand.id)}
                          className="text-blue-400 hover:text-blue-300  underline transition-colors inline"
                        >
                          Edit Hand #{index + 1}
                        </button>
                      </div>
                    )}

                    <div className="flex items-end justify-center h-24 relative px-2">
                      {hand.cards.length === 0 ? (
                        <div className="text-gray-500 text-xs">Empty</div>
                      ) : (
                        <div className="relative flex justify-center items-end h-full w-full scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100">
                          {hand.cards.map((card, cardIndex) => {
                            const rotation = getCardRotation(
                              cardIndex,
                              hand.cards.length,
                            );
                            const translateY = getCardTranslateY(
                              cardIndex,
                              hand.cards.length,
                            );
                            const zIndex = cardIndex;
                            const spacingScale =
                              hand.cards.length === 5
                                ? 15
                                : hand.cards.length === 4
                                  ? 14
                                  : hand.cards.length === 3
                                    ? 16
                                    : hand.cards.length === 2
                                      ? 12
                                      : 0;
                            const horizontalOffset =
                              (cardIndex - (hand.cards.length - 1) / 2) *
                              spacingScale;

                            return (
                              <div
                                key={`${hand.id}-${card.id}-${cardIndex}`}
                                className="absolute group"
                                style={{
                                  transform: `translateX(${horizontalOffset}px) translateY(-${translateY}px) rotate(${rotation}deg)`,
                                  transformOrigin: "center bottom",
                                  zIndex: zIndex,
                                  transition: "transform 0.3s ease",
                                  bottom: "0",
                                }}
                              >
                                <CardTooltip
                                  cardId={card.id}
                                  imageUrl={card.imageUrl}
                                  cardName={card.name}
                                >
                                  <img
                                    src={card.imageUrlSmall}
                                    alt={card.name}
                                    className="w-14 h-20 object-cover hover:scale-110 hover:-translate-y-6 transition-all"
                                  />
                                </CardTooltip>

                                {isEditMode && isEditing && (
                                  <button
                                    onClick={() =>
                                      removeCardFromHand(hand.id, cardIndex)
                                    }
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-[9999] group-hover:-translate-y-6"
                                    title="Remove card"
                                  >
                                    <X className="w-2.5 h-2.5 text-white " />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {isEditMode && isEditing && (
                      <button
                        onClick={(e) => {
                          setAnchorElement(e.currentTarget);
                          setSelectingHandId(hand.id);
                          setActiveModalComponent("card-search");
                        }}
                        disabled={hand.cards.length >= 5}
                        className={`mt-2 w-full py-1 border-2 border-dashed rounded flex items-center justify-center transition-colors ${
                          hand.cards.length >= 5
                            ? "opacity-0 pointer-events-none border-transparent"
                            : "border-blue-500 hover:border-blue-400 hover:bg-blue-500/10"
                        }`}
                      >
                        <Plus className="w-3 h-3 text-blue-400" />
                      </button>
                    )}

                    <div className="mt-1 text-xs text-gray-400 text-center">
                      {hand.cards.length}/5
                    </div>

                    <div className="min-h-[2.5rem] mt-1">
                      {isEditMode && isEditing ? (
                        <input
                          type="text"
                          value={hand.description || ""}
                          onChange={(e) =>
                            updateHandDescription(hand.id, e.target.value)
                          }
                          placeholder="Description (optional)"
                          maxLength={50}
                          className="w-full px-2 py-1 text-xs text-gray-300 bg-gray-800/50 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-center placeholder-gray-500"
                        />
                      ) : (
                        <div className="text-xs text-blue-300 text-center line-clamp-2">
                          {hand.description || "No description"}
                        </div>
                      )}
                    </div>

                    {isEditMode && isEditing && onAddCombo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddCombo(hand.id);
                        }}
                        className="mt-2 w-full py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded flex items-center justify-center gap-1 transition-colors group"
                      >
                        <Plus className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
                        <span className="text-xs text-purple-400 group-hover:text-purple-300 font-medium">
                          {comboSteps &&
                          comboSteps.has(hand.id) &&
                          comboSteps.get(hand.id)!.length > 0
                            ? "Edit Combo"
                            : "Add Combo"}
                        </span>
                      </button>
                    )}

                    {isEditMode && isEditing && onFieldBoardChange && (
                      <button
                        onClick={() => handleAddFieldPreview(hand.id)}
                        className={`mt-2 w-full py-1 rounded flex items-center justify-center gap-1 transition-colors group ${
                          hasFieldBoard && isPreviewSelected
                            ? "bg-green-600/40 border border-green-500/70"
                            : hasFieldBoard
                              ? "bg-green-600/20 hover:bg-green-600/40 border border-green-500/50"
                              : "bg-green-600/20 hover:bg-green-600/40 border border-green-500/50"
                        }`}
                      >
                        <Plus className="w-3 h-3 text-green-400 group-hover:text-green-300" />
                        <span className="text-xs text-green-400 group-hover:text-green-300 font-medium">
                          {hasFieldBoard && isPreviewSelected
                            ? "Viewing Field Preview"
                            : hasFieldBoard
                              ? "View Field Preview"
                              : "Add Field Preview"}
                        </span>
                      </button>
                    )}

                    {!isEditMode && (
                      <>
                        {comboSteps &&
                        comboSteps.has(hand.id) &&
                        comboSteps.get(hand.id)!.length > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowHandContent(hand.id);
                            }}
                            className={`mt-2 w-full py-1 border rounded flex items-center justify-center gap-1 group ${
                              isShowSelected
                                ? "bg-green-600/30 border-green-500/70"
                                : "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
                            }`}
                          >
                            <span
                              className={`text-xs font-medium ${
                                isShowSelected
                                  ? "text-green-300"
                                  : "text-blue-400 group-hover:text-blue-300"
                              }`}
                            >
                              Show
                            </span>
                          </button>
                        ) : (
                          <div className="mt-2 w-full py-1 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No combo created
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditMode && (
              <div className="space-y-3">
                <button
                  onClick={addInitialHand}
                  className="w-full relative bg-gray-900/30 border-2 border-dashed border-blue-500/40 hover:border-blue-500/60 hover:bg-gray-900/50 cursor-pointer rounded-sm p-3 flex flex-col items-center justify-center transition-all group min-h-[210px]"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Plus className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                      Add Hand
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to create new hand
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {selectedPreviewHandId && fieldBoards?.has(selectedPreviewHandId) && (
            <div className="mt-8 pt-4">
              <FinalBoardPreview
                isEditMode={isEditMode}
                fieldBoard={fieldBoards.get(selectedPreviewHandId) || null}
                onFieldBoardChange={(board) =>
                  onFieldBoardChange?.(selectedPreviewHandId, board)
                }
                onDelete={() => handleDeleteFieldPreview(selectedPreviewHandId)}
                onModalStateChange={(isOpen) => {
                  setActiveModalComponent(isOpen ? "field-board" : null);
                }}
                forceCloseModal={
                  activeModalComponent !== null &&
                  activeModalComponent !== "field-board"
                }
                selectedHandTitle={getSelectedHandTitle()}
              />
            </div>
          )}
        </>
      )}

      <FloatingCardSearchModal
        isOpen={!!selectingHandId && activeModalComponent === "card-search"}
        onClose={() => {
          setSelectingHandId(null);
          setAnchorElement(null);
          setActiveModalComponent(null);
        }}
        onSelectCard={handleCardSelected}
        title="Select Card for Initial Hand"
        anchorElement={anchorElement}
        autoCloseAfterSelect={false}
      />
    </div>
  );
};
