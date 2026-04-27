import { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit2, Copy } from "lucide-react";
import { FloatingCardSearchModal } from "../../../archetypes/components/FloatingCardSearchModal";
import type { Card, ComboStep } from "@/features/archetypes/types";
import { FinalBoardPreview, type FieldBoard } from "./FinalBoardPreview";
import { HandFanDisplay } from "./HandFanDisplay";

export interface InitialHand {
  id: string;
  cards: Card[];
  description?: string;
  finalBoard?: FieldBoard | null;
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
  onDuplicateHand?: (originalHandId: string, newHandId: string) => void;
}

// Module-level helper so Date.now() is not called directly inside the component body
const makeDuplicatedHand = (original: InitialHand): InitialHand => {
  const ts = Date.now();
  return {
    ...original,
    id: `hand-${ts}`,
    finalBoard: original.finalBoard
      ? { ...original.finalBoard, id: `field-${ts}` }
      : undefined,
  };
};

/**
 * Editor component for managing initial hands in Deck guides
 * Each hand contains up to 5 cards and can have an optional final board preview and combo steps
 * Supports adding, editing, duplicating, and deleting initial hands
 */
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
  onDuplicateHand,
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
  const currentPreviewHandId = isEditMode
    ? selectedPreviewHandId
    : selectedShowHandId;

  // Drag-and-drop state for reordering hands
  const [draggedHandIndex, setDraggedHandIndex] = useState<number | null>(null);
  const [dragOverHandIndex, setDragOverHandIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (forceCloseModal && selectingHandId) {
      setSelectingHandId(null);
    }
  }, [forceCloseModal, selectingHandId]);

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
    // In view mode, auto-select the first hand that has something meaningful to show.
    if (!isEditMode && initialHands.length > 0 && !selectedShowHandId) {
      const firstHand = initialHands[0];
      if (
        firstHand.finalBoard ||
        (comboSteps?.has(firstHand.id) &&
          comboSteps.get(firstHand.id)!.length > 0)
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

  const createEmptyFieldBoard = (handId: string): FieldBoard => ({
    id: `field-${handId}`,
    fieldSpell: null,
    extraMonsters: [null, null],
    monsters: [null, null, null, null, null],
    spellTraps: [null, null, null, null, null],
    hand: [null, null, null, null, null],
    graveyard: [],
    banished: [],
  });

  const updateHandFinalBoard = (handId: string, board: FieldBoard | null) => {
    // Keep the final board inside the hand state so load/save/cancel use one source of truth.
    setInitialHands(
      initialHands.map((hand) => {
        if (hand.id !== handId) {
          return hand;
        }

        if (board === null) {
          const { finalBoard: _finalBoard, ...rest } = hand;
          return rest;
        }

        return {
          ...hand,
          finalBoard: board,
        };
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
    setSelectedPreviewHandId(handId);

    if (initialHands.find((hand) => hand.id === handId)?.finalBoard) {
      return;
    }

    updateHandFinalBoard(handId, createEmptyFieldBoard(handId));
  };

  const handleDeleteFieldPreview = (handId: string) => {
    updateHandFinalBoard(handId, null);
    if (selectedPreviewHandId === handId) {
      setSelectedPreviewHandId(null);
    }
  };

  const handleEditHand = (handId: string) => {
    const handToEdit = initialHands.find((hand) => hand.id === handId);

    if (editingHandId !== handId) {
      _onSelectHand?.(handId);
    }

    if (!handToEdit?.finalBoard) {
      updateHandFinalBoard(handId, createEmptyFieldBoard(handId));
    }

    setSelectedPreviewHandId(handId);
    setEditingHandId(handId);
  };

  const handleDuplicateHand = (handId: string) => {
    const handToDuplicate = initialHands.find((h) => h.id === handId);
    if (!handToDuplicate) return;

    const duplicatedHand = makeDuplicatedHand(handToDuplicate);
    const handIndex = initialHands.findIndex((h) => h.id === handId);
    const newHands = [...initialHands];
    newHands.splice(handIndex + 1, 0, duplicatedHand);
    setInitialHands(newHands);
    onDuplicateHand?.(handId, duplicatedHand.id);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedHandIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverHandIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedHandIndex === null || draggedHandIndex === dropIndex) {
      setDraggedHandIndex(null);
      setDragOverHandIndex(null);
      return;
    }
    // Reorder the hands array
    const reordered = [...initialHands];
    const [moved] = reordered.splice(draggedHandIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setInitialHands(reordered);
    setDraggedHandIndex(null);
    setDragOverHandIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedHandIndex(null);
    setDragOverHandIndex(null);
  };

  const getSelectedHandTitle = () => {
    if (!currentPreviewHandId) return undefined;
    const index = initialHands.findIndex((h) => h.id === currentPreviewHandId);
    return index !== -1 ? `Hand #${index + 1}` : undefined;
  };

  // Función para manejar el clic en "Show" en modo no-edición
  const handleShowHandContent = (handId: string) => {
    // In view mode, the selected hand drives both combo flow and final board preview.
    setSelectedShowHandId(handId);
    // Llamar a la función original si existe para mantener compatibilidad
    onShowCombo?.(handId);
  };

  if (!isEditMode && initialHands.length === 0) {
    return null;
  }

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
        <div className="flex flex-col items-center justify-center p-12">
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
              const hasFieldBoard = !!hand.finalBoard;
              const isPreviewSelected = selectedPreviewHandId === hand.id;
              const isShowSelected =
                !isEditMode && selectedShowHandId === hand.id;
              const isEditing = isEditMode && editingHandId === hand.id;
              const isNewEmptyHand =
                hand.cards.length === 0 && !hand.description;
              const isDragging = draggedHandIndex === index;
              const isDragOver =
                dragOverHandIndex === index && draggedHandIndex !== index;

              return (
                <div
                  key={hand.id}
                  className={`space-y-3 transition-all ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "ring-2 ring-blue-400/70 rounded-sm" : ""}`}
                  onDragOver={(e) => isEditMode && handleDragOver(e, index)}
                  onDrop={(e) => isEditMode && handleDrop(e, index)}
                  onDragEnd={() => isEditMode && handleDragEnd()}
                >
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
                    {isEditMode && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        className="absolute top-0.5 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing py-1 px-3 rounded hover:bg-slate-700/30 transition-colors z-20"
                        title="Drag to reorder"
                      >
                        <div className="grid grid-cols-3 gap-[2px]">
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                          <div className="w-1 h-1 bg-slate-500 rounded-full" />
                        </div>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />

                    <div className="relative z-10 flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-semibold text-yellow-200">
                          Hand #{index + 1}
                        </h4>
                      </div>

                      <div className="flex items-center">
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => handleDuplicateHand(hand.id)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-gray-400 hover:text-gray-200 transition-colors"
                              title="Duplicate this hand"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
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

                    <div className="relative z-10 flex items-end justify-center h-24 px-2">
                      <HandFanDisplay
                        cards={hand.cards}
                        isEditing={isEditMode && isEditing}
                        onRemoveCard={(cardIndex) =>
                          removeCardFromHand(hand.id, cardIndex)
                        }
                      />
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

                    <div className="relative z-10 mt-1 text-xs text-gray-400 text-center">
                      {hand.cards.length}/5
                    </div>

                    <div className="relative z-10 min-h-[2.5rem] mt-1">
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

                    {isEditMode && isEditing && (
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
                              ? "Edit Field Preview"
                              : "Add Field Preview"}
                        </span>
                      </button>
                    )}

                    {!isEditMode && (
                      <>
                        {hand.finalBoard ||
                        (comboSteps &&
                          comboSteps.has(hand.id) &&
                          comboSteps.get(hand.id)!.length > 0) ? (
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

          {currentPreviewHandId &&
            initialHands.find((hand) => hand.id === currentPreviewHandId)
              ?.finalBoard && (
              <div className="mt-8 pt-4">
                <FinalBoardPreview
                  isEditMode={isEditMode}
                  fieldBoard={
                    initialHands.find(
                      (hand) => hand.id === currentPreviewHandId,
                    )?.finalBoard || null
                  }
                  onFieldBoardChange={(board) =>
                    updateHandFinalBoard(currentPreviewHandId, board)
                  }
                  onDelete={() =>
                    handleDeleteFieldPreview(currentPreviewHandId)
                  }
                  onModalStateChange={(isOpen) => {
                    if (isOpen) {
                      setActiveModalComponent("field-board");
                    } else {
                      // Only reset if field-board was the active modal — avoid
                      // overwriting "card-search" when this callback fires
                      // spuriously due to re-renders.
                      setActiveModalComponent((prev) =>
                        prev === "field-board" ? null : prev,
                      );
                    }
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
