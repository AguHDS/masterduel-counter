import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Trash2, ThumbsUp } from "lucide-react";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "./CardSearchModal";
import { InstanceHeader } from "./InstanceHeader";
import { useInstanceEditor } from "../hooks/useInstanceEditor";
import { useInstanceLikes } from "../hooks/useInstanceLikes";
import { useInstanceData } from "../hooks/useInstanceData";
import { useAuth } from "@/features/auth";
import { instanceApi } from "@/lib/http/instanceApi";
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
  }>;
  bottomCards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  }>;
  effectiveness?: string;
  comment?: string;
}

export const ArchetypeAnalyzerContainer = () => {
  const { archetypeId, instanceUserId } = useParams<{
    archetypeId: string;
    instanceUserId: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Custom hooks
  const editor = useInstanceEditor();
  const registerMutation = useRegisterArchetype();

  // Parse archetypeId from URL
  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;

  // Fetch archetype data from URL parameter
  const { data: archetypeWithHeaderData } =
    useArchetypeWithHeader(archetypeIdNum);

  // Fetch user instance
  const { data: userInstanceData, isError } = useUserInstance(
    archetypeIdNum,
    instanceUserId,
  );

  // Check if current user owns this instance
  const isOwner =
    isAuthenticated && (!instanceUserId || user?.id === instanceUserId);

  const selectedArchetype = archetypeWithHeaderData?.archetype;

  // Likes management
  const likes = useInstanceLikes({
    isAuthenticated,
    archetypeId,
    instanceId: userInstanceData?.instance.id,
  });

  // Load instance data
  useInstanceData({
    instanceUserId,
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

      // Load like status if authenticated and not owner
      if (isAuthenticated && !isOwner) {
        likes.loadLikeStatus();
      } else {
        likes.setLiked(false);
      }
    },
    onNewInstance: () => {
      // New instance: activate edit mode automatically
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
    // Reset to loaded data
    if (instanceUserId && userInstanceData) {
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
    } else {
      // If it's a new registration, go back
      navigate(-1);
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedArchetype || !user?.id || !archetypeId) return;

    const confirmed = confirm(
      "Are you sure you want to delete your instance? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await instanceApi.deleteUserInstance(parseInt(archetypeId), user.id);
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

    // Only allow edit mode if user is the owner or it's a new registration
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

      await registerMutation.mutateAsync({
        archetypeId: selectedArchetype.id,
        cardPairs,
        title: editor.title.trim(),
        headerCardId: editor.headerCard!.id,
        generalTip: editor.generalTip || undefined,
      });

      editor.setIsEditMode(false);

      // Reload to show fresh data
      if (user?.id) {
        window.location.href = `/archetype/${selectedArchetype.id}/instance/${user.id}`;
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

  return (
    <>
      <section className="w-full relative bottom-5 flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[1120px] rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative flex flex-col w-full min-h-[600px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#030717] via-[#0a0f2c] to-[#1a1743] py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
            <div className="space-y-6">
              {instanceUserId &&
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

              <div className="flex items-center justify-center space-x-4 mt-16">
                {instanceUserId && !isOwner && (
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
                  instanceUserId &&
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
