import { useState } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import { swapStepsWithinFlow } from "../utils/comboStepEditorUtils";

interface UseComboStepDragDropParams {
  comboSteps: ComboStep[];
  setComboSteps: React.Dispatch<React.SetStateAction<ComboStep[]>>;
}

// Manages drag-and-drop state and constrained reordering for combo steps
export const useComboStepDragDrop = ({
  comboSteps,
  setComboSteps,
}: UseComboStepDragDropParams) => {
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, stepId: string) => {
    setDraggedStepId(stepId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", stepId);

    const stepContainer = event.currentTarget.closest("[data-step-container]") as HTMLElement | null;

    if (stepContainer) {
      stepContainer.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const stepContainer = event.currentTarget.closest("[data-step-container]") as HTMLElement | null;

    if (stepContainer) {
      stepContainer.style.opacity = "1";
    }

    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, stepId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggedStepId && draggedStepId !== stepId) {
      setDragOverStepId(stepId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStepId(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetStepId: string) => {
    event.preventDefault();
    setDragOverStepId(null);

    if (!draggedStepId || draggedStepId === targetStepId) {
      return;
    }

    const draggedStep = comboSteps.find((step) => step.id === draggedStepId);
    const targetStep = comboSteps.find((step) => step.id === targetStepId);

    if (!draggedStep || !targetStep) {
      return;
    }

    const draggedIsMainFlow = !draggedStep.parentCanceledStepId;
    const targetIsMainFlow = !targetStep.parentCanceledStepId;

    if (draggedIsMainFlow !== targetIsMainFlow) {
      return;
    }

    if (
      draggedStep.parentCanceledStepId &&
      draggedStep.parentCanceledStepId !== targetStep.parentCanceledStepId
    ) {
      return;
    }

    setComboSteps(
      swapStepsWithinFlow(
        comboSteps,
        draggedStepId,
        targetStepId,
        draggedStep.parentCanceledStepId ?? null,
      ),
    );
  };

  return {
    draggedStepId,
    dragOverStepId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};