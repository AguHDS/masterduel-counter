import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Edit3, Trash2, ThumbsUp } from "lucide-react";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "./CardSearchModal";
import { InstanceHeader } from "./InstanceHeader";
import { RecommendedDeckEditor } from "./RecommendedDeckEditor";
import { useInstanceEditor } from "../hooks/useInstanceEditor";
import { useInstanceLikes } from "../hooks/useInstanceLikes";
import { useInstanceData } from "../hooks/useInstanceData";
import { useRecommendedDeck } from "../hooks/useRecommendedDeck";
import { useAuth } from "@/features/auth";
import { instanceApi } from "@/lib/http/instanceApi";
import { recommendedDeckApi } from "@/lib/http/recommendedDeckApi";
import { confirmCards } from "../api/cardApi";
import {
  useRegisterArchetype,
  useArchetypeWithHeader,
  useUserInstance,
} from "../hooks/useArchetypeQueries";
import {
  validateInstanceData,
  transformPairsForApi,
} from "../utils/validation";

interface CardPair {
  id: string;
  topCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
    imageUrlCropped: string;
  }>;
  effectiveness?: string;
  comment?: string;
}

export const ArchetypeAnalyzerContainer = () => {
  const { archetypeId, instanceId } = useParams<{
    archetypeId: string;
    instanceId: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const editor = useInstanceEditor();
  const registerMutation = useRegisterArchetype();

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;

  const isCreatingNew = instanceId === "new";
  const instanceIdNum =
    !isCreatingNew && instanceId ? parseInt(instanceId) : undefined;

  const { data: archetypeWithHeaderData } =
    useArchetypeWithHeader(archetypeIdNum);

  const { data: userInstanceData, isError } = useUserInstance(
    archetypeIdNum,
    isCreatingNew ? undefined : instanceIdNum,
  );

  const isOwner =
    isAuthenticated &&
    (isCreatingNew || user?.id === userInstanceData?.instance.userId);

  const selectedArchetype = archetypeWithHeaderData?.archetype;

  const likes = useInstanceLikes({
    isAuthenticated,
    archetypeId,
    instanceId: userInstanceData?.instance.id,
  });

  const recommendedDeck = useRecommendedDeck(instanceIdNum, isOwner);

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
  const [deckMainCards, setDeckMainCards] =
    useState<
      Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      }>
    >(memoizedMainDeck);
  const [deckExtraCards, setDeckExtraCards] =
    useState<
      Array<{
        id: number;
        name: string;
        imageUrl: string;
        imageUrlSmall: string;
        imageUrlCropped: string;
      }>
    >(memoizedExtraDeck);

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

  useInstanceData({
    isCreatingNew,
    userInstanceData,
    isError,
    isOwner,
    onDataLoaded: (data) => {
      editor.setLoadedPairs(data.pairs);
      editor.setTitle(data.title);
      editor.setGeneralTip(data.generalTip || "");
      editor.setHeaderCard(data.headerCard);
      likes.setLikeCount(data.likes);
      editor.setIsEditMode(false);

      if (isAuthenticated && !isOwner) {
        likes.loadLikeStatus();
      } else {
        likes.setLiked(false);
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
    },
    onReset: () => {
      editor.setLoadedPairs([]);
      editor.setHeaderCard(null);
      editor.setTitle("Title");
      editor.setGeneralTip("");
      likes.setLiked(false);
      likes.setLikeCount(0);
    },
  });

  const handleCancel = () => {
    editor.setIsEditMode(false);
    if (!isCreatingNew && userInstanceData) {
      const pairs: CardPair[] = userInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCards: pair.topCards,
        bottomCards: pair.bottomCards,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));
      editor.resetToInitialData({
        pairs,
        title: userInstanceData.instance.title || "Title",
        generalTip: userInstanceData.instance.generalTip || "",
        headerCard: userInstanceData.headerCard
          ? {
              id: userInstanceData.headerCard.id,
              name: userInstanceData.headerCard.name,
              imageUrl: userInstanceData.headerCard.imageUrl,
            }
          : null,
      });

      setDeckTitle(recommendedDeck.deck?.title || "Recommended Deck");
      setDeckMainCards(recommendedDeck.deck?.mainDeck || []);
      setDeckExtraCards(recommendedDeck.deck?.extraDeck || []);
    } else {
      navigate(-1);
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedArchetype || !userInstanceData?.instance.id || !archetypeId)
      return;

    const confirmed = confirm(
      "Are you sure you want to delete your instance? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await instanceApi.deleteInstance(userInstanceData.instance.id);
      alert("Instance deleted successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting instance:", error);
      alert("Failed to delete instance. Please try again.");
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

  const handleSaveCards = async (pairs: CardPair[]) => {
    if (!selectedArchetype) return;

    const validation = validateInstanceData(
      pairs,
      editor.headerCard,
      editor.title,
    );

    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    try {
      const cardPairs = transformPairsForApi(pairs);

      const allCardIds: number[] = [];

      if (editor.headerCard) {
        allCardIds.push(editor.headerCard.id);
      }

      cardPairs.forEach((pair) => {
        allCardIds.push(...pair.topCardIds, ...pair.bottomCardIds);
      });

      const mainDeckIds = deckMainCards.map((c) => c.id);
      const extraDeckIds = deckExtraCards.map((c) => c.id);
      const hasDeckContent = mainDeckIds.length > 0 || extraDeckIds.length > 0;

      // Add deck cards to confirmation array only if there is content
      if (hasDeckContent) {
        allCardIds.push(...mainDeckIds, ...extraDeckIds);
      }

      const uniqueCardIds = [...new Set(allCardIds)];

      await confirmCards(uniqueCardIds);

      const response = await registerMutation.mutateAsync({
        archetypeId: selectedArchetype.id,
        cardPairs,
        title: editor.title.trim(),
        headerCardId: editor.headerCard!.id,
        generalTip: editor.generalTip || undefined,
        instanceId: isCreatingNew ? undefined : instanceIdNum,
      });

      // Save or delete recommended deck based on content
      const savedInstanceId = response.instance?.id || instanceIdNum;
      if (savedInstanceId) {
        if (hasDeckContent) {
          // There is content, save or update the deck
          await recommendedDeckApi.saveDeck(
            savedInstanceId,
            deckTitle,
            mainDeckIds,
            extraDeckIds,
          );
        } else if (recommendedDeck.deck) {
          // No content and a deck exists, delete it
          await recommendedDeckApi.deleteDeck(savedInstanceId);
        }
      }

      editor.setIsEditMode(false);

      if (response.instance?.id) {
        window.location.href = `/archetype/${selectedArchetype.id}/instance/${response.instance.id}`;
      }
    } catch (error) {
      console.error("Error saving archetype:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register archetype. Please try again.";
      alert(errorMessage);
      throw error;
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
      <section className="w-full relative bottom-5 flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[1120px] rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
          <div
            className="relative flex flex-col w-full min-h-[600px] rounded-[24px] overflow-hidden bg-cover bg-center py-10 sm:py-12 px-4 sm:px-6 lg:px-10"
            style={{
              backgroundImage: "url('/src/assets/Instance_purplebackground.webp')",
            }}
          >
            {/* Overlay oscuro para mejorar legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#030717]/80 via-[#0a0f2c]/80 to-[#1a1743]/80"></div>

            <div className="relative z-10 space-y-6">
              {!isCreatingNew &&
                !isOwner &&
                isAuthenticated &&
                selectedArchetype.registered && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={likes.toggleLike}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
                        likes.liked
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-5 h-5 ${likes.liked ? "fill-current" : ""}`}
                      />
                      <span>{likes.likeCount}</span>
                    </button>
                  </div>
                )}

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
                  onSave={handleSaveCards}
                  onCancel={handleCancel}
                  initialPairs={editor.loadedPairs}
                />
              </div>

              <div className="flex justify-center my-8">
                <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              </div>

              <RecommendedDeckEditor
                isEditMode={editor.isEditMode && isOwner}
                initialTitle={displayTitle}
                initialMainDeck={displayMainDeck}
                initialExtraDeck={displayExtraDeck}
                onDeckChange={handleDeckChange}
                onDelete={recommendedDeck.deleteDeck}
              />

              <div className="flex items-center justify-center space-x-4 mt-16">
                {!isCreatingNew && !isOwner && (
                  <div className="text-blue-300 text-sm">
                    Viewing{" "}
                    <span className="font-semibold">
                      {userInstanceData?.userName || "another user"}'s
                    </span>{" "}
                    version (read-only)
                  </div>
                )}

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
    </>
  );
};
