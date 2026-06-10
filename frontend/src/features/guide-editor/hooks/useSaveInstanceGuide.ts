import { useState } from "react";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import { buildGuidePath } from "@/lib/config/urlHelpers";
import { useSaveGuide } from "./useArchetypeQueries";
import {
  saveRecommendedDeck,
  deleteRecommendedDeck,
  type FinalBoardDTO,
} from "../api/guideEditorApi";
import {
  validateInstanceData,
  transformPairsForApi,
} from "../utils/validation";
import type {
  CardPair,
  Card,
  GuideType,
  ComboStep,
} from "@/features/archetypes/types";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";

interface SaveInstanceParams {
  pairs: CardPair[];
  initialHands: InitialHand[];
  guideType: GuideType;
  title: string;
  generalTip: string;
  headerCard: { id: number; name: string; imageUrl: string } | null;
  archetypeId: number;
  archetypeName: string;
  userName?: string;
  instanceId?: number;
  deckTitle: string;
  deckMainCards: Card[];
  deckExtraCards: Card[];
  deckSideCards: Card[];
  hasDeckContent: boolean;
  existingDeck: boolean;
  comboSteps?: Map<string, ComboStep[]>;
  /** If publishing from a draft, pass the draft ID so it gets deleted after publish */
  draftInstanceId?: number;
  /** Optional callback invoked after saving but before redirect. Receives the new instance id */
  onAfterSave?: (instanceId: number) => Promise<void>;
}

/**
 * Orchestrates the complete save process for guide instances
 * Validates data, confirms cards, saves guide and recommended deck
 */
