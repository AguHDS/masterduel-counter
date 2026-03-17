import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Edit3,
  Trash2,
  ThumbsUp,
  Star,
  Plus,
  Save,
  X,
  Flag,
  ArrowLeft,
  Eye,
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
import { instanceApi } from "@/lib/http/instanceApi";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { useRegisterView } from "@/shared/hooks/useRegisterView";
import instanceEditorBackground from "@/assets/instanceEditorAndProfile_background.webp";
import type { CardPair } from "@/features/archetypes/types";

interface GuideContainerProps {
  onEditModeChange?: (isEditMode: boolean) => void;
}

/** Guide main container */
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

  // Register view for this instance
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

  // Status for card pairs
  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Notify parent of edit mode changes
  useEffect(() => {
    onEditModeChange?.(editor.isEditMode && isOwner);
  }, [editor.isEditMode, isOwner, onEditModeChange]);

  useEffect(() => {
    if (!editor.isEditMode || !isOwner) {
      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
    } else if (recommendedDeck.deck === null) {
      // If the deck was deleted (deck is null), empty the arrays even in edit mode
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
      // Sanitize only the title (multiple spaces -> single space)
      const sanitizedTitle = data.title.replace(/\s+/g, " ").trim();
      // generalTip preserves formatting (spaces and line breaks)
      const generalTip = data.generalTip || "";

      editor.setLoadedPairs(data.pairs);
      editor.setTitle(sanitizedTitle);
      editor.setGeneralTip(generalTip);
      editor.setHeaderCard(data.headerCard);
      likes.setLikeCount(data.likes);
      favorites.setFavoriteCount(data.favorites);
      editor.setIsEditMode(false);

      // Update local pairs state
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

      // Load favorite status for all authenticated users (can favorite own guides)
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

      // Sanitize only the title (multiple spaces -> single space)
      const sanitizedTitle =
        guideInstanceData.instance.title?.replace(/\s+/g, " ").trim() ||
        "Title";
      // generalTip preserves formatting (spaces and line breaks)
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
      await instanceApi.deleteGuide(guideInstanceData.instance.id);
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
      <section className="w-full opacity-[95%] relative bottom-5 flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[1456px] rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative flex flex-col w-full min-h-[600px] rounded-[24px] py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
            <img
              src={instanceEditorBackground}
              alt=""
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none select-none rounded-[24px]"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#030717]/80 via-[#0a0f2c]/80 to-[#1a1743]/80 rounded-[24px]"></div>

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

                <div className="ml-auto  flex items-center space-x-4 relative left-5">
                  {!isCreatingNew && selectedArchetype.registered && (
                    <div className="flex items-center space-x-1">
                      {/* Views counter */}
                      <div className="flex items-center space-x-2 px-3 py-1 text-purple-400">
                        <Eye className="w-5 h-5" />
                        <span>{guideInstanceData?.instance.views || 0}</span>
                      </div>

                      {/* Favorite button */}
                      <button
                        onClick={
                          isAuthenticated ? favorites.toggleFavorite : undefined
                        }
                        disabled={!isAuthenticated}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors shadow-lg ${
                          favorites.favoriteCount > 0
                            ? "text-yellow-400"
                            : "text-white"
                        } ${!isAuthenticated ? "cursor-not-allowed" : ""}`}
                        title={
                          !isAuthenticated
                            ? "Log in to favorite this guide"
                            : favorites.favorited
                              ? "Remove from favorites"
                              : "Add to favorites"
                        }
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.favoriteCount > 0 ? "text-yellow-400" : ""
                          }`}
                        />
                        <span>{favorites.favoriteCount}</span>
                      </button>

                      {/* Like button */}
                      <button
                        onClick={
                          isAuthenticated && !isOwner
                            ? likes.toggleLike
                            : undefined
                        }
                        disabled={!isAuthenticated || isOwner}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors shadow-lg ${
                          likes.likeCount > 0 ? "text-green-500" : "text-white"
                        } ${
                          !isAuthenticated || isOwner
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          !isAuthenticated
                            ? "Log in to like this guide"
                            : isOwner
                              ? "You cannot like your own guide"
                              : undefined
                        }
                      >
                        <ThumbsUp
                          className={`w-5 h-5 ${
                            likes.likeCount > 0 ? "text-green-500" : ""
                          }`}
                        />
                        <span>{likes.likeCount}</span>
                      </button>
                    </div>
                  )}

                  {/* Creator Info */}
                  {!isCreatingNew && guideInstanceData && (
                    <div className="flex items-center space-x-2">
                      {guideInstanceData.userProfilePictureUrl ? (
                        <img
                          src={guideInstanceData.userProfilePictureUrl}
                          alt={`${guideInstanceData.userName}'s profile`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {guideInstanceData.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 text-xs">Made by</span>
                        <Link
                          to={`/profile/${guideInstanceData.instance.userId}`}
                          className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors underline"
                        >
                          {guideInstanceData.userName}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
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
              />

              <div className="flex justify-center my-8">
                <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
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
                <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
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
