import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { Card, ComboStep } from "@/features/archetypes/types";
import { FloatingCardSearchModal } from "../../../../archetypes/components/FloatingCardSearchModal";
import { ComboStepItemEditor } from "./ComboStepItemEditor";
import { PendulumStepEditor } from "./PendulumStepEditor";
import { useComboStepDragDrop } from "../../../hooks/deck-guides/useComboStepDragDrop";
import {
  createComboStep,
  getVisibleSteps,
  hasCanceledFlow,
  removeStepAndReorder,
  type CardSelectionMode,
  type ChainPickerState,
  type ComboCardType,
} from "../../../utils/comboStepEditorUtils";

interface ComboStepEditorProps {
  comboSteps: ComboStep[];
  setComboSteps: React.Dispatch<React.SetStateAction<ComboStep[]>>;
  initialHandId: string;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
}

/**
 * Editor for creating and managing combo steps for a Deck guide initial hand
 * Supports drag-and-drop reordering, canceled flow branches, main/sub/left-sub cards, chain numbers
 * Steps connect sequentially with optional branching for alternate paths when combos are interrupted
 */
export const ComboStepEditor = ({
  comboSteps,
  setComboSteps,
  initialHandId: _initialHandId,
  onModalStateChange,
  forceCloseModal = false,
}: ComboStepEditorProps) => {
  const [selectingCards, setSelectingCards] = useState<CardSelectionMode | null>(null);
  const [activeCanceledStepId, setActiveCanceledStepId] = useState<string | null>(null);
  const [expandedLeftSteps, setExpandedLeftSteps] = useState<Set<string>>(new Set());
  const [expandedRightSteps, setExpandedRightSteps] = useState<Set<string>>(new Set());
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [chainPickerOpen, setChainPickerOpen] = useState<ChainPickerState | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // For responsive design
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const forcedColumns =
    viewportWidth <= 450
      ? 2
      : viewportWidth <= 860
        ? 2
        : viewportWidth >= 1024 && viewportWidth <= 1187
          ? 3
          : viewportWidth >= 1396 && viewportWidth <= 1548
            ? 4
            : null;

  const {
    draggedStepId,
    dragOverStepId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useComboStepDragDrop({ comboSteps, setComboSteps });

  const updateCardsForStep = (
    stepId: string,
    updater: (step: ComboStep) => ComboStep,
  ) => {
    setComboSteps((previousSteps) => previousSteps.map((step) => (step.id === stepId ? updater(step) : step)));
  };

  useEffect(() => {
    if (forceCloseModal && selectingCards) {
      setSelectingCards(null);
      setAnchorElement(null);
    }
  }, [forceCloseModal, selectingCards]);

  useEffect(() => {
    onModalStateChange?.(!!selectingCards);
  }, [selectingCards, onModalStateChange]);

  const visibleSteps = useMemo(
    () => getVisibleSteps(comboSteps, activeCanceledStepId),
    [comboSteps, activeCanceledStepId],
  );

  const toggleExpandedSteps = (cardType: Extract<ComboCardType, "sub" | "leftSub">, stepId: string) => {
    const setExpandedSteps = cardType === "leftSub" ? setExpandedLeftSteps : setExpandedRightSteps;

    setExpandedSteps((previousSteps) => {
      const nextSteps = new Set(previousSteps);

      if (nextSteps.has(stepId)) {
        nextSteps.delete(stepId);
      } else {
        nextSteps.add(stepId);
      }

      return nextSteps;
    });
  };

  const updateChainNumber = (
    stepId: string,
    cardType: ComboCardType,
    cardIndex: number,
    chainNumber: number | null,
  ) => {
    updateCardsForStep(stepId, (step) => {
      const updateCards = (cards: Card[]) => {
        const nextCards = [...cards];

        if (nextCards[cardIndex]) {
          nextCards[cardIndex] = { ...nextCards[cardIndex], chainNumber };
        }

        return nextCards;
      };

      if (cardType === "main") {
        return { ...step, mainCards: updateCards(step.mainCards) };
      }

      if (cardType === "leftSub") {
        return { ...step, leftSubCards: updateCards(step.leftSubCards) };
      }

      return { ...step, subCards: updateCards(step.subCards) };
    });

    setChainPickerOpen(null);
  };

  const handleAddStep = () => {
    setComboSteps((previousSteps) => [
      ...previousSteps,
      createComboStep(previousSteps, activeCanceledStepId),
    ]);
  };

  const handleRemoveStep = (stepId: string) => {
    setComboSteps((previousSteps) => removeStepAndReorder(previousSteps, stepId));

    if (activeCanceledStepId === stepId) {
      setActiveCanceledStepId(null);
    }
  };

  const handleCardSelected = (card: Card) => {
    if (!selectingCards) return;

    let shouldClose = false;

    updateCardsForStep(selectingCards.stepId, (step) => {
      const isPendulum = step.stepType === "PENDULUM";
      const mainMax = isPendulum ? 6 : 1;
      const sideMax = isPendulum ? 1 : 5;

      if (selectingCards.type === "main") {
        if (step.mainCards.length >= mainMax) {
          alert(`Maximum ${mainMax} main card${mainMax > 1 ? "s" : ""} per step`);
          return step;
        }
        if (!isPendulum) shouldClose = true;
        return { ...step, mainCards: [...step.mainCards, card] };
      }

      if (selectingCards.type === "leftSub") {
        if (step.leftSubCards.length >= sideMax) {
          alert(`Maximum ${sideMax} card${sideMax > 1 ? "s" : ""} per side`);
          return step;
        }
        if (isPendulum) shouldClose = true;
        return { ...step, leftSubCards: [...step.leftSubCards, card] };
      }

      if (step.subCards.length >= sideMax) {
        alert(`Maximum ${sideMax} card${sideMax > 1 ? "s" : ""} per side`);
        return step;
      }
      if (isPendulum) shouldClose = true;
      return { ...step, subCards: [...step.subCards, card] };
    });

    if (shouldClose) {
      closeCardSearch();
    }
  };

  const handleRemoveCard = (stepId: string, cardIndex: number, cardType: ComboCardType) => {
    updateCardsForStep(stepId, (step) => {
      const isPendulum = step.stepType === "PENDULUM";

      if (cardType === "main") {
        if (isPendulum) {
          const newMain = [...step.mainCards];
          newMain.splice(cardIndex, 1);
          return { ...step, mainCards: newMain };
        }
        return { ...step, mainCards: [], subCards: [], leftSubCards: [] };
      }

      if (cardType === "leftSub") {
        return {
          ...step,
          leftSubCards: step.leftSubCards.filter((_, currentIndex) => currentIndex !== cardIndex),
        };
      }

      return {
        ...step,
        subCards: step.subCards.filter((_, currentIndex) => currentIndex !== cardIndex),
      };
    });

    setChainPickerOpen((currentPicker) => {
      if (
        currentPicker?.stepId === stepId &&
        currentPicker.cardType === cardType &&
        currentPicker.cardIndex === cardIndex
      ) {
        return null;
      }

      return currentPicker;
    });
  };

  const handleDescriptionChange = (stepId: string, description: string) => {
    updateCardsForStep(stepId, (step) => ({ ...step, description }));
  };

  const toggleCanceledFlow = (stepId: string) => {
    if (activeCanceledStepId === stepId) {
      setActiveCanceledStepId(null);
    } else {
      setActiveCanceledStepId(stepId);
    }
  };

  const handleToggleStepType = (stepId: string) => {
    updateCardsForStep(stepId, (step) => ({
      ...step,
      stepType: step.stepType === "PENDULUM" ? "NORMAL" : "PENDULUM",
      mainCards: [],
      subCards: [],
      leftSubCards: [],
      leftScaleValue: null,
      rightScaleValue: null,
    }));
  };

  const handleUpdateScaleValue = (stepId: string, side: "left" | "right", value: number | null) => {
    updateCardsForStep(stepId, (step) => ({
      ...step,
      [side === "left" ? "leftScaleValue" : "rightScaleValue"]: value,
    }));
  };

  const handleOpenSearch = (stepId: string, cardType: ComboCardType, nextAnchorElement: HTMLElement) => {
    setAnchorElement(nextAnchorElement);
    setSelectingCards({ stepId, type: cardType });
  };

  const toggleChainPicker = (stepId: string, cardType: ComboCardType, cardIndex: number) => {
    setChainPickerOpen((currentPicker) => {
      if (
        currentPicker?.stepId === stepId &&
        currentPicker.cardType === cardType &&
        currentPicker.cardIndex === cardIndex
      ) {
        return null;
      }

      return { stepId, cardType, cardIndex };
    });
  };

  const closeCardSearch = () => {
    setSelectingCards(null);
    setAnchorElement(null);
  };

  return (
    <div className="space-y-4">
      {visibleSteps.length === 0 ? (
        <button
          onClick={handleAddStep}
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
          <div
            className={`grid gap-3 max-w-7xl mx-auto ${forcedColumns ? "" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}
            style={{
              gridTemplateColumns: forcedColumns
                ? `repeat(${forcedColumns}, minmax(0, 1fr))`
                : undefined,
            }}
          >
            {visibleSteps.map((step) => {
              const isMainFlowStep = !step.parentCanceledStepId;
              const isReadOnly = !!(activeCanceledStepId && isMainFlowStep);

              const isPendulum = step.stepType === "PENDULUM";

              const commonProps = {
                step,
                isReadOnly,
                isDragging: draggedStepId === step.id,
                isDragOver: dragOverStepId === step.id,
                isMainFlowStep,
                isViewingCanceledFlow: activeCanceledStepId === step.id,
                hasCanceledFlow: hasCanceledFlow(comboSteps, step.id),
                chainPickerOpen,
                onToggleCanceledFlow: () => toggleCanceledFlow(step.id),
                onRemoveStep: () => handleRemoveStep(step.id),
                onToggleStepType: () => handleToggleStepType(step.id),
                onDescriptionChange: (description: string) => handleDescriptionChange(step.id, description),
                onOpenSearch: (nextAnchorElement: HTMLElement, cardType: ComboCardType) =>
                  handleOpenSearch(step.id, cardType, nextAnchorElement),
                onRemoveCard: (cardIndex: number, cardType: ComboCardType) => handleRemoveCard(step.id, cardIndex, cardType),
                onToggleChainPicker: (cardType: ComboCardType, cardIndex: number) =>
                  toggleChainPicker(step.id, cardType, cardIndex),
                onUpdateChainNumber: (cardType: ComboCardType, cardIndex: number, chainNumber: number | null) =>
                  updateChainNumber(step.id, cardType, cardIndex, chainNumber),
                onCloseChainPicker: () => setChainPickerOpen(null),
                onDragStart: (event: React.DragEvent<HTMLDivElement>) => handleDragStart(event, step.id),
                onDragEnd: handleDragEnd,
                onDragOver: (event: React.DragEvent<HTMLDivElement>) => handleDragOver(event, step.id),
                onDragLeave: handleDragLeave,
                onDrop: (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, step.id),
              };

              if (isPendulum) {
                return (
                  <PendulumStepEditor
                    key={step.id}
                    {...commonProps}
                    onUpdateScaleValue={(side, value) => handleUpdateScaleValue(step.id, side, value)}
                  />
                );
              }

              return (
                <ComboStepItemEditor
                  key={step.id}
                  {...commonProps}
                  isLeftExpanded={expandedLeftSteps.has(step.id)}
                  isRightExpanded={expandedRightSteps.has(step.id)}
                  onToggleExpanded={(cardType) => toggleExpandedSteps(cardType, step.id)}
                />
              );
            })}
            {/* Placeholder */}
            <button
              onClick={handleAddStep}
              className="relative bg-slate-800/30 border-2 border-dashed border-blue-500/50 w-full rounded-lg p-4 pt-8 hover:border-blue-400 hover:bg-blue-500/10 transition-colors group flex items-center justify-center"
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
        onClose={closeCardSearch}
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