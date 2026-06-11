import { useState } from "react";
import type { CardPair, ComboStep } from "@/features/archetypes/types";
import type { InitialHand } from "../components/deck-guides/InitialHandsEditor";
import type { GuideType } from "@/features/archetypes/types";
import type { Card } from "@/features/archetypes/types";
import { useSaveDraft, useDeleteDraft } from "./useArchetypeQueries";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import {
  saveRecommendedDeck,
  deleteRecommendedDeck,
} from "../api/guideEditorApi";
import {
  serializeFinalBoard,
  transformComboStepsForApi,
} from "../utils/serialization";

interface UseGuideDraftParams {
  archetypeIdNum: number | undefined;
  guideType: GuideType;
  title: string;
  generalTip: string;
  headerCard: { id: number } | null;
  pairs: CardPair[];
  initialHands: InitialHand[];
  comboSteps: Map<string, ComboStep[]>;
  deckTitle: string;
  deckMainCards: Card[];
  deckExtraCards: Card[];
  deckSideCards: Card[];
  hasRecommendedDeckFromServer: boolean;
  userId: string | undefined;
  guideRequestId: number | null;
  allowNavigation: () => void;
  draftInstanceId: number | undefined;
  onDraftSaved: (draftId: number) => void;
}

/** Manages draft persistence, including serialization, validation, saving, and deletion workflows */
export const useGuideDraft = ({
  archetypeIdNum,
  guideType,
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
  hasRecommendedDeckFromServer,
  userId,
  guideRequestId,
  allowNavigation,
  draftInstanceId,
  onDraftSaved,
}: UseGuideDraftParams) => {
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  const saveDraftMutation = useSaveDraft();
  const deleteDraftMutation = useDeleteDraft();

  const handleSaveDraft = async () => {
    if (!archetypeIdNum) return;
    allowNavigation();
    setSavingDraft(true);
    setDraftMessage(null);
    setDraftError(null);

    try {
      const cardPairsForDraft =
        guideType === "COUNTER"
          ? pairs
              .filter((p) => p.topCards.length > 0 || p.bottomCards.length > 0)
              .map((pair) => ({
                topCardIds: pair.topCards.map((c) => c.id),
                bottomCardIds: pair.bottomCards.map((c) => ({
                  cardId: c.id,
                  effectiveness: c.effectiveness ?? undefined,
                })),
                pairSection: pair.section ?? null,
                comment: pair.comment ?? undefined,
              }))
          : undefined;

      const initialHandsForDraft =
        guideType === "DECK"
          ? initialHands
              .filter((h) => h.cards.length > 0)
              .map((h) => ({
                cardIds: h.cards.map((c) => c.id),
                description: h.description || undefined,
                finalBoard: serializeFinalBoard(h),
              }))
          : undefined;

      const comboStepsForDraft =
        guideType === "DECK" && comboSteps
          ? transformComboStepsForApi(initialHands, comboSteps)
          : undefined;

      const allDraftCardIds: number[] = [];
      if (headerCard?.id) allDraftCardIds.push(headerCard.id);
      if (cardPairsForDraft) {
        for (const pair of cardPairsForDraft) {
          allDraftCardIds.push(...pair.topCardIds);
          allDraftCardIds.push(...pair.bottomCardIds.map((bc) => bc.cardId));
        }
      }
      if (initialHandsForDraft) {
        for (const hand of initialHandsForDraft) {
          allDraftCardIds.push(...hand.cardIds);
        }
      }
      if (comboStepsForDraft) {
        for (const handCombo of comboStepsForDraft) {
          for (const step of handCombo.steps) {
            allDraftCardIds.push(
              ...step.mainCardIds,
              ...step.subCardIds,
              ...(step.leftSubCardIds ?? []),
            );
          }
        }
      }
      if (guideType === "DECK") {
        allDraftCardIds.push(
          ...deckMainCards.map((c) => c.id),
          ...deckExtraCards.map((c) => c.id),
          ...deckSideCards.map((c) => c.id),
        );
      }
      if (allDraftCardIds.length > 0) {
        await confirmCards([...new Set(allDraftCardIds)]);
      }

      const result = await saveDraftMutation.mutateAsync({
        archetypeId: archetypeIdNum,
        guideType,
        cardPairs: cardPairsForDraft,
        initialHands: initialHandsForDraft,
        title: title || undefined,
        headerCardId: headerCard?.id ?? null,
        generalTip: generalTip || null,
        comboSteps: comboStepsForDraft,
        draftInstanceId,
        guideRequestId: guideRequestId || undefined,
      });

      onDraftSaved(result.draft.id);

      if (guideType === "DECK") {
        const mainDeckIds = deckMainCards.map((c) => c.id);
        const extraDeckIds = deckExtraCards.map((c) => c.id);
        const sideDeckIds = deckSideCards.map((c) => c.id);
        const hasDeckContent =
          mainDeckIds.length > 0 ||
          extraDeckIds.length > 0 ||
          sideDeckIds.length > 0;
        const draftId = result.draft.id;
        const deckExistedBefore = hasRecommendedDeckFromServer;
        if (hasDeckContent) {
          try {
            await saveRecommendedDeck(
              draftId,
              deckTitle,
              mainDeckIds,
              extraDeckIds,
              sideDeckIds,
            );
          } catch {
            // Non-fatal
          }
        } else if (deckExistedBefore) {
          try {
            await deleteRecommendedDeck(draftId);
          } catch {
            // Non-fatal
          }
        }
      }

      if (userId) {
        window.location.href = `/profile/${userId}/guides`;
      }
    } catch (error) {
      const userMsg =
        error && typeof error === "object" && "userMessage" in error
          ? (error as { userMessage: string }).userMessage
          : undefined;
      const msg =
        userMsg ??
        (error instanceof Error ? error.message : "Failed to save draft.");
      setDraftError(msg);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftInstanceId) return;
    const confirmed = confirm("Are you sure you want to delete this draft?");
    if (!confirmed) return;
    allowNavigation();
    try {
      await deleteDraftMutation.mutateAsync({ draftId: draftInstanceId });
      window.location.href = "/";
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to delete draft.";
      setDraftError(msg);
    }
  };

  return {
    draftMessage,
    draftError,
    savingDraft,
    handleSaveDraft,
    handleDeleteDraft,
  };
};