export const useSaveInstanceGuide = () => {
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const saveGuideMutation = useSaveGuide();

  const getFinalBoardCardIds = (hand: InitialHand): number[] => {
    // Include every card referenced by the final board so confirmCards persists them too.
    if (!hand.finalBoard) {
      return [];
    }

    return [
      ...(hand.finalBoard.fieldSpell ? [hand.finalBoard.fieldSpell.id] : []),
      ...hand.finalBoard.extraMonsters
        .filter((card): card is Card => card !== null)
        .map((card) => card.id),
      ...hand.finalBoard.monsters
        .filter((card): card is Card => card !== null)
        .map((card) => card.id),
      ...hand.finalBoard.spellTraps
        .filter((card): card is Card => card !== null)
        .map((card) => card.id),
      ...hand.finalBoard.hand
        .filter((card): card is Card => card !== null)
        .map((card) => card.id),
      ...hand.finalBoard.graveyard.map((card) => card.id),
      ...hand.finalBoard.banished.map((card) => card.id),
    ];
  };

  const isFinalBoardEmpty = (hand: InitialHand): boolean => {
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

  const serializeFinalBoard = (
    hand: InitialHand,
  ): FinalBoardDTO | undefined => {
    // Convert the editor state into the compact DTO expected by the backend.
    if (!hand.finalBoard || isFinalBoardEmpty(hand)) {
      return undefined;
    }

    return {
      fieldSpellCardId: hand.finalBoard.fieldSpell?.id || null,
      extraMonsterCardIds: hand.finalBoard.extraMonsters.map(
        (card) => card?.id || null,
      ),
      monsterCardIds: hand.finalBoard.monsters.map((card) => card?.id || null),
      spellTrapCardIds: hand.finalBoard.spellTraps.map(
        (card) => card?.id || null,
      ),
      handCardIds: hand.finalBoard.hand.map((card) => card?.id || null),
      graveyardCardIds: hand.finalBoard.graveyard.map((card) => card.id),
      banishedCardIds: hand.finalBoard.banished.map((card) => card.id),
      description: hand.finalBoard.description || undefined,
      monsterPositions: hand.finalBoard.monsterPositions?.some((p) => p === 'def')
        ? hand.finalBoard.monsterPositions
        : undefined,
      extraMonsterPositions: hand.finalBoard.extraMonsterPositions?.some((p) => p === 'def')
        ? hand.finalBoard.extraMonsterPositions
        : undefined,
    };
  };

  const validatePairs = (pairs: CardPair[], guideType: GuideType): boolean => {
    // COUNTER guides require at least one card pair
    if (guideType === "COUNTER") {
      const validPairs = pairs.filter(
        (p) => p.topCards.length > 0 || p.bottomCards.length > 0,
      );

      if (validPairs.length === 0) {
        setValidationError(
          "Counter Guides require at least one card pair. Please add at least one card (top or bottom) in at least one pair before saving.",
        );
        return false;
      }

      // Only validate non-empty pairs (empty ones are ignored)
      // Users might have created placeholder pairs they haven't filled yet
    }

    setValidationError(null);
    return true;
  };

  const validateInitialHands = (
    initialHands: InitialHand[],
    guideType: GuideType,
    hasDeckContent: boolean,
  ): boolean => {
    // DECK guides need at least one initial hand OR a recommended deck.
    if (guideType === "DECK") {
      const validHands = initialHands.filter((h) => h.cards.length > 0);

      if (validHands.length === 0 && !hasDeckContent) {
        setValidationError(
          "Deck Guides require at least one initial hand or a recommended deck. Please add cards to a hand or add a recommended deck before saving.",
        );
        return false;
      }

      // Only validate non-empty initial hands (empty ones are ignored)
      // Users might have placeholder hands they haven't filled yet
    }

    setValidationError(null);
    return true;
  };

  const saveInstance = async (params: SaveInstanceParams): Promise<void> => {
    const {
      pairs,
      initialHands,
      guideType,
      title,
      generalTip,
      headerCard,
      archetypeId,
      archetypeName,
      userName,
      instanceId,
      deckTitle,
      deckMainCards,
      deckExtraCards,
      deckSideCards,
      hasDeckContent,
      existingDeck,
      comboSteps,
      draftInstanceId,
      onAfterSave,
    } = params;

    // Validate based on guide type
    if (guideType === "COUNTER") {
      if (!validatePairs(pairs, guideType)) {
        return;
      }
    } else if (guideType === "DECK") {
      if (!validateInitialHands(initialHands, guideType, hasDeckContent)) {
        return;
      }
    }

    const validPairs =
      guideType === "COUNTER"
        ? pairs.filter((p) => p.topCards.length > 0 || p.bottomCards.length > 0)
        : [];

    const validation = validateInstanceData(
      validPairs,
      headerCard,
      title,
      guideType,
    );

    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    setSaving(true);

    try {
      const cardPairs =
        guideType === "COUNTER" ? transformPairsForApi(validPairs) : [];

      const allCardIds: number[] = [];

      if (headerCard) {
        allCardIds.push(headerCard.id);
      }

      // Add card pair IDs for COUNTER guides
      if (guideType === "COUNTER") {
        cardPairs.forEach((pair) => {
          allCardIds.push(
            ...pair.topCardIds,
            ...pair.bottomCardIds.map((bc) => bc.cardId),
          );
        });
      }

      // Collect all DECK guide card IDs upfront so the backend can confirm every referenced card.
      if (guideType === "DECK") {
        const validHands = initialHands.filter((h) => h.cards.length > 0);
        validHands.forEach((hand) => {
          allCardIds.push(...hand.cards.map((c) => c.id));
          allCardIds.push(...getFinalBoardCardIds(hand));
        });

        // Add combo step card IDs
        if (comboSteps) {
          comboSteps.forEach((steps) => {
            steps.forEach((step) => {
              allCardIds.push(
                ...step.mainCards.map((c) => c.id),
                ...step.subCards.map((c) => c.id),
                ...step.leftSubCards.map((c) => c.id),
              );
            });
          });
        }
      }

      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);
      const sideDeckIds = deckSideCards.map((c) => c.id);

      if (hasDeckContent) {
        allCardIds.push(...mainDeckIds, ...extraDeckIds, ...sideDeckIds);
      }

      const uniqueCardIds = [...new Set(allCardIds)];

      await confirmCards(uniqueCardIds);

      // Sanitize only the title (multiple spaces -> single space)
      const sanitizedTitle = title.replace(/\s+/g, " ").trim();
      // Optional Comment preserves formatting (only trim edges)
      const processedGeneralTip = generalTip.trim();

      // Send final board state together with each non-empty hand in the same save payload.
      const initialHandsForApi =
        guideType === "DECK"
          ? initialHands
              .filter((hand) => hand.cards.length > 0)
              .map((hand) => ({
                cardIds: hand.cards.map((c) => c.id),
                description: hand.description || undefined,
                finalBoard: serializeFinalBoard(hand),
              }))
          : undefined;

      // Transform combo steps for API (only for non-empty hands with steps)
      const comboStepsForApi =
        guideType === "DECK" && comboSteps
          ? initialHands
              .filter((hand) => hand.cards.length > 0)
              .map((hand, index) => {
                const steps = comboSteps.get(hand.id) || [];
                if (steps.length === 0) return null;

                // Validate each step has at least 1 main card
                const allValidSteps = steps.filter(
                  (s) => s.mainCards.length > 0,
                );
                if (allValidSteps.length === 0) return null;

                // Separate main flow and canceled flow steps, then sort each group
                const mainFlowSteps = allValidSteps
                  .filter((s) => !s.parentCanceledStepId)
                  .sort((a, b) => a.stepOrder - b.stepOrder);

                const canceledFlowSteps = allValidSteps
                  .filter((s) => s.parentCanceledStepId)
                  .sort((a, b) => {
                    // First sort by parent step, then by stepOrder within each parent
                    const parentComparison = (
                      a.parentCanceledStepId || ""
                    ).localeCompare(b.parentCanceledStepId || "");
                    if (parentComparison !== 0) return parentComparison;
                    return a.stepOrder - b.stepOrder;
                  });

                // Combine: main flow first, then canceled flows
                const validSteps = [...mainFlowSteps, ...canceledFlowSteps];

                // Create a map of temporary step IDs to their indices
                const stepIdToIndex = new Map<string, number>();
                validSteps.forEach((step, idx) => {
                  stepIdToIndex.set(step.id, idx);
                });

                return {
                  initialHandId: index, // Use index since backend maps by position
                  steps: validSteps.map((step, stepIndex) => {
                    // Map parentCanceledStepId from temporary ID to index
                    let parentIndex: number | undefined = undefined;
                    if (step.parentCanceledStepId) {
                      const parentStepIndex = stepIdToIndex.get(
                        step.parentCanceledStepId,
                      );
                      if (parentStepIndex !== undefined) {
                        parentIndex = parentStepIndex;
                      }
                    }

                    return {
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
                      parentCanceledStepIndex: parentIndex,
                      stepOrder: stepIndex,
                    };
                  }),
                };
              })
              .filter((item): item is NonNullable<typeof item> => item !== null)
          : undefined;

      const response = await saveGuideMutation.mutateAsync({
        archetypeId,
        guideType,
        cardPairs: guideType === "COUNTER" ? cardPairs : [],
        initialHands:
          guideType === "DECK" && initialHandsForApi ? initialHandsForApi : [],
        title: sanitizedTitle,
        headerCardId: headerCard!.id,
        generalTip: processedGeneralTip || undefined,
        instanceId: instanceId,
        comboSteps: comboStepsForApi,
        draftInstanceId,
      });

      // Save or delete recommended deck based on content
      const savedInstanceId = response.instance?.id || instanceId;
      if (savedInstanceId) {
        if (hasDeckContent) {
          await saveRecommendedDeck(
            savedInstanceId,
            deckTitle,
            mainDeckIds,
            extraDeckIds,
            sideDeckIds,
          );
        } else if (existingDeck) {
          await deleteRecommendedDeck(savedInstanceId);
        }
      }

      if (response.instance?.id) {
        if (onAfterSave) {
          await onAfterSave(response.instance.id);
        }
        // After save, jump directly to the public SEO-friendly guide URL
        window.location.href = buildGuidePath({
          guideId: response.instance.id,
          archetypeId,
          archetypeName,
          userName,
          guideType,
        });
      }
    } catch (error) {
      console.error("Error saving guide:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register guide. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  return {
    saving,
    validationError,
    saveInstance,
    clearValidationError,
  };
};
