import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  CreditCard as Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import { InstanceHeader } from "./InstanceHeader";
import { RecommendedDeckEditor } from "./RecommendedDeckEditor";
import { useInstanceGuideEditor } from "../hooks/useInstanceGuideEditor";
import { useInstanceGuideLikes } from "../hooks/useInstanceGuideLikes";
import { useInstanceGuideFavorites } from "../hooks/useInstanceGuideFavorites";
import { useInstanceGuideData } from "../hooks/useInstanceGuideData";
import { useGuideRecommendedDeck } from "../hooks/useGuideRecommendedDeck";
import { useSaveInstanceGuide } from "../hooks/useSaveInstanceGuide";
import { useAuth } from "@/features/auth";
import { deleteArchetypeGuide } from "../api/guideEditorApi";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import type { CardPair } from "@/features/archetypes/types";

interface GuideContainerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
}

export const GuideContainer = ({ onEditModeChange }: GuideContainerProps) => {
  const { archetypeId, instanceId } = useParams<{
    archetypeId: string;
    instanceId: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const editor = useInstanceGuideEditor();
  const { saving, validationError, saveInstance, clearValidationError } =
    useSaveInstanceGuide();

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;

  const isCreatingNew = instanceId === "new";
  const instanceIdNum =
    !isCreatingNew && instanceId ? parseInt(instanceId) : undefined;

  const { data: archetypeWithHeaderData } =
    useArchetypeWithHeader(archetypeIdNum);

  const { data: guideInstanceData, isError } = useGetGuideInstance(
    archetypeIdNum,
    isCreatingNew ? undefined : instanceIdNum,
  );

  const isOwner =
    isAuthenticated &&
    (isCreatingNew || user?.id === guideInstanceData?.instance.userId);

  const selectedArchetype = archetypeWithHeaderData?.archetype;

  const likes = useInstanceGuideLikes({
    isAuthenticated,
    archetypeId,
    instanceId: guideInstanceData?.instance.id,
    userId: user?.id,
    ownerId: guideInstanceData?.instance.userId,
  });

  const favorites = useInstanceGuideFavorites({
    isAuthenticated,
    archetypeId,
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

  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    onEditModeChange?.(editor.isEditMode && isOwner);
  }, [editor.isEditMode, isOwner, onEditModeChange]);

  useEffect(() => {
    if (!editor.isEditMode || !isOwner) {
      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
    } else if (recommendedDeck.deck === null) {
      setDeckTitle("Recommended Deck");
      setDeckMainCards([]);
      setDeckExtraCards([]);
    }
  }, [recommendedDeck.deck, editor.isEditMode, isOwner]);

  const handleDeckChange = useCallback(
    (
      title: string,
      mainDeck: typeof deckMainCards,
      extraDeck: typeof deckExtraCards,
    ) => {
      setDeckTitle(title);
      setDeckMainCards(mainDeck);
      setDeckExtraCards(extraDeck);
    },
    [],
  );

  useInstanceGuideData({
    isCreatingNew,
    guideInstanceData,
    isError,
    isOwner,
    onDataLoaded: (data) => {
      const sanitizedTitle = data.title.replace(/\s+/g, " ").trim();
      const generalTip = data.generalTip || "";

      editor.setLoadedPairs(data.pairs);
      editor.setTitle(sanitizedTitle);
      editor.setGeneralTip(generalTip);
      editor.setHeaderCard(data.headerCard);
      likes.setLikeCount(data.likes);
      favorites.setFavoriteCount(data.favorites);
      editor.setIsEditMode(false);

      const transformedPairs: CardPair[] = data.pairs.map((pair) => ({
        id: pair.id.toString(),
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));
      setPairs(transformedPairs);

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
    },
  });

  const handleCancel = () => {
    editor.setIsEditMode(false);
    clearValidationError();

    if (!isCreatingNew && guideInstanceData) {
      const pairs: CardPair[] = guideInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));

      const sanitizedTitle =
        guideInstanceData.instance.title?.replace(/\s+/g, " ").trim() ||
        "Title";
      const generalTip = guideInstanceData.instance.generalTip || "";

      editor.resetToInitialData({
        pairs,
        title: sanitizedTitle,
        generalTip: generalTip,
        headerCard: guideInstanceData.headerCard
          ? {
              id: guideInstanceData.headerCard.id,
              name: guideInstanceData.headerCard.name,
              imageUrl: guideInstanceData.headerCard.imageUrl,
            }
          : null,
      });

      setPairs(pairs);
      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
    } else {
      navigate(-1);
    }
  };

  const addPair = () => {
    const newPair: CardPair = {
      id: `pair-${Date.now()}`,
      topCards: [],
      bottomCards: [],
      effectiveness: undefined,
      comment: undefined,
    };
    setPairs([...pairs, newPair]);
  };

  const validateAndSave = async () => {
    if (!selectedArchetype) return;

    try {
      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);
      const hasDeckContent = mainDeckIds.length > 0 || extraDeckIds.length > 0;

      await saveInstance({
        pairs,
        title: editor.title,
        generalTip: editor.generalTip,
        headerCard: editor.headerCard,
        archetypeId: selectedArchetype.id,
        instanceId: isCreatingNew ? undefined : instanceIdNum,
        deckTitle,
        deckMainCards,
        deckExtraCards,
        hasDeckContent,
        existingDeck: !!recommendedDeck.deck,
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save. Please try again.",
      );
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedArchetype || !guideInstanceData?.instance.id || !archetypeId)
      return;

    const confirmed = confirm(
      "Are you sure you want to delete your instance? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
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
    if (archetypeId) {
      navigate(`/archetype/${archetypeId}`);
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
  const displayTitle =
    editor.isEditMode && isOwner ? deckTitle : recommendedDeck.deck?.title;

  return (
    <>
      <section className="w-full relative flex justify-center top-2 px-4 sm:px-6 lg:px-8 mt-2">
        <div className="relative w-full max-w-[2100px] rounded-[28px] p-[3px]">
          {/* Background image with transparency effect */}
          <div className="absolute inset-0 rounded-[24px] overflow-hidden">
            {/* Semi-transparent overlay to maintain the original transparency effect */}
            <div className="absolute inset-0 " />
          </div>

          {/* Content container with gradient and transparency */}
          <div className="relative flex flex-col w-full min-h-[600px] border-2 rounded-md border-amber-500/70 py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
            {/* Gradient overlay with transparency - this maintains the original effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#120b31]/85 to-[#060017]/85"></div>

            <div className="relative z-10 space-y-6">
              <div className="absolute right-3 top-[-26px] flex items-center justify-between w-full px-4">
                <button
                  onClick={handleBackClick}
                  className={`flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors shadow-lg text-sm ${
                    editor.isEditMode ? "invisible" : ""
                  }`}
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
                onSelectHeaderCard={() => editor.setIsSelectingHeader(true)}
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
                currentUserId={user?.id}
              />

              <div className="flex justify-center">
                <div className="w-4/5 h-px my-2 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              </div>

              <div className="mt-8">
                <CardPairEditor
                  isEditMode={editor.isEditMode && isOwner}
                  initialPairs={editor.loadedPairs}
                  pairs={pairs}
                  setPairs={setPairs}
                  onAddPair={editor.isEditMode && isOwner ? addPair : undefined}
                />
              </div>

              {editor.isEditMode && isOwner && (
                <div className="flex justify-center">
                  <button
                    onClick={addPair}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Card Pair</span>
                  </button>
                </div>
              )}

              <div className="flex justify-center my-8">
                <div className="w-4/5 h-px bg-gradient-to-r my-4 from-transparent via-slate-600 to-transparent"></div>
              </div>

              <RecommendedDeckEditor
                isEditMode={editor.isEditMode && isOwner}
                initialTitle={displayTitle}
                initialMainDeck={displayMainDeck}
                initialExtraDeck={displayExtraDeck}
                onDeckChange={handleDeckChange}
                onDelete={recommendedDeck.deleteRecommendedDeck}
              />

              {editor.isEditMode && isOwner && (
                <div className="flex flex-col items-center gap-4 mt-12 pt-8 border-t border-slate-700">
                  <div className="flex justify-center gap-4">
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
        <CardSearchModal
          isOpen={true}
          onClose={() => editor.setIsSelectingHeader(false)}
          onSelectCard={editor.handleHeaderCardSelected}
          title="Select Header Card"
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
