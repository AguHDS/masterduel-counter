import { useState, useEffect, useRef } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { FloatingCardSearchModal } from "./FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { ComboStep, Card } from "@/features/archetypes/types";
import ChainImg from "@/assets/ChainCyan.webp";

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
  const [activeCanceledStepId, setActiveCanceledStepId] = useState<
    string | null
  >(null);
  const [expandedLeftSteps, setExpandedLeftSteps] = useState<Set<string>>(
    new Set(),
  );
  const [expandedRightSteps, setExpandedRightSteps] = useState<Set<string>>(
    new Set(),
  );
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [chainPickerOpen, setChainPickerOpen] = useState<{
    stepId: string;
    cardType: "main" | "sub" | "leftSub";
    cardIndex: number;
  } | null>(null);
  const chainPickerRef = useRef<HTMLDivElement>(null);

  // Close chain picker on outside click
  useEffect(() => {
    if (!chainPickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (chainPickerRef.current && !chainPickerRef.current.contains(e.target as Node)) {
        setChainPickerOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [chainPickerOpen]);

  const updateChainNumber = (
    stepId: string,
    cardType: "main" | "sub" | "leftSub",
    cardIndex: number,
    chainNumber: number | null,
  ) => {
    setComboSteps((prev) =>
      prev.map((step) => {
        if (step.id !== stepId) return step;
        const updateCards = (cards: Card[]) => {
          const updated = [...cards];
          if (updated[cardIndex]) {
            updated[cardIndex] = { ...updated[cardIndex], chainNumber };
          }
          return updated;
        };
        if (cardType === "main") return { ...step, mainCards: updateCards(step.mainCards) };
        if (cardType === "sub") return { ...step, subCards: updateCards(step.subCards) };
        if (cardType === "leftSub") return { ...step, leftSubCards: updateCards(step.leftSubCards) };
        return step;
      }),
    );
    setChainPickerOpen(null);
  };

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

  // Helper function to get steps in correct visual order for a specific flow
  const getStepsInOrder = (
    steps: ComboStep[],
    parentId: string | null,
  ): ComboStep[] => {
    const filteredSteps = steps.filter(
      (s) => s.parentCanceledStepId === parentId,
    );
    return [...filteredSteps].sort((a, b) => a.stepOrder - b.stepOrder);
  };

  // Get the steps to display based on active canceled flow
  const getVisibleSteps = (): ComboStep[] => {
    const mainFlowSteps = getStepsInOrder(comboSteps, null);

    if (activeCanceledStepId) {
      // Find the index of the canceled step in main flow
      const canceledStepIndex = mainFlowSteps.findIndex(
        (s) => s.id === activeCanceledStepId,
      );

      // Show main flow steps UP TO and INCLUDING the canceled step
      const stepsBeforeCanceled = mainFlowSteps.slice(0, canceledStepIndex + 1);

      // Show the canceled alternative steps for this step
      const canceledSteps = getStepsInOrder(comboSteps, activeCanceledStepId);

      return [...stepsBeforeCanceled, ...canceledSteps];
    } else {
      // Show all main flow steps (no parent)
      return mainFlowSteps;
    }
  };

  // Swap two steps within a flow and reassign sequential stepOrder
  const swapSteps = (
    steps: ComboStep[],
    draggedId: string,
    targetId: string,
    parentId: string | null,
  ): ComboStep[] => {
    // Get all steps in this flow
    const flowSteps = steps.filter((s) => s.parentCanceledStepId === parentId);
    const otherSteps = steps.filter((s) => s.parentCanceledStepId !== parentId);

    // Find indices
    const draggedIndex = flowSteps.findIndex((s) => s.id === draggedId);
    const targetIndex = flowSteps.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return steps;

    // Create a new array with swapped positions
    const swappedFlowSteps = [...flowSteps];
    [swappedFlowSteps[draggedIndex], swappedFlowSteps[targetIndex]] = [
      swappedFlowSteps[targetIndex],
      swappedFlowSteps[draggedIndex],
    ];

    // Assign sequential stepOrder based on new order
    const updatedFlowSteps = swappedFlowSteps.map((step, idx) => ({
      ...step,
      stepOrder: idx,
    }));

    return [...otherSteps, ...updatedFlowSteps];
  };

  const addStep = () => {
    // Get current steps in the flow where we're adding
    let currentFlowSteps: ComboStep[];
    if (activeCanceledStepId) {
      currentFlowSteps = comboSteps.filter(
        (s) => s.parentCanceledStepId === activeCanceledStepId,
      );
    } else {
      currentFlowSteps = comboSteps.filter((s) => !s.parentCanceledStepId);
    }

    const newStepOrder = currentFlowSteps.length;

    const newStep: ComboStep = {
      id: `step-${Date.now()}`,
      stepOrder: newStepOrder,
      description: "",
      parentCanceledStepId: activeCanceledStepId || null,
      mainCards: [],
      subCards: [],
      leftSubCards: [],
    };
    setComboSteps([...comboSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    const stepToRemove = comboSteps.find((s) => s.id === stepId);
    if (!stepToRemove) return;

    // Remove the step
    let updatedSteps = comboSteps.filter((s) => s.id !== stepId);

    // If removing a main flow step, also remove all its canceled steps
    if (!stepToRemove.parentCanceledStepId) {
      updatedSteps = updatedSteps.filter(
        (s) => s.parentCanceledStepId !== stepId,
      );
    }

    // Reorder main flow steps to be sequential
    const mainFlowSteps = updatedSteps.filter((s) => !s.parentCanceledStepId);
    const reorderedMainFlow = mainFlowSteps.map((step, idx) => ({
      ...step,
      stepOrder: idx,
    }));

    // Group canceled steps by parent and reorder each group
    const canceledSteps = updatedSteps.filter((s) => s.parentCanceledStepId);
    const canceledByParent = new Map<string, ComboStep[]>();
    canceledSteps.forEach((step) => {
      const parentId = step.parentCanceledStepId!;
      if (!canceledByParent.has(parentId)) {
        canceledByParent.set(parentId, []);
      }
      canceledByParent.get(parentId)!.push(step);
    });

    const reorderedCanceled: ComboStep[] = [];
    canceledByParent.forEach((steps, _parentId) => {
      const sortedSteps = steps.sort((a, b) => a.stepOrder - b.stepOrder);
      sortedSteps.forEach((step, idx) => {
        reorderedCanceled.push({ ...step, stepOrder: idx });
      });
    });

    setComboSteps([...reorderedMainFlow, ...reorderedCanceled]);
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

  const toggleCanceledFlow = (stepId: string) => {
    // If clicking the same step, toggle back to main flow
    if (activeCanceledStepId === stepId) {
      setActiveCanceledStepId(null);
    } else {
      // Switch to this step's canceled flow
      setActiveCanceledStepId(stepId);
    }
  };

  const stepHasCanceledFlow = (stepId: string): boolean => {
    return comboSteps.some((s) => s.parentCanceledStepId === stepId);
  };

  // Drag and Drop handlers
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    stepId: string,
  ) => {
    setDraggedStepId(stepId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", stepId);
    
    // Find the step container to apply opacity
    const target = e.currentTarget;
    const stepContainer = target.closest('[data-step-container]') as HTMLElement;
    if (stepContainer) {
      stepContainer.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Find the step container to restore opacity
    const target = e.currentTarget;
    const stepContainer = target.closest('[data-step-container]') as HTMLElement;
    if (stepContainer) {
      stepContainer.style.opacity = "1";
    }
    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    stepId: string,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedStepId && draggedStepId !== stepId) {
      setDragOverStepId(stepId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStepId(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStepId: string,
  ) => {
    e.preventDefault();
    setDragOverStepId(null);

    if (!draggedStepId || draggedStepId === targetStepId) {
      return;
    }

    // Find the dragged and target steps
    const draggedStep = comboSteps.find((s) => s.id === draggedStepId);
    const targetStep = comboSteps.find((s) => s.id === targetStepId);

    if (!draggedStep || !targetStep) {
      return;
    }

    // Only allow reordering within the same flow (both main or both canceled)
    const draggedIsMainFlow = !draggedStep.parentCanceledStepId;
    const targetIsMainFlow = !targetStep.parentCanceledStepId;

    if (draggedIsMainFlow !== targetIsMainFlow) {
      // Don't allow moving between main flow and canceled flow
      return;
    }

    // If in canceled flow, ensure they have the same parent
    if (
      !draggedIsMainFlow &&
      draggedStep.parentCanceledStepId !== targetStep.parentCanceledStepId
    ) {
      return;
    }

    // Swap the two steps within the same flow
    const parentId = draggedStep.parentCanceledStepId || null;
    const updatedSteps = swapSteps(
      comboSteps,
      draggedStepId,
      targetStepId,
      parentId,
    );

    setComboSteps(updatedSteps);
  };

  // Get sorted steps for display
  const visibleSteps = getVisibleSteps();

  return (
    <div className="space-y-4">
      {visibleSteps.length === 0 ? (
        <button
          onClick={addStep}
          className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-500/50 rounded-lg hover:border-blue-400 hover:bg-blue-500/10 transition-colors group"
        >
          <Plus className="w-8 h-8 text-blue-400 group-hover:text-blue-300 mb-2" />
          <span className="text-sm text-blue-400 group-hover:text-blue-300">
            {activeCanceledStepId
              ? "Add First Canceled Step"
              : "Add First Step"}
          </span>
        </button>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {visibleSteps.map((step) => {
              const isMainFlowStep = !step.parentCanceledStepId;
              const isReadOnly = !!(activeCanceledStepId && isMainFlowStep);

              const isDragging = draggedStepId === step.id;
              const isDragOver = dragOverStepId === step.id;

              return (
                <div
                  key={step.id}
                  data-step-container
                  onDragOver={(e) => handleDragOver(e, step.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, step.id)}
                  className={`relative bg-slate-800/50 border-2 rounded-lg p-8 pb-12 transition-all ${
                    isReadOnly
                      ? "border-slate-600/40 opacity-70"
                      : "border-blue-500/40"
                  } ${isDragging ? "opacity-50 scale-95" : ""} ${
                    isDragOver
                      ? "border-yellow-400 scale-105 shadow-lg shadow-yellow-400/20"
                      : ""
                  }`}
                >
                  {/* Drag Handle - Top Center (only in edit mode) */}
                  {!isReadOnly && (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, step.id)}
                      onDragEnd={handleDragEnd}
                      className="absolute top-1 left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing py-1 px-3 rounded hover:bg-slate-700/30 transition-colors"
                      title="Drag to reorder"
                    >
                      <div className="grid grid-cols-3 gap-[3px]">
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Step Number Badge - Top Left */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-block px-2 py-0.5 text-yellow-500 text-xs font-bold rounded-full">
                      #{step.stepOrder + 1}
                    </span>
                  </div>

                  {/* Canceled Flow Button - Bottom Left (for main flow steps) */}
                  {isMainFlowStep &&
                    (stepHasCanceledFlow(step.id) ||
                      activeCanceledStepId === step.id) && (
                      <button
                        onClick={() => toggleCanceledFlow(step.id)}
                        className={`absolute bottom-2 left-2 px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                          activeCanceledStepId === step.id
                            ? "bg-slate-700 text-white hover:bg-slate-600"
                            : "bg-red-600/80 text-white hover:bg-red-600"
                        }`}
                        title={
                          activeCanceledStepId === step.id
                            ? "Return to Main Flow"
                            : "View/Edit Canceled Flow"
                        }
                      >
                        {activeCanceledStepId === step.id
                          ? "← Go Back"
                          : "Negated?"}
                      </button>
                    )}

                  {/* Add Canceled Flow Button - Only show when not in canceled view and step doesn't have canceled flow yet */}
                  {!activeCanceledStepId &&
                    isMainFlowStep &&
                    !stepHasCanceledFlow(step.id) && (
                      <button
                        onClick={() => toggleCanceledFlow(step.id)}
                        className="absolute bottom-2 left-2 px-2 py-1 text-[11px] font-semibold rounded transition-colors bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                        title="Add Canceled Flow"
                      >
                        Canceled?
                      </button>
                    )}

                  {!isReadOnly && (
                    <button
                      onClick={() => removeStep(step.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Vertical Layout: Left Sub Cards + Main Cards + Right Sub Cards */}
                  <div
                    className={`${expandedLeftSteps.has(step.id) || expandedRightSteps.has(step.id) ? "mb-6" : "mb-3"} ${isReadOnly ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex justify-center m-auto items-center gap-3 w-fit">
                      {/* Left Sub Cards with placeholders - All 5 vertical */}
                      {step.mainCards.length > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                            MATERIAL
                          </span>
                          <div className="flex flex-col gap-1 items-center" style={{ minHeight: "232px" }}>
                            {/* First 3 cards - always visible */}
                            {[...Array(3)].map((_, slotIndex) => {
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
                                          src={
                                            card.imageUrlSmall || card.imageUrl
                                          }
                                          alt={card.name}
                                          className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                        />
                                      </CardTooltip>
                                      {card.chainNumber != null && (
                                        <img src={ChainImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                                      )}
                                      {!isReadOnly && (
                                        <div className="absolute bottom-0 left-0 z-[2]">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setChainPickerOpen(chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "leftSub" && chainPickerOpen?.cardIndex === slotIndex ? null : { stepId: step.id, cardType: "leftSub", cardIndex: slotIndex }); }}
                                            className={card.chainNumber != null ? "w-[15px] h-[15px] rounded-full border-2 border-cyan-500 bg-blue-900/90 text-cyan-200 text-[9px] font-bold flex items-center justify-center px-0.5" : "px-0.5 py-0.5 text-[7px] font-bold rounded-tr bg-black/70 text-blue-300 hover:bg-blue-700/80 hover:text-white"}
                                            title="Set chain number"
                                          >
                                            {card.chainNumber != null ? card.chainNumber : "⛓"}
                                          </button>
                                          {chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "leftSub" && chainPickerOpen?.cardIndex === slotIndex && (
                                            <div ref={chainPickerRef} className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2" style={{ minWidth: "130px" }}>
                                              <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                                                <button onClick={() => updateChainNumber(step.id, "leftSub", slotIndex, null)} className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1">✕ Clear</button>
                                                {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                                  <button key={n} onClick={() => updateChainNumber(step.id, "leftSub", slotIndex, n)} className={`text-xs rounded px-1.5 py-1 ${card.chainNumber === n ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>{n}</button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <button
                                        onClick={() =>
                                          removeCard(
                                            step.id,
                                            slotIndex,
                                            "leftSub",
                                          )
                                        }
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                        title="Remove card"
                                      >
                                        <X className="w-2 h-2 text-white" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        setAnchorElement(e.currentTarget);
                                        setSelectingCards({
                                          stepId: step.id,
                                          type: "leftSub",
                                        });
                                      }}
                                      className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                      title="Add card"
                                    >
                                      <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Extra 2 cards - only when expanded (slots 3 and 4) */}
                            {expandedLeftSteps.has(step.id) &&
                              [3, 4].map((slotIndex) => {
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
                                            src={
                                              card.imageUrlSmall || card.imageUrl
                                            }
                                            alt={card.name}
                                            className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                          />
                                        </CardTooltip>
                                        {card.chainNumber != null && (
                                          <img src={ChainImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                                        )}
                                        {!isReadOnly && (
                                          <div className="absolute bottom-0 left-0 z-[2]">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setChainPickerOpen(chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "leftSub" && chainPickerOpen?.cardIndex === slotIndex ? null : { stepId: step.id, cardType: "leftSub", cardIndex: slotIndex }); }}
                                              className={card.chainNumber != null ? "w-[24px] h-[24.5px] rounded-full border-2 border-cyan-500 bg-blue-900/90 text-cyan-200 text-[7px] font-bold flex items-center justify-center px-0.5" : "px-0.5 py-0.5 text-[7px] font-bold rounded-tr bg-black/70 text-blue-300 hover:bg-blue-700/80 hover:text-white"}
                                              title="Set chain number"
                                            >
                                              {card.chainNumber != null ? card.chainNumber : "⛓"}
                                            </button>
                                            {chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "leftSub" && chainPickerOpen?.cardIndex === slotIndex && (
                                              <div ref={chainPickerRef} className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2" style={{ minWidth: "130px" }}>
                                                <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                                                  <button onClick={() => updateChainNumber(step.id, "leftSub", slotIndex, null)} className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1">✕ Clear</button>
                                                  {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                                    <button key={n} onClick={() => updateChainNumber(step.id, "leftSub", slotIndex, n)} className={`text-xs rounded px-1.5 py-1 ${card.chainNumber === n ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>{n}</button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        <button
                                          onClick={() =>
                                            removeCard(
                                              step.id,
                                              slotIndex,
                                              "leftSub",
                                            )
                                          }
                                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                          title="Remove card"
                                        >
                                          <X className="w-2 h-2 text-white" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          setAnchorElement(e.currentTarget);
                                          setSelectingCards({
                                            stepId: step.id,
                                            type: "leftSub",
                                          });
                                        }}
                                        className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                        title="Add card"
                                      >
                                        <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Show All button - always visible, positioned after last visible placeholder */}
                            <div className="h-6 flex items-center">
                              <button
                                onClick={() => {
                                  const newSet = new Set(expandedLeftSteps);
                                  if (newSet.has(step.id)) {
                                    newSet.delete(step.id);
                                  } else {
                                    newSet.add(step.id);
                                  }
                                  setExpandedLeftSteps(newSet);
                                }}
                                className="text-[10px] text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full"
                              >
                                {expandedLeftSteps.has(step.id)
                                  ? "Less"
                                  : "Show All"}
                              </button>
                            </div>
                          </div>
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
                            {/* Chain overlay */}
                            {card.chainNumber != null && (
                              <img
                                src={ChainImg}
                                alt=""
                                className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]"
                              />
                            )}
                            {/* Chain label / number badge */}
                            {!isReadOnly && (
                              <div className="absolute bottom-0 left-0 z-[2]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChainPickerOpen(
                                      chainPickerOpen?.stepId === step.id &&
                                      chainPickerOpen?.cardType === "main" &&
                                      chainPickerOpen?.cardIndex === cardIndex
                                        ? null
                                        : { stepId: step.id, cardType: "main", cardIndex },
                                    );
                                  }}
                                  className={card.chainNumber != null ? "w-[24px] h-[24.5px] pb-0.5 rounded-full border-2 border-cyan-500 bg-blue-900/90 text-cyan-200 text-[19px] font-bold flex items-center justify-center px-0.5" : "px-1 py-0.5 text-[11px] font-bold bg-black/70 text-blue-400 hover:text-blue-300"}
                                  title="Set chain number"
                                >
                                  {card.chainNumber != null ? card.chainNumber : "chain?"}
                                </button>
                                {/* Chain picker popup */}
                                {chainPickerOpen?.stepId === step.id &&
                                  chainPickerOpen?.cardType === "main" &&
                                  chainPickerOpen?.cardIndex === cardIndex && (
                                    <div
                                      ref={chainPickerRef}
                                      className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2"
                                      style={{ minWidth: "130px" }}
                                    >
                                      <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                                        <button
                                          onClick={() => updateChainNumber(step.id, "main", cardIndex, null)}
                                          className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1"
                                        >
                                          ✕ Clear
                                        </button>
                                        {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                          <button
                                            key={n}
                                            onClick={() => updateChainNumber(step.id, "main", cardIndex, n)}
                                            className={`text-xs rounded px-1.5 py-1 ${
                                              card.chainNumber === n
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-300 hover:bg-slate-700"
                                            }`}
                                          >
                                            {n}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
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
                            onClick={(e) => {
                              setAnchorElement(e.currentTarget);
                              setSelectingCards({
                                stepId: step.id,
                                type: "main",
                              });
                            }}
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

                      {/* Right Sub Cards with placeholders - All 5 vertical */}
                      {step.mainCards.length > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                            EFFECT
                          </span>
                          <div className="flex flex-col gap-1 items-center" style={{ minHeight: "232px" }}>
                            {/* First 3 cards - always visible */}
                            {[...Array(3)].map((_, slotIndex) => {
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
                                          src={
                                            card.imageUrlSmall || card.imageUrl
                                          }
                                          alt={card.name}
                                          className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                        />
                                      </CardTooltip>
                                      {card.chainNumber != null && (
                                        <img src={ChainImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                                      )}
                                      {!isReadOnly && (
                                        <div className="absolute bottom-0 left-0 z-[2]">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setChainPickerOpen(chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "sub" && chainPickerOpen?.cardIndex === slotIndex ? null : { stepId: step.id, cardType: "sub", cardIndex: slotIndex }); }}
                                            className={card.chainNumber != null ? "w-[15px] h-[15px] rounded-full border-2 border-cyan-500 bg-blue-900/90 text-cyan-200 text-[9px] font-bold flex items-center justify-center px-0.5" : "rounded-full border border-blue-400 bg-black/70 text-blue-300 text-[8px] w-4 h-3.5 hover:bg-blue-700/80 hover:text-white"}
                                            title="Set chain number"
                                          >
                                            {card.chainNumber != null ? card.chainNumber : "⛓"}
                                          </button>
                                          {chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "sub" && chainPickerOpen?.cardIndex === slotIndex && (
                                            <div ref={chainPickerRef} className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2" style={{ minWidth: "130px" }}>
                                              <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                                                <button onClick={() => updateChainNumber(step.id, "sub", slotIndex, null)} className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1">✕ Clear</button>
                                                {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                                  <button key={n} onClick={() => updateChainNumber(step.id, "sub", slotIndex, n)} className={`text-xs rounded px-1.5 py-1 ${card.chainNumber === n ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>{n}</button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
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
                                      onClick={(e) => {
                                        setAnchorElement(e.currentTarget);
                                        setSelectingCards({
                                          stepId: step.id,
                                          type: "sub",
                                        });
                                      }}
                                      className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                      title="Add card"
                                    >
                                      <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Extra 2 cards - only when expanded (slots 3 and 4) */}
                            {expandedRightSteps.has(step.id) &&
                              [3, 4].map((slotIndex) => {
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
                                            src={
                                              card.imageUrlSmall || card.imageUrl
                                            }
                                            alt={card.name}
                                            className="w-10 h-14 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
                                          />
                                        </CardTooltip>
                                        {card.chainNumber != null && (
                                          <img src={ChainImg} alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]" />
                                        )}
                                        {!isReadOnly && (
                                          <div className="absolute bottom-0 left-0 z-[2]">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setChainPickerOpen(chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "sub" && chainPickerOpen?.cardIndex === slotIndex ? null : { stepId: step.id, cardType: "sub", cardIndex: slotIndex }); }}
                                              className={card.chainNumber != null ? "w-[14] h-[14.5px] rounded-full border-2 border-blue-400 bg-blue-900/90 text-cyan-200 text-[9px] font-bold flex items-center justify-center px-0.5" : "px-0.5 py-0.5 text-[7px] font-bold rounded-tr bg-black/70 text-blue-300 hover:bg-blue-700/80 hover:text-white"}
                                              title="Set chain number"
                                            >
                                              {card.chainNumber != null ? card.chainNumber : "⛓"}
                                            </button>
                                            {chainPickerOpen?.stepId === step.id && chainPickerOpen?.cardType === "sub" && chainPickerOpen?.cardIndex === slotIndex && (
                                              <div ref={chainPickerRef} className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-blue-500/50 rounded shadow-xl z-50 p-2" style={{ minWidth: "130px" }}>
                                                <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                                                  <button onClick={() => updateChainNumber(step.id, "sub", slotIndex, null)} className="col-span-5 text-xs text-red-400 hover:bg-slate-700 rounded px-1.5 py-1">✕ Clear</button>
                                                  {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                                    <button key={n} onClick={() => updateChainNumber(step.id, "sub", slotIndex, n)} className={`text-xs rounded px-1.5 py-1 ${card.chainNumber === n ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>{n}</button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
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
                                        onClick={(e) => {
                                          setAnchorElement(e.currentTarget);
                                          setSelectingCards({
                                            stepId: step.id,
                                            type: "sub",
                                          });
                                        }}
                                        className="w-10 h-14 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
                                        title="Add card"
                                      >
                                        <Plus className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Show All button - always visible, positioned after last visible placeholder */}
                            <div className="h-6 flex items-center">
                              <button
                                onClick={() => {
                                  const newSet = new Set(expandedRightSteps);
                                  if (newSet.has(step.id)) {
                                    newSet.delete(step.id);
                                  } else {
                                    newSet.add(step.id);
                                  }
                                  setExpandedRightSteps(newSet);
                                }}
                                className="text-[10px] text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full"
                              >
                                {expandedRightSteps.has(step.id)
                                  ? "Less"
                                  : "Show All"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Remove add main card button - only 1 main card allowed */}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col items-center">
                    <label className="text-blue-400 font-semibold text-xs mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={step.description || ""}
                      onChange={(e) =>
                        handleDescriptionChange(step.id, e.target.value)
                      }
                      maxLength={500}
                      disabled={isReadOnly}
                      placeholder="Describe this step (Max. 500 characters)..."
                      className={`w-full max-w-[280px] px-2 py-1.5 text-white text-xs rounded 
                               border focus:outline-none resize-y min-h-[60px] scrollbar-homeAllPages mx-auto ${
                                 isReadOnly
                                   ? "bg-slate-800/50 border-slate-700 cursor-not-allowed"
                                   : "bg-slate-700/50 border-slate-600 focus:border-blue-500"
                               }`}
                      rows={3}
                    />
                    <div className="text-xs text-slate-400 mt-0.5 text-right w-full max-w-[280px]">
                      {(step.description || "").length}/500
                    </div>
                  </div>
                </div>
              );
            })}
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

      <FloatingCardSearchModal
        isOpen={!!selectingCards}
        onClose={() => {
          setSelectingCards(null);
          setAnchorElement(null);
        }}
        onSelectCard={handleCardSelected}
        title={
          selectingCards?.type === "main"
            ? "Select Main Card"
            : selectingCards?.type === "leftSub"
              ? "Select Left Sub Card"
              : "Select Right Sub Card"
        }
        anchorElement={anchorElement}
        autoCloseAfterSelect={false}
      />
    </div>
  );
};