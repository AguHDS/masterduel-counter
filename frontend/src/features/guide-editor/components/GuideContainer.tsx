import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  PenLine,
  MailWarning,
} from "lucide-react";
import type { InitialHand } from "./deck-guides/InitialHandsEditor";
import { GuideHeader } from "./GuideHeader";
import { GuideTypeContentSection } from "./GuideTypeContentSection";
import { GuideMobileStatsBar } from "./GuideMobileStatsBar";
import { GuideActionButtons } from "./GuideActionButtons";
import { GuideModals } from "./GuideModals";
import { useSharedGuideEditor } from "../hooks/useSharedGuideEditor";
import { useInstanceGuideLikes } from "../hooks/useInstanceGuideLikes";
import { useInstanceGuideFavorites } from "../hooks/useInstanceGuideFavorites";
import { useCounterGuideHandlers } from "../hooks/counter-guides/useCounterGuideHandlers";
import { useDeckGuideHandlers } from "../hooks/deck-guides/useDeckGuideHandlers";
import { useDeckManagement } from "../hooks/deck-guides/useDeckManagement";
import { useGuideRecommendedDeck } from "../hooks/deck-guides/useGuideRecommendedDeck";
import { useModalOrchestration } from "../hooks/useModalOrchestration";
import { useGuideEditorCancellation } from "../hooks/useGuideEditorCancellation";
import { useGuideEditorDraftState } from "../hooks/useGuideEditorDraftState";
import { useSaveInstanceGuide } from "../hooks/useSaveInstanceGuide";
import { useGuideDraft } from "../hooks/useGuideDraft";
import { useGuideDataSync } from "../hooks/useGuideDataSync";
import { useGuideEditorRouteParams } from "../hooks/useGuideEditorRouteParams";
import { useAuth } from "@/features/auth";
import {
  deleteArchetypeGuide,
} from "../api/guideEditorApi";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import {
  useFulfillGuideRequest,
} from "@/features/guide-request";
import type {
  CardPair,
  GuideType,
  ComboStep,
} from "@/features/archetypes/types";
import {
  buildGuideEditSnapshot,
} from "../utils/guideContainerTransforms";
import {
  buildArchetypePath,
} from "@/lib/config/urlHelpers";

interface GuideContainerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
  onGuideTypeChange?: (guideType: GuideType) => void;
}

