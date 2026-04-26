import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  CreditCard as Edit3,
  Trash2,
  Save,
  X,
  Flag,
  ArrowLeft,
  PenLine,
} from "lucide-react";
import type { InitialHand } from "./InitialHandsEditor";
import { FloatingCardSearchModal } from "../../archetypes/components/FloatingCardSearchModal";
import { InstanceHeader } from "./InstanceHeader";
import { GuideTypeContentSection } from "./GuideTypeContentSection";
import { useInstanceGuideEditor } from "../hooks/useInstanceGuideEditor";
import { useInstanceGuideLikes } from "../hooks/useInstanceGuideLikes";
import { useInstanceGuideFavorites } from "../hooks/useInstanceGuideFavorites";
import { useInstanceGuideData } from "../hooks/useInstanceGuideData";
import { useGuideRecommendedDeck } from "../hooks/useGuideRecommendedDeck";
import { useGuideEditorDraftState } from "../hooks/useGuideEditorDraftState";
import { useSaveInstanceGuide } from "../hooks/useSaveInstanceGuide";
import { useAuth } from "@/features/auth";
import { deleteArchetypeGuide } from "../api/guideEditorApi";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import { useFulfillGuideRequest } from "@/features/guide-request";
import type {
  CardPair,
  Card,
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
  extractNumericIdFromSlug,
  inferGuideTypeFromSlug,
} from "@/lib/config/urlHelpers";

interface GuideContainerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
  onGuideTypeChange?: (guideType: GuideType) => void;
}

