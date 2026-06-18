import type { CardPair, ComboStep } from "@/features/archetypes/types";
import type { GuideInstanceWithFullDetails } from "@/lib/http/guideInstancesApi";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";
import type { FieldBoard } from "../components/deck-guides/FinalBoardPreview";
import { normalizeStepOrdersByBranch } from "./comboStepEditorUtils";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

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

/** Normalizes API/editor pairs to the format used by the container state */
export const mapGuideCardPairsToEditorPairs = (
  cardPairs: GuidePairLike[],
): CardPair[] => {
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

/** Converts initial hands from the backend and its combo steps to the editor's UI model */
export const mapInitialHandsAndComboStepsFromInstance = (
  apiInitialHands: GuideInstanceWithFullDetails["initialHands"],
): {
  initialHands: InitialHand[];
  comboSteps: Map<string, ComboStep[]>;
} => {
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
      stepType: (step as ComboStep).stepType || null,
      leftScaleValue: (step as ComboStep).leftScaleValue ?? null,
      rightScaleValue: (step as ComboStep).rightScaleValue ?? null,
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

/** Generates a serialized snapshot to detect unsaved changes */
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
        stepType: step.stepType ?? null,
        leftScaleValue: step.leftScaleValue ?? null,
        rightScaleValue: step.rightScaleValue ?? null,
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
