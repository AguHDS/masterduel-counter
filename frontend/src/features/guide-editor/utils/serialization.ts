import type { ComboStep } from "@/features/archetypes/types";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";
import type { FinalBoardDTO, ComboStepsDTO } from "../api/guideEditorApi";

/** Returns whether a final board contains no cards, zones, or description */
export const isFinalBoardEmpty = (hand: InitialHand): boolean => {
  const board = hand.finalBoard;
  if (!board) return true;
  return (
    board.fieldSpell === null &&
    board.extraMonsters.every((card) => card === null) &&
    board.monsters.every((card) => card === null) &&
    board.spellTraps.every((card) => card === null) &&
    board.hand.every((card) => card === null) &&
    board.graveyard.length === 0 &&
    board.banished.length === 0 &&
    !board.description
  );
};

/** Serializes a non-empty final board into the API DTO format */
export const serializeFinalBoard = (
  hand: InitialHand,
): FinalBoardDTO | undefined => {
  if (!hand.finalBoard || isFinalBoardEmpty(hand)) return undefined;
  return {
    fieldSpellCardId: hand.finalBoard.fieldSpell?.id || null,
    extraMonsterCardIds: hand.finalBoard.extraMonsters.map(
      (c) => c?.id || null,
    ),
    monsterCardIds: hand.finalBoard.monsters.map((c) => c?.id || null),
    spellTrapCardIds: hand.finalBoard.spellTraps.map((c) => c?.id || null),
    handCardIds: hand.finalBoard.hand.map((c) => c?.id || null),
    graveyardCardIds: hand.finalBoard.graveyard.map((c) => c.id),
    banishedCardIds: hand.finalBoard.banished.map((c) => c.id),
    description: hand.finalBoard.description || undefined,
    monsterPositions: hand.finalBoard.monsterPositions?.some(
      (p) => p === "def",
    )
      ? hand.finalBoard.monsterPositions
      : undefined,
    extraMonsterPositions: hand.finalBoard.extraMonsterPositions?.some(
      (p) => p === "def",
    )
      ? hand.finalBoard.extraMonsterPositions
      : undefined,
  };
};

/** Transforms combo step editor state into the ordered API payload structure */
export const transformComboStepsForApi = (
  initialHands: InitialHand[],
  comboSteps: Map<string, ComboStep[]>,
): ComboStepsDTO[] => {
  return initialHands
    .filter((hand) => hand.cards.length > 0)
    .map((hand, index) => {
      const steps = comboSteps.get(hand.id) || [];
      if (steps.length === 0) return null;

      const validSteps = steps.filter((s) => s.mainCards.length > 0);
      if (validSteps.length === 0) return null;

      const mainFlowSteps = validSteps
        .filter((s) => !s.parentCanceledStepId)
        .sort((a, b) => a.stepOrder - b.stepOrder);
      const canceledFlowSteps = validSteps
        .filter((s) => s.parentCanceledStepId)
        .sort((a, b) => {
          const parentComparison = (
            a.parentCanceledStepId || ""
          ).localeCompare(b.parentCanceledStepId || "");
          if (parentComparison !== 0) return parentComparison;
          return a.stepOrder - b.stepOrder;
        });

      const orderedSteps = [...mainFlowSteps, ...canceledFlowSteps];

      const stepIdToIndex = new Map<string, number>();
      orderedSteps.forEach((step, idx) => stepIdToIndex.set(step.id, idx));

      return {
        initialHandId: index,
        steps: orderedSteps.map((step, stepIndex) => ({
          mainCardIds: step.mainCards.map((c) => c.id),
          mainCardChains: step.mainCards.map(
            (c) => c.chainNumber ?? null,
          ),
          subCardIds: step.subCards.map((c) => c.id),
          subCardChains: step.subCards.map(
            (c) => c.chainNumber ?? null,
          ),
          leftSubCardIds: step.leftSubCards.map((c) => c.id),
          leftSubCardChains: step.leftSubCards.map(
            (c) => c.chainNumber ?? null,
          ),
          description: step.description || undefined,
          parentCanceledStepIndex: step.parentCanceledStepId
            ? stepIdToIndex.get(step.parentCanceledStepId)
            : undefined,
          stepOrder: stepIndex,
          stepType: step.stepType || undefined,
          leftScaleValue: step.leftScaleValue ?? undefined,
          rightScaleValue: step.rightScaleValue ?? undefined,
        })),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/** Collects and deduplicates all card IDs referenced throughout a guide */
export const collectGuideCardIds = (params: {
  headerCardId?: number | null;
  cardPairIds?: number[][];
  initialHandCardIds?: number[][];
  comboStepCardIds?: number[][];
  deckCardIds?: number[];
}): number[] => {
  const allIds: number[] = [];

  if (params.headerCardId) allIds.push(params.headerCardId);

  if (params.cardPairIds) {
    for (const pair of params.cardPairIds) {
      allIds.push(...pair);
    }
  }

  if (params.initialHandCardIds) {
    for (const hand of params.initialHandCardIds) {
      allIds.push(...hand);
    }
  }

  if (params.comboStepCardIds) {
    for (const combo of params.comboStepCardIds) {
      allIds.push(...combo);
    }
  }

  if (params.deckCardIds) {
    allIds.push(...params.deckCardIds);
  }

  return [...new Set(allIds)];
};