// Orchestrates guide loading, edit state, and type-specific sections for the guide editor page
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
  const editor = useInstanceGuideEditor();
  const { saving, validationError, saveInstance, clearValidationError } =
    useSaveInstanceGuide();
  const fulfillRequestMutation = useFulfillGuideRequest();
  const [headerAnchor, setHeaderAnchor] = useState<HTMLElement | null>(null);
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
  const typeFromState = (location.state as { guideType?: GuideType; guideRequestId?: number })
    ?.guideType;
  const guideRequestId = (location.state as { guideRequestId?: number })?.guideRequestId ?? null;
  const typeFromSlug = inferGuideTypeFromSlug(guideSlug);
  const initialGuideType: GuideType =
    typeFromUrl === "counter"
      ? "COUNTER"
      : typeFromUrl === "deck"
        ? "DECK"
        : (typeFromSlug ?? typeFromState ?? "COUNTER");
  const [guideType, setGuideType] = useState<GuideType>(initialGuideType);

  const { data: guideInstanceData, isError } = useGetGuideInstance(
    legacyArchetypeIdNum,
    isCreatingNew ? undefined : instanceIdNum,
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

  const { data: archetypeWithHeaderData } =
    useArchetypeWithHeader(archetypeIdNum);

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

  const recommendedDeck = useGuideRecommendedDeck(instanceIdNum);

  useRegisterView(instanceIdNum, archetypeIdNum);

  const memoizedMainDeck = useMemo(
    () => recommendedDeck.deck?.mainDeck || [],
    [recommendedDeck.deck?.mainDeck],
  );
  const memoizedExtraDeck = useMemo(
    () => recommendedDeck.deck?.extraDeck || [],
    [recommendedDeck.deck?.extraDeck],
  );
  const memoizedSideDeck = useMemo(
    () => recommendedDeck.deck?.sideDeck || [],
    [recommendedDeck.deck?.sideDeck],
  );

  const [deckTitle, setDeckTitle] = useState<string>(
    recommendedDeck.deck?.title || "Recommended Deck",
  );
  const [deckMainCards, setDeckMainCards] = useState<
    Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>
  >(memoizedMainDeck);
  const [deckExtraCards, setDeckExtraCards] = useState<
    Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>
  >(memoizedExtraDeck);
  const [deckSideCards, setDeckSideCards] = useState<
    Array<{
      id: number;
      name: string;
      imageUrl: string;
      imageUrlSmall: string;
      imageUrlCropped: string;
    }>
  >(memoizedSideDeck);

  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [initialHands, setInitialHands] = useState<InitialHand[]>([]);
  const [comboSteps, setComboSteps] = useState<Map<string, ComboStep[]>>(
    new Map(),
  );
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [showComboFlow, setShowComboFlow] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showRecommendedDeck, setShowRecommendedDeck] = useState(false);
  const [activeModalComponent, setActiveModalComponent] = useState<
    | "recommended-deck"
    | "initial-hands"
    | "card-pairs-handtraps"
    | "card-pairs-board-breakers"
    | "combo-steps"
    | null
  >(null);
  const [originalDeckState, setOriginalDeckState] = useState<{
    exists: boolean;
    title: string;
    mainCards: Card[];
    extraCards: Card[];
    sideCards: Card[];
  } | null>(null);

  // Handle modal state changes from child components
  const handleModalStateChange = useCallback(
    (
      component:
        | "recommended-deck"
        | "initial-hands"
        | "card-pairs-handtraps"
        | "card-pairs-board-breakers"
        | "combo-steps",
      isOpen: boolean,
    ) => {
      // Maintains a single active modal to avoid overlap between editors.
      if (isOpen) {
        setActiveModalComponent(component);
      } else {
        setActiveModalComponent(null);
      }
    },
    [],
  );

  useEffect(() => {
    onEditModeChange?.(editor.isEditMode && isOwner);

    // Save original deck state when entering edit mode
    if (editor.isEditMode && isOwner && !originalDeckState) {
      setOriginalDeckState({
        exists: !!recommendedDeck.deck,
        title: deckTitle,
        mainCards: [...deckMainCards],
        extraCards: [...deckExtraCards],
        sideCards: [...deckSideCards],
      });
    }

    // Clear original deck state when exiting edit mode (after save)
    if (!editor.isEditMode && originalDeckState) {
      setOriginalDeckState(null);
    }
  }, [
    editor.isEditMode,
    isOwner,
    onEditModeChange,
    originalDeckState,
    recommendedDeck.deck,
    deckTitle,
    deckMainCards,
    deckExtraCards,
    deckSideCards,
  ]);

  useEffect(() => {
    if (!editor.isEditMode || !isOwner) {
      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
      setDeckSideCards(recommendedDeck.deck?.sideDeck || []);
    } else if (recommendedDeck.deck === null) {
      setDeckTitle("Recommended Deck");
      setDeckMainCards([]);
      setDeckExtraCards([]);
      setDeckSideCards([]);
    }
  }, [recommendedDeck.deck, editor.isEditMode, isOwner]);

  // Show recommended deck automatically when not in edit mode if it exists
  useEffect(() => {
    if (!editor.isEditMode && recommendedDeck.deck) {
      setShowRecommendedDeck(true);
    }
  }, [editor.isEditMode, recommendedDeck.deck]);

  // Show recommended deck in edit mode if it exists
  useEffect(() => {
    if (
      editor.isEditMode &&
      isOwner &&
      recommendedDeck.deck &&
      !showRecommendedDeck
    ) {
      setShowRecommendedDeck(true);
    }
  }, [recommendedDeck.deck, editor.isEditMode, isOwner, showRecommendedDeck]);

  // Auto-select first initial hand when hands are loaded or changed
  useEffect(() => {
    if (guideType === "DECK" && initialHands.length > 0) {
      // If no hand is selected or selected hand no longer exists, select the first one
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

  const handleDeckChange = useCallback(
    (
      title: string,
      mainDeck: typeof deckMainCards,
      extraDeck: typeof deckExtraCards,
      sideDeck: typeof deckSideCards,
    ) => {
      // Synchronizes recommended deck changes in the container state.
      setDeckTitle(title);
      setDeckMainCards(mainDeck);
      setDeckExtraCards(extraDeck);
      setDeckSideCards(sideDeck);
    },
    [],
  );

  // Deletes/hides deck based on edit or view mode.
  const handleDeleteDeck = useCallback(async () => {
    // In edit mode, only hide the deck locally
    if (editor.isEditMode && isOwner) {
      setShowRecommendedDeck(false);
      setDeckTitle("Recommended Deck");
      setDeckMainCards([]);
      setDeckExtraCards([]);
      setDeckSideCards([]);
    } else {
      // In view mode, actually delete from server
      await recommendedDeck.deleteRecommendedDeck();
      setShowRecommendedDeck(false);
    }
  }, [recommendedDeck, editor.isEditMode, isOwner]);

  useInstanceGuideData({
    isCreatingNew,
    guideInstanceData,
    isError,
    isOwner,
    onDataLoaded: (data) => {
      const sanitizedTitle = data.title.replace(/\s+/g, " ").trim();
      const generalTip = data.generalTip || "";

      // Set guide type from loaded data
      if (guideInstanceData?.instance.guideType) {
        setGuideType(guideInstanceData.instance.guideType as GuideType);
      }

      editor.setLoadedPairs(data.pairs);
      editor.setTitle(sanitizedTitle);
      editor.setGeneralTip(generalTip);
      editor.setHeaderCard(data.headerCard);
      likes.setLikeCount(data.likes);
      favorites.setFavoriteCount(data.favorites);
      editor.setIsEditMode(false);

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
          // Show combo flow if first hand has combo steps
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
      editor.setLoadedPairs([]);
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
      editor.setLoadedPairs([]);
      editor.setHeaderCard(null);
      editor.setTitle("Title");
      editor.setGeneralTip("");
      likes.setLiked(false);
      likes.setLikeCount(0);
      favorites.setFavorited(false);
      setPairs([]);
      setInitialHands([]);
      setShowRecommendedDeck(false);
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
        deckTitle,
        deckMainCards,
        deckExtraCards,
        deckSideCards,
        showRecommendedDeck,
      }),
    [
      editor.title,
      editor.generalTip,
      editor.headerCard,
      pairs,
      initialHands,
      comboSteps,
      deckTitle,
      deckMainCards,
      deckExtraCards,
      deckSideCards,
      showRecommendedDeck,
    ],
  );

  const { allowNavigation, blockNavigation, confirmDiscardIfDirty } =
    useGuideEditorDraftState({
      isEditMode: editor.isEditMode,
      isOwner,
      snapshot: latestEditSnapshot,
    });

  const handleCancel = () => {
    // Cancels editing and restores persisted data in the guide
    if (
      !confirmDiscardIfDirty(
        "You have unsaved changes. Are you sure you want to cancel?",
      )
    )
      return;

    editor.setIsEditMode(false);
    clearValidationError();

    if (!isCreatingNew && guideInstanceData) {
      const pairs: CardPair[] = mapGuideCardPairsToEditorPairs(
        guideInstanceData.cardPairs,
      );

      const sanitizedTitle =
        guideInstanceData.instance.title?.replace(/\s+/g, " ").trim() ||
        "Title";
      const generalTip = guideInstanceData.instance.generalTip || "";

      // Restore original deck state if it was saved
      if (originalDeckState) {
        setDeckTitle(originalDeckState.title);
        setDeckMainCards(originalDeckState.mainCards);
        setDeckExtraCards(originalDeckState.extraCards);
        setDeckSideCards(originalDeckState.sideCards);
        setShowRecommendedDeck(originalDeckState.exists);
        setOriginalDeckState(null);
      } else {
        // Fallback to current deck state
        setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
        setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
        setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
        setDeckSideCards(recommendedDeck.deck?.sideDeck || []);
        setShowRecommendedDeck(recommendedDeck.deck ? true : false);
      }

      editor.resetToInitialData({
        pairs,
        title: sanitizedTitle,
        generalTip: generalTip,
        headerCard: guideInstanceData.headerCard
          ? {
              id: guideInstanceData.headerCard.id,
              name: guideInstanceData.headerCard.name,
              imageUrl: guideInstanceData.headerCard.imageUrl,
              imageUrlCropped: guideInstanceData.headerCard.imageUrlCropped,
            }
          : null,
      });

      setPairs(pairs);

      // Restore initial hands if this is a DECK guide
      if (
        guideInstanceData.instance.guideType === "DECK" &&
        guideInstanceData.initialHands
      ) {
        const { initialHands: transformedHands, comboSteps: comboStepsMap } =
          mapInitialHandsAndComboStepsFromInstance(
            guideInstanceData.initialHands,
          );

        setInitialHands(transformedHands);
        setComboSteps(comboStepsMap);

        // Restore selected hand and show combo flow if it has steps
        if (transformedHands.length > 0 && !selectedHandId) {
          setSelectedHandId(transformedHands[0].id);
          // Show combo flow if first hand has combo steps
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
    } else {
      navigate(-1);
    }
  };

  const addHandtrap = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section: "HANDTRAP",
      topCards: [],
      bottomCards: [],
      comment: undefined,
    };

    setPairs((prevPairs) => {
      const firstBoardBreakerIndex = prevPairs.findIndex(
        (pair) => pair.section === "BOARD_BREAKER",
      );

      if (firstBoardBreakerIndex === -1) {
        return [...prevPairs, newPair];
      }

      return [
        ...prevPairs.slice(0, firstBoardBreakerIndex),
        newPair,
        ...prevPairs.slice(firstBoardBreakerIndex),
      ];
    });
  };

  const addBoardBreaker = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section: "BOARD_BREAKER",
      topCards: [],
      bottomCards: [],
      comment: undefined,
    };
    setPairs((prevPairs) => [...prevPairs, newPair]);
  };

  const addInitialHand = () => {
    const newHand: InitialHand = {
      id: `hand-${Date.now()}`,
      cards: [],
    };
    setInitialHands([...initialHands, newHand]);
  };

  const handleAddCombo = (handId: string) => {
    // Select the hand to show combo flow section
    setSelectedHandId(handId);
    setShowComboFlow(true);

    // Optional: Scroll to combo flow section after a brief delay
    setTimeout(() => {
      const comboSection = document.querySelector("[data-combo-flow-section]");
      if (comboSection) {
        comboSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  const handleShowCombo = (handId: string) => {
    setSelectedHandId(handId);
    setShowComboFlow(true);
  };

  const handleSelectHand = (handId: string) => {
    setSelectedHandId(handId);
  };

  const getComboStepsForSelectedHand = (): ComboStep[] => {
    if (!selectedHandId) return [];
    return comboSteps.get(selectedHandId) || [];
  };

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

  const handleDuplicateInitialHand = useCallback(
    (originalHandId: string, newHandId: string) => {
      const originalSteps = comboSteps.get(originalHandId);
      if (!originalSteps || originalSteps.length === 0) return;

      // Map viejo ID -> nuevo ID para preservar referencias de parentCanceledStepId
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
    [comboSteps],
  );

  const validateAndSave = async () => {
    if (!selectedArchetype) return;

    try {
      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);
      const sideDeckIds = deckSideCards.map((c) => c.id);
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
        deckTitle,
        deckMainCards,
        deckExtraCards,
        deckSideCards,
        hasDeckContent,
        existingDeck: !!recommendedDeck.deck,
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

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      alert("You must be logged in to register archetypes.");
      return;
    }

    if (!selectedArchetype?.registered || isOwner) {
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

  if (!selectedArchetype) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading...</div>
      </div>
    );
  }

  const displayMainDeck =
    editor.isEditMode && isOwner ? deckMainCards : memoizedMainDeck;
  const displayExtraDeck =
    editor.isEditMode && isOwner ? deckExtraCards : memoizedExtraDeck;
  const displaySideDeck =
    editor.isEditMode && isOwner ? deckSideCards : memoizedSideDeck;
  const displayTitle =
    editor.isEditMode && isOwner ? deckTitle : recommendedDeck.deck?.title;

  return (
    <>
      {/* Guide request banner — shown above the section, centered */}
      {guideRequestId && isCreatingNew && (
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 mt-4">
          <div className="w-full max-w-[2100px] bg-[#c2901c]/10 border border-[#c2901c]/40 rounded-lg px-4 py-3 flex items-center justify-center gap-3">
            <PenLine className="h-4 w-4 text-[#c2901c] shrink-0" />
            <p className="text-[#c2901c] text-sm text-center">
              You are creating a guide to complete a community request. Save the guide to mark it as fulfilled.
            </p>
          </div>
        </div>
      )}

      <section className="w-full relative flex justify-center top-2 px-4 sm:px-6 lg:px-8 mt-2">
        <div className="relative w-full max-w-[2100px] rounded-[28px] p-[3px]">
          {/* Background image with transparency effect */}
          <div className="absolute inset-0 rounded-[24px] overflow-hidden">
            {/* Semi-transparent overlay to maintain the original transparency effect */}
            <div className="absolute inset-0 " />
          </div>

          {/* Content container with gradient and transparency */}
          <div
            className={`relative flex flex-col w-full min-h-[600px] border-2 rounded-md py-10 sm:py-12 px-4 sm:px-6 lg:px-10 ${
              guideType === "COUNTER"
                ? "border-amber-500/70"
                : "border-blue-500/70"
            }`}
          >
            {/* Gradient overlay with transparency - this maintains the original effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#120b31]/85 to-[#060017]/85"></div>

            <div className="relative z-10 space-y-6">
              <div className="absolute right-3 top-[-26px] flex items-center justify-between w-full px-4">
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors shadow-lg text-sm"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="ml-auto flex items-center space-x-4"></div>
              </div>

              <InstanceHeader
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
                  showRecommendedDeck || !!recommendedDeck.deck
                }
                hasHandtraps={pairs.some(
                  (pair) => pair.section === "HANDTRAP" || pair.section == null,
                )}
                hasBoardBreakers={pairs.some(
                  (pair) => pair.section === "BOARD_BREAKER",
                )}
                createdAt={guideInstanceData?.instance.createdAt}
              />

              <GuideTypeContentSection
                guideType={guideType}
                isEditMode={editor.isEditMode}
                isOwner={isOwner}
                activeModalComponent={activeModalComponent}
                onModalStateChange={handleModalStateChange}
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
                hasRecommendedDeckFromServer={!!recommendedDeck.deck}
                onShowRecommendedDeck={() => setShowRecommendedDeck(true)}
                displayTitle={displayTitle}
                displayMainDeck={displayMainDeck}
                displayExtraDeck={displayExtraDeck}
                displaySideDeck={displaySideDeck}
                onDeckChange={handleDeckChange}
                onDeleteDeck={handleDeleteDeck}
              />

              {editor.isEditMode && isOwner && (
                <div className="flex flex-col items-center gap-4 relative top-10">
                  <div className="flex justify-center gap-4  mt-8">
                    <button
                      onClick={validateAndSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
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
                      onClick={() => setIsReportModalOpen(true)}
                      className="hover:text-red-800/80 text-white"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  )}

                {isAuthenticated &&
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
          onClose={() => setIsReportModalOpen(false)}
          targetType="instance"
          targetId={guideInstanceData.instance.id}
          targetName={guideInstanceData.instance.title}
        />
      )}
    </>
  );
};
