import type { ComboStep } from "@/features/archetypes/types";

export type ComboCardType = "main" | "sub" | "leftSub";

export interface CardSelectionMode {
  stepId: string;
  type: ComboCardType;
}

export interface ChainPickerState {
  stepId: string;
  cardType: ComboCardType;
  cardIndex: number;
}

export const CHAIN_NUMBER_OPTIONS = Array.from({ length: 50 }, (_, index) => index + 1);
export const SIDE_CARD_VISIBLE_SLOTS = 3;
export const SIDE_CARD_MAX_SLOTS = 5;

// Returns flow steps sorted by visual sequence for a specific parent branch
export const getStepsInOrder = (
  steps: ComboStep[],
  parentId: string | null,
): ComboStep[] => {
  return steps
    .filter((step) => step.parentCanceledStepId === parentId)
    .sort((firstStep, secondStep) => firstStep.stepOrder - secondStep.stepOrder);
};

export const normalizeStepOrdersByBranch = (steps: ComboStep[]): ComboStep[] => {
  const mainFlowSteps = getStepsInOrder(steps, null).map((step, index) => ({
    ...step,
    stepOrder: index,
  }));

  const parentIds = [...new Set(
    steps
      .map((step) => step.parentCanceledStepId)
      .filter((parentId): parentId is string => parentId !== null),
  )].sort();

  const canceledFlowSteps = parentIds.flatMap((parentId) => {
    return getStepsInOrder(steps, parentId).map((step, index) => ({
      ...step,
      stepOrder: index,
    }));
  });

  return [...mainFlowSteps, ...canceledFlowSteps];
};

// Builds the currently visible step list for main flow or an active canceled branch
export const getVisibleSteps = (
  steps: ComboStep[],
  activeCanceledStepId: string | null,
): ComboStep[] => {
  const mainFlowSteps = getStepsInOrder(steps, null);

  if (!activeCanceledStepId) {
    return mainFlowSteps;
  }

  const canceledStepIndex = mainFlowSteps.findIndex((step) => step.id === activeCanceledStepId);

  if (canceledStepIndex === -1) {
    return mainFlowSteps;
  }

  const stepsBeforeCanceled = mainFlowSteps.slice(0, canceledStepIndex + 1);
  const canceledSteps = getStepsInOrder(steps, activeCanceledStepId);

  return [...stepsBeforeCanceled, ...canceledSteps];
};

// Creates a new empty combo step with the next order index in its branch
export const createComboStep = (
  steps: ComboStep[],
  parentCanceledStepId: string | null,
): ComboStep => {
  const currentFlowSteps = steps.filter(
    (step) => step.parentCanceledStepId === parentCanceledStepId,
  );
  const nextStepOrder = currentFlowSteps.reduce(
    (highestOrder, step) => Math.max(highestOrder, step.stepOrder),
    -1,
  ) + 1;

  return {
    id: `step-${Date.now()}`,
    stepOrder: nextStepOrder,
    description: "",
    parentCanceledStepId,
    mainCards: [],
    subCards: [],
    leftSubCards: [],
  };
};

// Checks whether a main-flow step already has a canceled-flow branch
export const hasCanceledFlow = (steps: ComboStep[], stepId: string): boolean => {
  return steps.some((step) => step.parentCanceledStepId === stepId);
};

// Removes a step (and branch when needed) and compacts stepOrder values
export const removeStepAndReorder = (steps: ComboStep[], stepId: string): ComboStep[] => {
  const stepToRemove = steps.find((step) => step.id === stepId);

  if (!stepToRemove) {
    return steps;
  }

  let updatedSteps = steps.filter((step) => step.id !== stepId);

  if (!stepToRemove.parentCanceledStepId) {
    updatedSteps = updatedSteps.filter((step) => step.parentCanceledStepId !== stepId);
  }

  const mainFlowSteps = updatedSteps
    .filter((step) => !step.parentCanceledStepId)
    .sort((firstStep, secondStep) => firstStep.stepOrder - secondStep.stepOrder)
    .map((step, index) => ({
      ...step,
      stepOrder: index,
    }));

  const canceledSteps = updatedSteps.filter((step) => step.parentCanceledStepId);
  const canceledByParent = new Map<string, ComboStep[]>();

  canceledSteps.forEach((step) => {
    const parentId = step.parentCanceledStepId!;
    const stepsForParent = canceledByParent.get(parentId) ?? [];
    stepsForParent.push(step);
    canceledByParent.set(parentId, stepsForParent);
  });

  const reorderedCanceledSteps = Array.from(canceledByParent.values()).flatMap((stepsForParent) => {
    return stepsForParent
      .sort((firstStep, secondStep) => firstStep.stepOrder - secondStep.stepOrder)
      .map((step, index) => ({
        ...step,
        stepOrder: index,
      }));
  });

  return normalizeStepOrdersByBranch([
    ...mainFlowSteps,
    ...reorderedCanceledSteps,
  ]);
};

// Swaps two steps inside the same branch and reindexes their stepOrder
export const swapStepsWithinFlow = (
  steps: ComboStep[],
  draggedId: string,
  targetId: string,
  parentId: string | null,
): ComboStep[] => {
  const flowSteps = steps.filter((step) => step.parentCanceledStepId === parentId);
  const otherSteps = steps.filter((step) => step.parentCanceledStepId !== parentId);

  const draggedIndex = flowSteps.findIndex((step) => step.id === draggedId);
  const targetIndex = flowSteps.findIndex((step) => step.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return steps;
  }

  const reorderedFlowSteps = [...flowSteps];
  const [draggedItem] = reorderedFlowSteps.splice(draggedIndex, 1);
  const insertAt = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
  reorderedFlowSteps.splice(insertAt, 0, draggedItem);

  const updatedFlowSteps = reorderedFlowSteps.map((step, index) => ({
    ...step,
    stepOrder: index,
  }));

  return [...otherSteps, ...updatedFlowSteps];
};