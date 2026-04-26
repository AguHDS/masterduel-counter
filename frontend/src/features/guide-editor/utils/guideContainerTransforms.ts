import type { CardPair, ComboStep } from "@/features/archetypes/types";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";
import type { InitialHand } from "../components/InitialHandsEditor";
import type { FieldBoard } from "../components/FinalBoardPreview";
import type { HeaderCard } from "../hooks/useInstanceGuideEditor";
import { normalizeStepOrdersByBranch } from "./comboStepEditorUtils";

interface BuildGuideEditSnapshotParams {
  title: string;
  generalTip: string;
  headerCard: HeaderCard | null;
  pairs: CardPair[];
  initialHands: InitialHand[];
  comboSteps: Map<string, ComboStep[]>;
  deckTitle: string;
  deckMainCards: InitialHand["cards"];
  deckExtraCards: InitialHand["cards"];
  deckSideCards: InitialHand["cards"];
  showRecommendedDeck: boolean;
}

type GuidePairLike =
  | GuideInstanceWithFullDetails["cardPairs"][number]
  | CardPair;

export const mapGuideCardPairsToEditorPairs = (
  cardPairs: GuidePairLike[],
): CardPair[] => {
  // Normalizes API/editor pairs to the format used by the container state
  return cardPairs.map((pair) => ({
    id: String(pair.id),
    section:
      ("pairSection" in pair ? pair.pairSection : undefined) ??
      ("section" in pair ? pair.section : undefined) ??
      null,
    topCards: pair.topCards,
    bottomCards: pair.bottomCards,
    comment: pair.comment,
  }));
};

export const mapInitialHandsAndComboStepsFromInstance = (
  apiInitialHands: GuideInstanceWithFullDetails["initialHands"],
): {
  initialHands: InitialHand[];
  comboSteps: Map<string, ComboStep[]>;
} => {
  // Converts initial hands from the backend and its combo steps to the editor's UI model
  if (!apiInitialHands || apiInitialHands.length === 0) {
    return {
      initialHands: [],
      comboSteps: new Map(),
    };
  }

  const transformedHands: InitialHand[] = apiInitialHands.map((hand) => ({
    id: hand.id.toString(),
    cards: hand.cards,
    description: hand.description,
    finalBoard: hand.finalBoard
      ? ({ id: `field-${hand.id}`, ...hand.finalBoard } as FieldBoard)
      : undefined,
  }));

  const comboStepsMap = new Map<string, ComboStep[]>();
  apiInitialHands.forEach((hand) => {
    if (!hand.comboSteps || hand.comboSteps.length === 0) {
      return;
    }

    const transformedSteps: ComboStep[] = hand.comboSteps.map((step) => ({
      id: step.id.toString(),
      stepOrder: step.stepOrder,
      description: step.description,
      parentCanceledStepId: step.parentCanceledStepId?.toString() || null,
      mainCards: step.mainCards.map((card) => ({
        ...card,
        chainNumber: card.chain_number,
      })),
      subCards: step.subCards.map((card) => ({
        ...card,
        chainNumber: card.chain_number,
      })),
      leftSubCards: (step.leftSubCards || []).map((card) => ({
        ...card,
        chainNumber: card.chain_number,
      })),
    }));

    comboStepsMap.set(
      hand.id.toString(),
      normalizeStepOrdersByBranch(transformedSteps),
    );
  });

  return {
    initialHands: transformedHands,
    comboSteps: comboStepsMap,
  };
};

export const buildGuideEditSnapshot = ({
  title,
  generalTip,
  headerCard,
  pairs,
  initialHands,
  comboSteps,
  deckTitle,
  deckMainCards,
  deckExtraCards,
  deckSideCards,
  showRecommendedDeck,
}: BuildGuideEditSnapshotParams): string => {
  // Generates a serialized snapshot to detect unsaved changes
  return JSON.stringify({
    title,
    generalTip,
    headerCardId: headerCard?.id ?? null,
    pairs: pairs.map((pair) => ({
      section: pair.section ?? null,
      topCardIds: pair.topCards.map((card) => card.id),
      bottomCardIds: pair.bottomCards.map((card) => card.id),
      comment: pair.comment ?? null,
    })),
    initialHands: initialHands.map((hand) => ({
      id: hand.id,
      cardIds: hand.cards.map((card) => card.id),
      description: hand.description ?? null,
      finalBoard: hand.finalBoard ?? null,
    })),
    comboSteps: [...comboSteps.entries()].map(([handId, steps]) => ({
      handId,
      steps: steps.map((step) => ({
        stepOrder: step.stepOrder,
        description: step.description ?? null,
        parentCanceledStepId: step.parentCanceledStepId ?? null,
        mainCardIds: step.mainCards.map((card) => card.id),
        mainCardChains: step.mainCards.map((card) => card.chainNumber ?? null),
        subCardIds: step.subCards.map((card) => card.id),
        subCardChains: step.subCards.map((card) => card.chainNumber ?? null),
        leftSubCardIds: (step.leftSubCards ?? []).map((card) => card.id),
        leftSubCardChains: (step.leftSubCards ?? []).map(
          (card) => card.chainNumber ?? null,
        ),
      })),
    })),
    deckTitle,
    deckMainCardIds: deckMainCards.map((card) => card.id),
    deckExtraCardIds: deckExtraCards.map((card) => card.id),
    deckSideCardIds: deckSideCards.map((card) => card.id),
    showRecommendedDeck,
  });
};
