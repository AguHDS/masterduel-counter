import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import type { InitialHand } from "../../components/deck-guides/InitialHandsEditor";

interface UseDeckGuideHandlersParams {
  initialHands: InitialHand[];
  setInitialHands: Dispatch<SetStateAction<InitialHand[]>>;
  comboSteps: Map<string, ComboStep[]>;
  setComboSteps: Dispatch<SetStateAction<Map<string, ComboStep[]>>>;
  selectedHandId: string | null;
  setSelectedHandId: Dispatch<SetStateAction<string | null>>;
  setShowComboFlow: Dispatch<SetStateAction<boolean>>;
}

/**
 * Provides handler functions for Deck guide initial hands and combo flow management
 * 
 * Deck guides have:
 * - Initial hands: Starting hand scenarios (up to 5 cards each)
 * - Combo steps: Step-by-step combo sequences for each initial hand
 * - Final board preview: Visual representation of the end result
 */
export const useDeckGuideHandlers = ({
  initialHands,
  setInitialHands,
  comboSteps,
  setComboSteps,
  selectedHandId,
  setSelectedHandId,
  setShowComboFlow,
}: UseDeckGuideHandlersParams) => {
  const addInitialHand = () => {
    const newHand: InitialHand = {
      id: `hand-${Date.now()}`,
      cards: [],
    };
    setInitialHands([...initialHands, newHand]);
  };

  /**
   * Selects a hand and shows the combo flow editor, then scrolls to it
   */
  const handleAddCombo = (handId: string) => {
    setSelectedHandId(handId);
    setShowComboFlow(true);

    setTimeout(() => {
      const comboSection = document.querySelector("[data-combo-flow-section]");
      if (comboSection) {
        comboSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  /**
   * Selects a hand and shows the combo flow section
   */
  const handleShowCombo = (handId: string) => {
    setSelectedHandId(handId);
    setShowComboFlow(true);
  };

  /**
   * Updates the currently selected initial hand
   */
  const handleSelectHand = (handId: string) => {
    setSelectedHandId(handId);
  };

  /**
   * Gets the combo steps for the currently selected hand
   */
  const getComboStepsForSelectedHand = (): ComboStep[] => {
    if (!selectedHandId) return [];
    return comboSteps.get(selectedHandId) || [];
  };

  /**
   * Updates the combo steps for the currently selected hand
   * Removes the hand from the map if the new steps array is empty
   */
  const setComboStepsForSelectedHand = (
    value: React.SetStateAction<ComboStep[]>,
  ) => {
    if (!selectedHandId) return;

    const currentSteps = comboSteps.get(selectedHandId) || [];
    const newSteps = typeof value === "function" ? value(currentSteps) : value;

    const newMap = new Map(comboSteps);
    if (newSteps.length === 0) {
      newMap.delete(selectedHandId);
    } else {
      newMap.set(selectedHandId, newSteps);
    }
    setComboSteps(newMap);
  };

  /**
   * Duplicates an initial hand along with its combo steps
   * 
   * 1. Copies all combo steps from the original hand
   * 2. Generates new unique IDs for each duplicated step
   * 3. Preserves parent-child relationships (parentCanceledStepId) by remapping old IDs to new IDs
   * 
   * This ensures that canceled step flows are maintained in the duplicate
   */
  const handleDuplicateInitialHand = useCallback(
    (originalHandId: string, newHandId: string) => {
      const originalSteps = comboSteps.get(originalHandId);
      if (!originalSteps || originalSteps.length === 0) return;

      // Map old step ID -> new step ID to preserve parentCanceledStepId references
      const idMap = new Map<string, string>();
      originalSteps.forEach((step) => {
        idMap.set(
          step.id,
          `step-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
        );
      });

      const duplicatedSteps = originalSteps.map((step) => ({
        ...step,
        id: idMap.get(step.id)!,
        parentCanceledStepId: step.parentCanceledStepId
          ? (idMap.get(step.parentCanceledStepId) ?? step.parentCanceledStepId)
          : null,
      }));

      setComboSteps((prev) => {
        const next = new Map(prev);
        next.set(newHandId, duplicatedSteps);
        return next;
      });
    },
    [comboSteps, setComboSteps],
  );

  return {
    addInitialHand,
    handleAddCombo,
    handleShowCombo,
    handleSelectHand,
    getComboStepsForSelectedHand,
    setComboStepsForSelectedHand,
    handleDuplicateInitialHand,
  };
};