export const GuideContainer = ({
  onEditModeChange,
  onGuideTypeChange,
}: GuideContainerProps) => {
  const { isAuthenticated, user } = useAuth();

  const {
    navigate,
    legacyArchetypeIdNum,
    isCreatingNew,
    instanceIdNum,
    guideType,
    setGuideType,
    guideRequestId: guideRequestIdFromRoute,
    initialDraftId,
  } = useGuideEditorRouteParams();

  // Local state so we can restore guideRequestId from loaded draft data
  const [guideRequestId, setGuideRequestId] = useState<number | null>(guideRequestIdFromRoute);

  const editor = useSharedGuideEditor();
  const { saving, validationError, saveInstance, clearValidationError } =
    useSaveInstanceGuide();
  const fulfillRequestMutation = useFulfillGuideRequest();
  const modalOrchestration = useModalOrchestration();
  const { headerAnchor, setHeaderAnchor, isReportModalOpen } =
    modalOrchestration;

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

  // Draft instance ID is managed here because it's needed early for the query
  const [draftInstanceId, setDraftInstanceId] = useState<number | undefined>(
    initialDraftId ? Number(initialDraftId) : undefined,
  );

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
  }, [guideInstanceData?.instance.guideType, setGuideType]);

  // Restore guideRequestId from loaded draft data when accessing from profile
  useEffect(() => {
    if (!guideRequestId && guideInstanceData?.instance?.guideRequestId) {
      setGuideRequestId(guideInstanceData.instance.guideRequestId);
    }
  }, [guideRequestId, guideInstanceData?.instance?.guideRequestId]);

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
    (isCreatingNew
      ? !guideInstanceData || user?.id === guideInstanceData?.instance.userId
      : user?.id === guideInstanceData?.instance.userId);

  const isAdmin = user?.role === "admin";
  const isDraft = guideInstanceData?.instance.isDraft ?? false;

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

  // Deck Management State
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

  // Counter Guide State
  const [pairs, setPairs] = useState<CardPair[]>([]);

  // Deck Guide State
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

  // Notify parent of edit mode changes
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

  const latestEditSnapshot = useMemo(
    () =>
      buildGuideEditSnapshot({
        title: editor.title,
        generalTip: editor.generalTip,
        headerCard: editor.headerCard,
        pairs,
        initialHands,
        comboSteps,
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
  const { handleCancel } = useGuideEditorCancellation({
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
    guideRequestId,
    draftInstanceId,
  });

  // Sync guide data from server to local state
  useGuideDataSync({
    isCreatingNew,
    guideInstanceData,
    isError,
    isOwner,
    isAuthenticated,
    setTitle: editor.setTitle,
    setGeneralTip: editor.setGeneralTip,
    setHeaderCard: editor.setHeaderCard,
    setIsEditMode: editor.setIsEditMode,
    setLikeCount: likes.setLikeCount,
    setLiked: likes.setLiked,
    setFavoriteCount: favorites.setFavoriteCount,
    setFavorited: favorites.setFavorited,
    setGuideType,
    setPairs,
    setInitialHands,
    setComboSteps,
    setSelectedHandId,
    setShowComboFlow,
    setShowRecommendedDeck,
    loadLikeStatus: likes.loadLikeStatus,
    loadFavoriteStatus: favorites.loadFavoriteStatus,
    markClean,
  });

  // Draft management
  const draft = useGuideDraft({
    archetypeIdNum,
    guideType,
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
    hasRecommendedDeckFromServer,
    userId: user?.id,
    guideRequestId,
    allowNavigation,
    draftInstanceId,
    onDraftSaved: setDraftInstanceId,
  });

  const validateAndSave = async () => {
    if (!selectedArchetype) return;

    try {
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
                // Non-fatal
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

  const sourceRequest = guideInstanceData?.sourceRequest ?? null;

  // If a draft ID is in the URL but the fetch failed, redirect to home
  useEffect(() => {
    if (draftInstanceId && isError && !guideInstanceData) {
      window.location.href = "/";
    }
  }, [draftInstanceId, isError, guideInstanceData]);

  if (draftInstanceId && isError && !guideInstanceData) {
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
              You have 7 days to complete this community request. Save the
              guide to mark it as fulfilled or as draft to continue working on it later.
            </p>
          </div>
        </div>
      )}

      <section className="w-full relative flex justify-center top-2 max-[1023px]:px-0 px-4 lg:px-0 xl:px-8 mt-2">
        <div className="relative w-full lg:max-w-[2100px]">
          <div
            className="relative flex flex-col w-full min-h-[600px] border-2 border-yellow-600/50 rounded-lg py-10 sm:py-12 lg:pl-6 xl:pl-10 lg:pr-6 xl:pr-10 overflow-hidden"
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

                <GuideMobileStatsBar
                  views={guideInstanceData?.instance.views ?? 0}
                  favoriteCount={favorites.favoriteCount}
                  favorited={favorites.favorited}
                  likeCount={likes.likeCount}
                  liked={likes.liked}
                  isAuthenticated={isAuthenticated}
                isOwner={isOwner}
                isEditMode={editor.isEditMode}
                  userName={guideInstanceData?.userName}
                  userId={guideInstanceData?.instance.userId}
                  createdAt={guideInstanceData?.instance.createdAt}
                  isSmallWidth={isSmallWidth}
                  onToggleFavorite={favorites.toggleFavorite}
                  onToggleLike={likes.toggleLike}
                />
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

              <GuideActionButtons
                isEditMode={editor.isEditMode}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isDraft={isDraft}
                isCreatingNew={isCreatingNew}
                isAuthenticated={isAuthenticated}
                draftInstanceId={draftInstanceId}
                isArchetypeRegistered={!!selectedArchetype.registered}
                saving={saving}
                savingDraft={draft.savingDraft}
                draftMessage={draft.draftMessage}
                draftError={draft.draftError}
                validationError={validationError}
                onSave={validateAndSave}
                onCancel={handleCancel}
                onSaveDraft={draft.handleSaveDraft}
                onDeleteDraft={draft.handleDeleteDraft}
                onEdit={() => editor.setIsEditMode(true)}
                onDelete={handleDeleteInstance}
                onReport={() => modalOrchestration.setIsReportModalOpen(true)}
                onRegister={handleRegisterClick}
              />

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

      <GuideModals
        isSelectingHeader={editor.isSelectingHeader}
        headerAnchor={headerAnchor}
        isReportModalOpen={isReportModalOpen}
        isSourceRequestModalOpen={isSourceRequestModalOpen}
        guideInstanceId={guideInstanceData?.instance.id}
        guideInstanceTitle={guideInstanceData?.instance.title}
        sourceRequest={sourceRequest}
        currentUser={user ?? null}
        onCloseHeaderModal={() => {
          editor.setIsSelectingHeader(false);
          setHeaderAnchor(null);
        }}
        onSelectHeaderCard={editor.handleHeaderCardSelected}
        onCloseReportModal={() =>
          modalOrchestration.setIsReportModalOpen(false)
        }
        onCloseSourceRequestModal={() =>
          setIsSourceRequestModalOpen(false)
        }
      />
    </>
  );
};
