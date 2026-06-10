import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  CreditCard as Edit3,
  Trash2,
  Save,
  X,
  Flag,
  ArrowLeft,
  PenLine,
  MailWarning,
  FileText,
  Eye,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { InitialHand } from "./deck-guides/InitialHandsEditor";
import { FloatingCardSearchModal } from "../../archetypes/components/FloatingCardSearchModal";
import { GuideHeader } from "./GuideHeader";
import { GuideTypeContentSection } from "./GuideTypeContentSection";
import { useSharedGuideEditor } from "../hooks/useSharedGuideEditor";
import { useInstanceGuideLikes } from "../hooks/useInstanceGuideLikes";
import { useInstanceGuideFavorites } from "../hooks/useInstanceGuideFavorites";
import { useCounterGuideData } from "../hooks/counter-guides/useCounterGuideData";
import { useCounterGuideHandlers } from "../hooks/counter-guides/useCounterGuideHandlers";
import { useDeckGuideHandlers } from "../hooks/deck-guides/useDeckGuideHandlers";
import { useDeckManagement } from "../hooks/deck-guides/useDeckManagement";
import { useGuideRecommendedDeck } from "../hooks/deck-guides/useGuideRecommendedDeck";
import { useModalOrchestration } from "../hooks/useModalOrchestration";
import { useGuideEditorCancellation } from "../hooks/useGuideEditorCancellation";
import { useGuideEditorDraftState } from "../hooks/useGuideEditorDraftState";
import { useSaveInstanceGuide } from "../hooks/useSaveInstanceGuide";
import { useSaveDraft, useDeleteDraft } from "../hooks/useArchetypeQueries";
import { useAuth } from "@/features/auth";
import {
  deleteArchetypeGuide,
  saveRecommendedDeck,
  deleteRecommendedDeck,
} from "../api/guideEditorApi";
import type { FinalBoardDTO } from "../api/guideEditorApi";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import {
  GuideRequestFullModal,
  useFulfillGuideRequest,
} from "@/features/guide-request";
import type {
  CardPair,
  GuideType,
  ComboStep,
} from "@/features/archetypes/types";
import {
  buildGuideEditSnapshot,
  mapGuideCardPairsToEditorPairs,
  mapInitialHandsAndComboStepsFromInstance,
} from "../utils/guideContainerTransforms";
import {
  buildArchetypePath,
  buildProfilePath,
  extractNumericIdFromSlug,
  inferGuideTypeFromSlug,
} from "@/lib/config/urlHelpers";

interface GuideContainerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
  onGuideTypeChange?: (guideType: GuideType) => void;
}

/**
 * Orchestrates guide creation, editing, and viewing for both Counter and Deck guides
 *
 * Responsibilities:
 * - Route parameter parsing and guide type detection
 * - Authentication and ownership verification
 * - Data loading and state synchronization from server
 * - Edit mode management and draft state persistence
 * - Save/delete operations and navigation
 * - Likes, favorites, and view tracking
 * - Type-specific logic delegation to specialized hooks
 *
 * Guide Types:
 * - Counter guides: Card pairs (handtraps/board breakers matchup system)
 * - Deck guides: Initial hands, combo steps, final board preview, recommended deck (optional)
 *
 * Both types share: title, description, header card, guide metadata (likes, favorites, views, etc)
 */
