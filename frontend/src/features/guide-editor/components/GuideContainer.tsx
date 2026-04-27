import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
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
import { useAuth } from "@/features/auth";
import { deleteArchetypeGuide } from "../api/guideEditorApi";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import { useFulfillGuideRequest } from "@/features/guide-request";
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

  useRegisterView(instanceIdNum, archetypeIdNum);

  // Deck Management State (only for deck guides)
  const recommendedDeck = useGuideRecommendedDeck(
    guideType === "DECK" ? instanceIdNum : undefined
  );

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
      editor.setIsEditMode(false);

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

  const { allowNavigation, blockNavigation, confirmDiscardIfDirty } =
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
   * Validates and saves the guide instance to the server
   * Handles both Counter and Deck guides
   */
  const validateAndSave = async () => {
    if (!selectedArchetype) return;

    try {
      // Only process deck data for Deck guides
      const mainDeckIds = guideType === "DECK" ? deckMainCards.map((c) => c.id) : [];
      const extraDeckIds = guideType === "DECK" ? deckExtraCards.map((c) => c.id) : [];
      const sideDeckIds = guideType === "DECK" ? deckSideCards.map((c) => c.id) : [];
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

  if (!selectedArchetype) {
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
          <div className="w-full max-w-[2100px] bg-[#c2901c]/10 border border-[#c2901c]/40 rounded-lg px-4 py-3 flex items-center justify-center gap-3">
            <PenLine className="h-4 w-4 text-[#c2901c] shrink-0" />
            <p className="text-[#c2901c] text-sm text-center">
              You are creating a guide to complete a community request. Save the
              guide to mark it as fulfilled.
            </p>
          </div>
        </div>
      )}

      <section className="w-full relative flex justify-center top-2 px-4 sm:px-6 lg:px-6 xl:px-8 mt-2">
        <div className="relative w-full max-w-[2100px] rounded-[28px] p-[3px]">
          {/* Background image with transparency effect */}
          <div className="absolute inset-0 rounded-[24px] overflow-hidden">
            {/* Semi-transparent overlay to maintain the original transparency effect */}
            <div className="absolute inset-0 " />
          </div>

          {/* Content container with gradient and transparency */}
          <div
            className={`relative flex flex-col w-full min-h-[600px] border-2 rounded-md py-10 sm:py-12 px-4 sm:px-6 lg:px-6 xl:px-10 ${
              guideType === "COUNTER"
                ? "border-amber-500/70"
                : "border-blue-500/70"
            }`}
          >
            {/* Gradient overlay with transparency */}
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
                  guideType === "DECK" && (showRecommendedDeck || !!recommendedDeck.deck)
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
                hasRecommendedDeckFromServer={hasRecommendedDeckFromServer}
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
                      onClick={() =>
                        modalOrchestration.setIsReportModalOpen(true)
                      }
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
          onClose={() => modalOrchestration.setIsReportModalOpen(false)}
          targetType="instance"
          targetId={guideInstanceData.instance.id}
          targetName={guideInstanceData.instance.title}
        />
      )}
    </>
  );
};
