import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layers, Edit3, Trash2, ThumbsUp } from "lucide-react";
import { SearchInput } from "@/layouts/Search";
import { SearchResults } from "./SearchResults";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "./CardSearchModal";
import { RegisteredArchetypesList } from "./RegisteredArchetypesList";
import { UserInstancesList } from "@/features/profile/components/UserInstancesList";
import { ArchetypeInstancesList } from "./ArchetypeInstancesList";
import { InstanceHeader } from "./InstanceHeader";
import { EmptyArchetypeView } from "./EmptyArchetypeView";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import { useInstanceEditor } from "../hooks/useInstanceEditor";
import { useInstanceLikes } from "../hooks/useInstanceLikes";
import { useInstanceData } from "../hooks/useInstanceData";
import { useAuth } from "@/features/auth";
import { instanceApi } from "@/lib/http/instanceApi";
import { 
  useRegisterArchetype, 
  useArchetypeWithHeader,
  useUserInstance 
} from "../hooks/useArchetypeQueries";
import { validateInstanceData, transformPairsForApi } from "../utils/validation";
import type { Archetype } from "../api/archetypeApi";

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

interface ArchetypeAnalyzerContainerProps {
  resetSearchRef?: React.MutableRefObject<(() => void) | null>;
}

export const ArchetypeAnalyzerContainer = ({ 
  resetSearchRef 
}: ArchetypeAnalyzerContainerProps = {}) => {
  const { archetypeId, userId, instanceUserId } = useParams<{ archetypeId: string; userId: string; instanceUserId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);

  // Custom hooks
  const editor = useInstanceEditor();
  const registerMutation = useRegisterArchetype();
  
  // Parse archetypeId from URL
  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  
  // Fetch archetype data from URL parameter
  const { data: archetypeWithHeaderData } = useArchetypeWithHeader(archetypeIdNum);
  
  // Fetch user instance - ONLY if instanceUserId is specified in URL
  const shouldLoadInstance = archetypeIdNum && instanceUserId;
  const { data: userInstanceData, isError } = useUserInstance(
    shouldLoadInstance ? archetypeIdNum : undefined,
    instanceUserId
  );
  
  // Check if current user owns this instance
  const isOwner = isAuthenticated && (!instanceUserId || user?.id === instanceUserId);

  // Likes management
  const likes = useInstanceLikes({
    isAuthenticated,
    archetypeId,
    instanceId: userInstanceData?.instance.id,
  });

  const { results, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  // Load archetype from URL when mounting component
  useEffect(() => {
    if (archetypeId && archetypeWithHeaderData?.success) {
      setSelectedArchetype(archetypeWithHeaderData.archetype);
    } else if (!archetypeId) {
      setSelectedArchetype(null);
    }
  }, [archetypeId, archetypeWithHeaderData]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  // Assign handleResetSearch to ref so it can be called from outside
  useEffect(() => {
    if (resetSearchRef) {
      resetSearchRef.current = handleResetSearch;
    }
  }, [resetSearchRef]);

  const handleSelectArchetype = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    editor.setIsEditMode(false);
    setSearchQuery(""); // Clear search when selecting archetype
    navigate(`/archetype/${archetype.id}`);
  };

  const handleSelectArchetypeFromList = (archetypeId: number, userId: string | null) => {
    // Navigate to specific user's instance if userId provided
    if (userId) {
      navigate(`/archetype/${archetypeId}/instance/${userId}`);
    } else {
      navigate(`/archetype/${archetypeId}`);
    }
  };

  const handleSelectInstanceFromArchetype = (userId: string) => {
    // Navigate to specific instance
    if (selectedArchetype) {
      navigate(`/archetype/${selectedArchetype.id}/instance/${userId}`);
    }
  };

  const handleCreateInstance = () => {
    // Navigate to the user's own instance to create/edit it
    if (user?.id && archetypeId) {
      navigate(`/archetype/${archetypeId}/instance/${user.id}`);
    }
  };
  
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
      "Are you sure you want to delete your instance? This action cannot be undone."
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

  const showArchetypeInstancesList = !userId && archetypeId && !instanceUserId && selectedArchetype?.registered;

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

    const validation = validateInstanceData(pairs, editor.headerCard, editor.title);
    
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    try {
      const cardPairs = transformPairsForApi(pairs);

      const response = await registerMutation.mutateAsync({
        archetypeId: selectedArchetype.id,
        cardPairs,
        title: editor.title.trim(),
        headerCardId: editor.headerCard!.id,
        generalTip: editor.generalTip || undefined,
      });

      setSelectedArchetype(response.archetype);
      editor.setIsEditMode(false);
      
      // Reload to show fresh data
      if (user?.id) {
        window.location.href = `/archetype/${selectedArchetype.id}/instance/${user.id}`;
      }
    } catch (error) {
      console.error("Error saving archetype:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to register archetype. Please try again.";
      alert(errorMessage);
      throw error;
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-blue-900 to-slate-900 shadow-2xl border-t border-b border-blue-700 overflow-hidden flex flex-col min-h-[600px] relative" 
      style={{ 
        boxShadow: '0 -20px 40px -20px rgba(0, 0, 0, 0.5), 0 20px 40px -20px rgba(0, 0, 0, 0.5)' 
      }}
    >
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        placeholder="Search for archetypes to learn how to counter them"
        showResults={true}
      >
        <SearchResults
          results={results}
          loading={loading}
          error={error}
          onSelectArchetype={handleSelectArchetype}
        />
      </SearchInput>

      <div className="flex-1 p-8 overflow-auto">
        {/* Show message for unregistered archetypes with no instance */}
        {selectedArchetype && !selectedArchetype.registered && !instanceUserId ? (
          <EmptyArchetypeView
            archetypeName={selectedArchetype.name}
            isAuthenticated={isAuthenticated}
            onCreateInstance={handleCreateInstance}
          />
        ) : (selectedArchetype && instanceUserId && (userInstanceData || isOwner)) || (selectedArchetype && !selectedArchetype.registered && instanceUserId) ? (
          <div className="space-y-6">
            {instanceUserId && !isOwner && isAuthenticated && selectedArchetype.registered && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={likes.toggleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
                    likes.liked 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${likes.liked ? 'fill-current' : ''}`} />
                  <span>{likes.likeCount}</span>
                </button>
              </div>
            )}

            {/* Header Section */}
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
            {/* Separator */}
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
              {/* Show message if viewing someone else's instance */}
              {instanceUserId && !isOwner && (
                <div className="text-blue-300 text-sm">
                  Viewing <span className="font-semibold">{userInstanceData?.userName || 'another user'}'s</span> version (read-only)
                </div>
              )}

              {/* Edit button - only show if owner of the instance */}
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

              {/* Register button - only show for unregistered archetypes */}
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
        ) : (
          <>
            {!searchQuery && (
              <>
                {userId && (
                  <UserInstancesList 
                    userId={userId} 
                    onSelectArchetype={(archetypeId, instanceUserId) => handleSelectArchetypeFromList(archetypeId, instanceUserId)} 
                  />
                )}
                
                {showArchetypeInstancesList && selectedArchetype && (
                  <ArchetypeInstancesList
                    archetypeId={parseInt(archetypeId!)}
                    archetypeName={(selectedArchetype as Archetype).name}
                    onSelectInstance={handleSelectInstanceFromArchetype}
                    onCreateInstance={handleCreateInstance}
                  />
                )}
                
                {!userId && !archetypeId && (
                  <RegisteredArchetypesList onSelectArchetype={handleSelectArchetypeFromList} />
                )}
              </>
            )}
            
            {searchQuery && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-blue-600">
                    <Layers className="w-10 h-10 text-blue-300" />
                  </div>
                  <p className="text-blue-200 text-lg font-medium">
                    Search for archetypes above
                  </p>
                  <p className="text-blue-400 text-sm">
                    Select an archetype from the search results to view details
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editor.isSelectingHeader && (
        <CardSearchModal
          isOpen={true}
          onClose={() => editor.setIsSelectingHeader(false)}
          onSelectCard={editor.handleHeaderCardSelected}
          title="Select Header Card"
        />
      )}
    </div>
  );
};