export const GuideContainer = ({
  onEditModeChange,
  onGuideTypeChange,
}: GuideContainerProps) => {
  const { archetypeId, instanceId, guideSlug } = useParams<{
    archetypeId?: string;
    instanceId?: string;
    guideSlug?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const editor = useSharedGuideEditor();
  const { saving, validationError, saveInstance, clearValidationError } =
    useSaveInstanceGuide();
  const fulfillRequestMutation = useFulfillGuideRequest();
  const modalOrchestration = useModalOrchestration();
  const { headerAnchor, setHeaderAnchor, isReportModalOpen } =
    modalOrchestration;
  const legacyArchetypeIdNum = archetypeId
    ? Number.parseInt(archetypeId, 10)
    : undefined;
  const isCreatingNew = instanceId === "new";
  const parsedInstanceId = !isCreatingNew
    ? instanceId
      ? Number.parseInt(instanceId, 10)
      : extractNumericIdFromSlug(guideSlug)
    : undefined;
  const instanceIdNum =
    parsedInstanceId !== undefined && !Number.isNaN(parsedInstanceId)
      ? parsedInstanceId
      : undefined;
  const typeFromUrl = searchParams.get("type");
  const typeFromState = (
    location.state as { guideType?: GuideType; guideRequestId?: number }
  )?.guideType;
  const guideRequestId =
    (location.state as { guideRequestId?: number })?.guideRequestId ?? null;
  const typeFromSlug = inferGuideTypeFromSlug(guideSlug);
  const initialGuideType: GuideType =
    typeFromUrl === "counter"
      ? "COUNTER"
      : typeFromUrl === "deck"
        ? "DECK"
        : (typeFromSlug ?? typeFromState ?? "COUNTER");
  const [guideType, setGuideType] = useState<GuideType>(initialGuideType);
  const [isSourceRequestModalOpen, setIsSourceRequestModalOpen] =
    useState(false);
  const [isSmallWidth, setIsSmallWidth] = useState(
    typeof window !== "undefined" && window.innerWidth <= 375,
  );

  useEffect(() => {
    const handleResize = () => setIsSmallWidth(window.innerWidth <= 375);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draft state — only relevant when creating a new guide (isCreatingNew)
  const initialDraftId = searchParams.get("draftId");
  const [draftInstanceId, setDraftInstanceId] = useState<number | undefined>(
    initialDraftId ? Number(initialDraftId) : undefined,
  );
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const saveDraftMutation = useSaveDraft();
  const deleteDraftMutation = useDeleteDraft();
  // When creating new but with a draftInstanceId, fetch the draft data to pre-populate the editor
  const guideInstanceId = isCreatingNew ? draftInstanceId : instanceIdNum;
  const { data: guideInstanceData, isError } = useGetGuideInstance(
    legacyArchetypeIdNum,
    guideInstanceId,
  );

  // Keep the guide type in sync with the loaded guide and notify parent changes
  useEffect(() => {
    if (guideInstanceData?.instance.guideType) {
      setGuideType(guideInstanceData.instance.guideType);
    }
  }, [guideInstanceData?.instance.guideType]);

  useEffect(() => {
    if (onGuideTypeChange) {
      onGuideTypeChange(guideType);
    }
  }, [guideType, onGuideTypeChange]);

  const archetypeIdNum =
    legacyArchetypeIdNum ?? guideInstanceData?.instance.archetypeId;
  const resolvedArchetypeId = archetypeIdNum?.toString();

  const {
    data: archetypeWithHeaderData,
    isLoading: archetypeLoading,
    error: archetypeError,
  } = useArchetypeWithHeader(archetypeIdNum);

  const isOwner =
    isAuthenticated &&
    (isCreatingNew || user?.id === guideInstanceData?.instance.userId);

  const selectedArchetype = archetypeWithHeaderData?.archetype;

  const likes = useInstanceGuideLikes({
    isAuthenticated,
    archetypeId: resolvedArchetypeId,
    instanceId: guideInstanceData?.instance.id,
    userId: user?.id,
    ownerId: guideInstanceData?.instance.userId,
  });

  const favorites = useInstanceGuideFavorites({
    isAuthenticated,
    archetypeId: resolvedArchetypeId,
    instanceId: guideInstanceData?.instance.id,
  });

  useRegisterView(instanceIdNum, archetypeIdNum);

  // Deck Management State (only for deck guides — use draft ID when editing drafts)
  const deckInstanceId =
    guideType === "DECK"
      ? (instanceIdNum ?? (isCreatingNew ? draftInstanceId : undefined))
      : undefined;
  const recommendedDeck = useGuideRecommendedDeck(deckInstanceId);

  const deckManagement = useDeckManagement({
    recommendedDeck,
    isEditMode: editor.isEditMode,
    isOwner,
  });

  const {
    deckTitle,
    deckMainCards,
    deckExtraCards,
    deckSideCards,
    showRecommendedDeck,
    setShowRecommendedDeck,
    handleDeckChange,
    handleDeleteDeck,
    hasRecommendedDeckFromServer,
  } = deckManagement;

  // Counter Guide State (card pairs)
  const [pairs, setPairs] = useState<CardPair[]>([]);

  // Deck Guide State (initial hands, combo steps, final board)
  const [initialHands, setInitialHands] = useState<InitialHand[]>([]);
  const [comboSteps, setComboSteps] = useState<Map<string, ComboStep[]>>(
    new Map(),
  );
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [showComboFlow, setShowComboFlow] = useState(false);

  // Counter Guide Handlers
  const counterHandlers = useCounterGuideHandlers({ setPairs });
  const { addHandtrap, addBoardBreaker } = counterHandlers;

  // Deck Guide Handlers
  const deckHandlers = useDeckGuideHandlers({
    initialHands,
    setInitialHands,
    comboSteps,
    setComboSteps,
    selectedHandId,
    setSelectedHandId,
    setShowComboFlow,
  });

  const {
    addInitialHand,
    handleAddCombo,
    handleShowCombo,
    handleSelectHand,
    getComboStepsForSelectedHand,
    setComboStepsForSelectedHand,
    handleDuplicateInitialHand,
  } = deckHandlers;

  // === Notify parent of edit mode changes ===
  useEffect(() => {
    onEditModeChange?.(editor.isEditMode && isOwner);
  }, [editor.isEditMode, isOwner, onEditModeChange]);

  // Auto-select first initial hand when hands are loaded or changed
  useEffect(() => {
    if (guideType === "DECK" && initialHands.length > 0) {
      if (
        !selectedHandId ||
        !initialHands.find((h) => h.id === selectedHandId)
      ) {
        setSelectedHandId(initialHands[0].id);
      }
    } else {
      setSelectedHandId(null);
    }
  }, [initialHands, guideType, selectedHandId]);

  // Load Counter Guide Data from Server
  useCounterGuideData({
    isCreatingNew,
    guideInstanceData,
    isError,
    isOwner,
    onDataLoaded: (data) => {
      const sanitizedTitle = data.title.replace(/\s+/g, " ").trim();
      const generalTip = data.generalTip || "";

      // Set guide type from loaded data (counter or deck)
      if (guideInstanceData?.instance.guideType) {
        setGuideType(guideInstanceData.instance.guideType as GuideType);
      }

      // Set shared editor state
      editor.setTitle(sanitizedTitle);
      editor.setGeneralTip(generalTip);
      editor.setHeaderCard(data.headerCard);
      likes.setLikeCount(data.likes);
      favorites.setFavoriteCount(data.favorites);
      // If loading a draft, stay in edit mode; otherwise go to view mode
      const loadedGuide = guideInstanceData?.instance;
      if (loadedGuide?.isDraft) {
        editor.setIsEditMode(true);
      } else {
        editor.setIsEditMode(false);
      }

      // Mark the loaded state as clean (no unsaved changes)
      markClean();

      // Set Counter guide state (card pairs)
      const transformedPairs: CardPair[] = mapGuideCardPairsToEditorPairs(
        data.pairs,
      );
      setPairs(transformedPairs);

      // Load initial hands if this is a DECK guide
      if (
        guideInstanceData?.instance.guideType === "DECK" &&
        guideInstanceData.initialHands
      ) {
        const { initialHands: transformedHands, comboSteps: comboStepsMap } =
          mapInitialHandsAndComboStepsFromInstance(
            guideInstanceData.initialHands,
          );

        setInitialHands(transformedHands);
        setComboSteps(comboStepsMap);

        // Select first hand by default and show combo flow if it has steps
        if (transformedHands.length > 0) {
          setSelectedHandId(transformedHands[0].id);
          if (
            comboStepsMap.has(transformedHands[0].id.toString()) &&
            comboStepsMap.get(transformedHands[0].id.toString())!.length > 0
          ) {
            setShowComboFlow(true);
          }
        }
      } else {
        setInitialHands([]);
        setComboSteps(new Map());
        setSelectedHandId(null);
      }

      // Load likes/favorites status if authenticated
      if (isAuthenticated && !isOwner) {
        likes.loadLikeStatus();
      } else {
        likes.setLiked(false);
      }

      if (isAuthenticated) {
        favorites.loadFavoriteStatus();
      } else {
        favorites.setFavorited(false);
      }
    },
    onNewInstance: () => {
      editor.setIsEditMode(true);
      editor.setHeaderCard(null);
      editor.setTitle("Title");
      editor.setGeneralTip("");
      likes.setLiked(false);
      likes.setLikeCount(0);
      favorites.setFavorited(false);
      setPairs([]);
      setInitialHands([]);
    },
    onReset: () => {
      editor.setHeaderCard(null);
      editor.setTitle("Title");
      editor.setGeneralTip("");
      likes.setLiked(false);
      likes.setLikeCount(0);
      favorites.setFavorited(false);
      setPairs([]);
      setInitialHands([]);
      if (guideType === "DECK") {
        setShowRecommendedDeck(false);
      }
    },
  });

  const latestEditSnapshot = useMemo(
    () =>
      buildGuideEditSnapshot({
        title: editor.title,
        generalTip: editor.generalTip,
        headerCard: editor.headerCard,
        pairs,
        initialHands,
        comboSteps,
        // Only include deck data for Deck guides
        deckTitle: guideType === "DECK" ? deckTitle : "",
        deckMainCards: guideType === "DECK" ? deckMainCards : [],
        deckExtraCards: guideType === "DECK" ? deckExtraCards : [],
        deckSideCards: guideType === "DECK" ? deckSideCards : [],
        showRecommendedDeck: guideType === "DECK" ? showRecommendedDeck : false,
      }),
    [
      editor.title,
      editor.generalTip,
      editor.headerCard,
      pairs,
      initialHands,
      comboSteps,
      guideType,
      deckTitle,
      deckMainCards,
      deckExtraCards,
      deckSideCards,
      showRecommendedDeck,
    ],
  );

  const { allowNavigation, blockNavigation, confirmDiscardIfDirty, markClean } =
    useGuideEditorDraftState({
      isEditMode: editor.isEditMode,
      isOwner,
      snapshot: latestEditSnapshot,
    });

  // Handle Edit Cancellation
  const cancellationHook = useGuideEditorCancellation({
    isCreatingNew,
    guideInstanceData,
    confirmDiscardIfDirty,
    clearValidationError,
    navigate,
    setIsEditMode: editor.setIsEditMode,
    resetEditorToInitialData: editor.resetToInitialData,
    setPairs,
    setInitialHands,
    setComboSteps,
    setSelectedHandId,
    selectedHandId,
    setShowComboFlow,
    deckManagement,
    recommendedDeck,
  });

  const { handleCancel } = cancellationHook;

  /**
   * Saves the current guide state as a draft (only when creating a new guide)
   */
  const handleSaveDraft = async () => {
    if (!archetypeIdNum) return;
    // Prevent browser unsaved-changes warning during draft save
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
        if (!hand.finalBoard || isFinalBoardEmpty(hand)) return undefined;
        return {
          fieldSpellCardId: hand.finalBoard.fieldSpell?.id || null,
          extraMonsterCardIds: hand.finalBoard.extraMonsters.map(
            (c) => c?.id || null,
          ),
          monsterCardIds: hand.finalBoard.monsters.map((c) => c?.id || null),
          spellTrapCardIds: hand.finalBoard.spellTraps.map(
            (c) => c?.id || null,
          ),
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

      // Transform combo steps for API (handles main flow and canceled flow)
      const comboStepsForDraft =
        guideType === "DECK" && comboSteps
          ? initialHands
              .filter((h) => h.cards.length > 0)
              .map((hand, index) => {
                const steps = comboSteps.get(hand.id) || [];
                if (steps.length === 0) return null;
                const validSteps = steps.filter((s) => s.mainCards.length > 0);
                if (validSteps.length === 0) return null;
                // Separate main flow and canceled flow steps, then sort each group
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
                // Combine: main flow first, then canceled flows
                const orderedSteps = [...mainFlowSteps, ...canceledFlowSteps];
                // Map temporary step IDs to their indices
                const stepIdToIndex = new Map<string, number>();
                orderedSteps.forEach((step, idx) =>
                  stepIdToIndex.set(step.id, idx),
                );
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
                  })),
                };
              })
              .filter((item): item is NonNullable<typeof item> => item !== null)
          : undefined;

      // Confirm all referenced cards exist in the DB before saving draft
      const allDraftCardIds: number[] = [];
      if (editor.headerCard?.id) allDraftCardIds.push(editor.headerCard.id);
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
        title: editor.title || undefined,
        headerCardId: editor.headerCard?.id ?? null,
        generalTip: editor.generalTip || null,
        comboSteps: comboStepsForDraft,
        draftInstanceId,
        isGuideRequest: !!guideRequestId,
      });

      setDraftInstanceId(result.draft.id);

      // Save or delete recommended deck
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

      if (user?.id) {
        // Redirect to profile guides tab after saving draft
        window.location.href = `/profile/${user.id}/guides`;
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

  /**
   * Deletes the current draft guide
   */
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

  /**
   * Validates and saves the guide instance to the server
   * Handles both Counter and Deck guides
   */
  const validateAndSave = async () => {
    if (!selectedArchetype) return;

    try {
      // Only process deck data for Deck guides
      const mainDeckIds =
        guideType === "DECK" ? deckMainCards.map((c) => c.id) : [];
      const extraDeckIds =
        guideType === "DECK" ? deckExtraCards.map((c) => c.id) : [];
      const sideDeckIds =
        guideType === "DECK" ? deckSideCards.map((c) => c.id) : [];
      const hasDeckContent =
        mainDeckIds.length > 0 ||
        extraDeckIds.length > 0 ||
        sideDeckIds.length > 0;

      allowNavigation();
      await saveInstance({
        pairs,
        initialHands,
        guideType,
        title: editor.title,
        generalTip: editor.generalTip,
        headerCard: editor.headerCard,
        archetypeId: selectedArchetype.id,
        archetypeName: selectedArchetype.name,
        userName: user?.name ?? guideInstanceData?.userName,
        instanceId: isCreatingNew ? undefined : instanceIdNum,
        draftInstanceId,
        deckTitle: guideType === "DECK" ? deckTitle : "",
        deckMainCards: guideType === "DECK" ? deckMainCards : [],
        deckExtraCards: guideType === "DECK" ? deckExtraCards : [],
        deckSideCards: guideType === "DECK" ? deckSideCards : [],
        hasDeckContent,
        existingDeck: guideType === "DECK" ? !!recommendedDeck.deck : false,
        comboSteps,
        onAfterSave: guideRequestId
          ? async (newInstanceId) => {
              try {
                await fulfillRequestMutation.mutateAsync({
                  requestId: guideRequestId,
                  instanceId: newInstanceId,
                });
              } catch {
                // Non-fatal: guide was saved successfully; fulfill can fail silently
              }
            }
          : undefined,
      });
    } catch (error) {
      blockNavigation();
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save. Please try again.",
      );
    }
  };

  /**
   * Deletes the guide instance from the server after confirmation
   */
  const handleDeleteInstance = async () => {
    if (!selectedArchetype || !guideInstanceData?.instance.id) return;

    const confirmed = confirm(
      "Are you sure you want to delete your instance? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      allowNavigation();
      await deleteArchetypeGuide(guideInstanceData.instance.id);
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting instance:", error);
    }
  };

  /**
   * Enters edit mode for creating a new guide or editing an existing guide if user is the owner
   */
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      alert("You must be logged in to register archetypes.");
      return;
    }

    if (!selectedArchetype?.registered || isOwner) {
      /**
       * Navigates back to the archetype detail page or previous page
       * Confirms navigation if there are unsaved changes in edit mode
       */
      editor.setIsEditMode(true);
    }
  };

  const handleBackClick = () => {
    if (editor.isEditMode && isOwner) {
      if (
        !confirmDiscardIfDirty(
          "You have unsaved changes. Are you sure you want to go back?",
        )
      )
        return;
    }
    if (resolvedArchetypeId) {
      navigate(
        buildArchetypePath({
          archetypeId: resolvedArchetypeId,
          archetypeName: selectedArchetype?.name,
          guideType,
        }),
      );
    } else {
      navigate(-1);
    }
  };

  const sourceRequest = guideInstanceData?.sourceRequest ?? null;

  // If a draft ID is in the URL but the fetch failed, the draft was likely deleted
  if (draftInstanceId && isError && !guideInstanceData) {
    window.location.href = "/";
    return null;
  }

  if (archetypeError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">Archetype not found</div>
      </div>
    );
  }

  if (!selectedArchetype || archetypeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Guide request banner */}
      {guideRequestId && isCreatingNew && (
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 mt-4">
          <div className="w-full lg:max-w-[2100px] bg-[#c2901c]/10 border border-[#c2901c]/40 rounded-lg px-4 py-3 flex items-center justify-center gap-3">
            <PenLine className="h-4 w-4 text-[#c2901c] shrink-0" />
            <p className="text-[#c2901c] text-sm text-center">
              You are creating a guide to complete a community request. Save the
              guide to mark it as fulfilled.
            </p>
          </div>
        </div>
      )}

      <section className="w-full relative flex justify-center top-2 max-[1023px]:px-0 px-4 lg:px-0 xl:px-8 mt-2">
        <div className="relative w-full lg:max-w-[2100px]">
          <div
            className="relative flex flex-col w-full min-h-[600px] border-2 border-yellow-600/50 rounded-lg py-10 sm:py-12 pl-4 sm:pl-6 lg:pl-6 xl:pl-10 pr-4 lg:pr-6 xl:pr-10 max-[700px]:!pl-0 max-[700px]:!pr-0 overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0d0a25 0%, #08061a 100%)",
            }}
          >
            {/* decorators */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-lg z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-lg z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-lg z-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-yellow-500/50 rounded-br-lg z-20 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="absolute right-3 top-[-21px] sm:top-[-24px] lg:top-[-26px] flex items-center justify-between w-full z-20">
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 transition-colors text-xs sm:text-xs sm:px-2 sm:py-0.5 lg:text-sm lg:px-3 lg:py-1"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="ml-auto flex items-center gap-2.5 max-[1023px]:flex lg:hidden">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-400 text-[11px]">{guideInstanceData?.instance.views ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-[11px]">{guideInstanceData?.instance.favorites ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-[11px]">{guideInstanceData?.instance.likes ?? 0}</span>
                  </div>
                  {guideInstanceData?.userName && guideInstanceData?.instance.userId && (
                    <>
                      <span className="text-slate-500 text-[11px]">-</span>
                      <Link
                        to={buildProfilePath({ userName: guideInstanceData.userName, userId: guideInstanceData.instance.userId })}
                        className="text-blue-400 hover:text-blue-300 text-[11px] truncate max-w-[80px]"
                      >
                        By {guideInstanceData.userName}
                      </Link>
                    </>
                  )}
                  {guideInstanceData?.instance.createdAt && !isSmallWidth && (
                    <>
                      <span className="text-slate-500 text-[11px]">-</span>
                      <span className="text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(guideInstanceData.instance.createdAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <GuideHeader
                archetypeName={selectedArchetype.name}
                title={editor.title}
                generalTip={editor.generalTip}
                headerCard={editor.headerCard}
                isEditMode={editor.isEditMode && isOwner}
                onTitleChange={editor.setTitle}
                onGeneralTipChange={editor.setGeneralTip}
                onSelectHeaderCard={(
                  e?: React.MouseEvent<HTMLButtonElement>,
                ) => {
                  if (e?.currentTarget) setHeaderAnchor(e.currentTarget);
                  editor.setIsSelectingHeader(true);
                }}
                views={guideInstanceData?.instance.views || 0}
                favorites={favorites.favoriteCount}
                likes={likes.likeCount}
                userName={guideInstanceData?.userName}
                userId={guideInstanceData?.instance.userId}
                userProfilePictureUrl={
                  guideInstanceData?.userProfilePictureUrl ?? undefined
                }
                isCreatingNew={isCreatingNew}
                onFavoriteToggle={favorites.toggleFavorite}
                onLikeToggle={likes.toggleLike}
                isFavorited={favorites.favorited}
                isLiked={likes.liked}
                isAuthenticated={isAuthenticated}
                guideType={guideType}
                currentUserId={user?.id}
                hasRecommendedDeck={
                  guideType === "DECK" &&
                  (showRecommendedDeck || !!recommendedDeck.deck)
                }
                hasHandtraps={pairs.some(
                  (pair) => pair.section === "HANDTRAP" || pair.section == null,
                )}
                hasBoardBreakers={pairs.some(
                  (pair) => pair.section === "BOARD_BREAKER",
                )}
                createdAt={guideInstanceData?.instance.createdAt}
                guideId={guideInstanceData?.instance.id}
              />

              <GuideTypeContentSection
                guideType={guideType}
                isEditMode={editor.isEditMode}
                isOwner={isOwner}
                activeModalComponent={modalOrchestration.activeModalComponent}
                onModalStateChange={modalOrchestration.handleModalStateChange}
                pairs={pairs}
                setPairs={setPairs}
                onAddHandtrap={addHandtrap}
                onAddBoardBreaker={addBoardBreaker}
                initialHands={initialHands}
                setInitialHands={setInitialHands}
                selectedHandId={selectedHandId}
                onSelectHand={handleSelectHand}
                onAddInitialHand={addInitialHand}
                onAddCombo={handleAddCombo}
                onShowCombo={handleShowCombo}
                onDuplicateHand={handleDuplicateInitialHand}
                comboSteps={comboSteps}
                showComboFlow={showComboFlow}
                selectedHandComboSteps={getComboStepsForSelectedHand()}
                setSelectedHandComboSteps={setComboStepsForSelectedHand}
                showRecommendedDeck={showRecommendedDeck}
                onShowRecommendedDeck={() => setShowRecommendedDeck(true)}
                displayTitle={deckTitle}
                displayMainDeck={deckMainCards}
                displayExtraDeck={deckExtraCards}
                displaySideDeck={deckSideCards}
                onDeckChange={handleDeckChange}
                onDeleteDeck={handleDeleteDeck}
              />

              {editor.isEditMode && isOwner && (
                <div className="flex flex-col items-center gap-4 relative top-10">
                  <div className="flex flex-wrap justify-center gap-4 mt-8">
                    {/* Draft button — only when creating a new guide */}
                    {isCreatingNew && (
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-700/60 backdrop-blur-sm hover:bg-slate-700/90 active:bg-slate-700/30 text-slate-200 rounded-lg transition-colors shadow-md text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>
                          {savingDraft
                            ? "Saving draft..."
                            : draftInstanceId
                              ? "Update Draft"
                              : "Draft"}
                        </span>
                      </button>
                    )}
                    {/* Delete Draft button — only when a draft exists */}
                    {isCreatingNew && draftInstanceId && (
                      <button
                        onClick={handleDeleteDraft}
                        disabled={savingDraft || saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-900/40 backdrop-blur-sm hover:bg-red-900/70 active:bg-red-900/20 text-red-300 rounded-lg transition-colors shadow-md text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Draft</span>
                      </button>
                    )}
                    <button
                      onClick={validateAndSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {saving
                          ? "Saving..."
                          : isCreatingNew
                            ? "Publish"
                            : "Save Changes"}
                      </span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                  {/* Draft feedback messages */}
                  {draftMessage && (
                    <p className="text-slate-300 text-sm text-center max-w-md bg-slate-800/60 px-4 py-2 rounded-lg">
                      {draftMessage}
                    </p>
                  )}
                  {draftError && (
                    <p className="text-red-400 text-sm text-center max-w-md">
                      {draftError}
                    </p>
                  )}
                  {validationError && (
                    <p className="text-red-400 text-sm text-center max-w-md">
                      {validationError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center space-x-4 relative top-3">
                {isAuthenticated &&
                  selectedArchetype.registered &&
                  !editor.isEditMode &&
                  !isCreatingNew &&
                  isOwner && (
                    <>
                      <button
                        onClick={() => editor.setIsEditMode(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Archetype</span>
                      </button>
                      <button
                        onClick={handleDeleteInstance}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete guide</span>
                      </button>
                    </>
                  )}

                {isAuthenticated &&
                  selectedArchetype.registered &&
                  !editor.isEditMode &&
                  !isCreatingNew &&
                  !isOwner && (
                    <button
                      onClick={() =>
                        modalOrchestration.setIsReportModalOpen(true)
                      }
                      className="hover:text-red-800/80 text-white"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  )}

                {isAuthenticated &&
                  !draftInstanceId &&
                  !selectedArchetype.registered &&
                  !editor.isEditMode && (
                    <button
                      onClick={handleRegisterClick}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Register Archetype</span>
                    </button>
                  )}
              </div>

              {!editor.isEditMode && !isCreatingNew && sourceRequest && (
                <div className="flex justify-center relative top-4">
                  <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-[#c2901c]/30 bg-[#c2901c]/8 px-4 py-2 text-sm text-slate-300">
                    <MailWarning className="h-4 w-4 text-[#c2901c] shrink-0" />
                    <span className="text-slate-300">Created from Request</span>
                    <button
                      type="button"
                      onClick={() => setIsSourceRequestModalOpen(true)}
                      className="font-semibold text-[#c2901c] hover:text-[#d4a534] underline underline-offset-2 break-all"
                    >
                      {sourceRequest.title}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {editor.isSelectingHeader && (
        <FloatingCardSearchModal
          isOpen={true}
          onClose={() => {
            editor.setIsSelectingHeader(false);
            setHeaderAnchor(null);
          }}
          onSelectCard={editor.handleHeaderCardSelected}
          title="Select Header Card"
          anchorElement={headerAnchor}
          autoCloseAfterSelect={true}
        />
      )}

      {isReportModalOpen && guideInstanceData && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => modalOrchestration.setIsReportModalOpen(false)}
          targetType="instance"
          targetId={guideInstanceData.instance.id}
          targetName={guideInstanceData.instance.title}
        />
      )}

      {sourceRequest && (
        <GuideRequestFullModal
          isOpen={isSourceRequestModalOpen}
          onClose={() => setIsSourceRequestModalOpen(false)}
          currentUser={user ?? null}
          initialTab="COMPLETED"
          initialRequestId={sourceRequest.id}
        />
      )}
    </>
  );
};
