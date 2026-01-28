import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layers, Edit3, Image, Trash2 } from "lucide-react";
import { SearchInput } from "@/layouts/Search";
import { SearchResults } from "./SearchResults";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "./CardSearchModal";
import { RegisteredArchetypesList } from "./RegisteredArchetypesList";
import { UserInstancesList } from "./UserInstancesList";
import { ArchetypeInstancesList } from "./ArchetypeInstancesList";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import { useAuth } from "@/features/auth";
import { instanceApi } from "@/lib/http/instanceApi";
import { 
  useRegisterArchetype, 
  useArchetypeWithHeader,
  useUserInstance 
} from "../hooks/useArchetypeQueries";
import type { Archetype } from "../api/archetypeApi";
import { type Card } from "../api/cardApi";

interface CardPair {
  id: string;
  topCard: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  } | null;
  bottomCard: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrlSmall: string;
  } | null;
  effectiveness?: string;
  comment?: string;
}

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
}

interface ArchetypeAnalyzerContainerProps {
  resetSearchRef?: React.MutableRefObject<(() => void) | null>;
}

export const ArchetypeAnalyzerContainer = ({ 
  resetSearchRef 
}: ArchetypeAnalyzerContainerProps = {}) => {
  const { archetypeId, userId, instanceUserId } = useParams<{ archetypeId: string; userId: string; instanceUserId: string }>();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadedPairs, setLoadedPairs] = useState<CardPair[]>([]);
  const [headerCard, setHeaderCard] = useState<HeaderCard | null>(null);
  const [isSelectingHeader, setIsSelectingHeader] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // TanStack Query hooks
  const registerMutation = useRegisterArchetype();
  
  // Parse archetypeId from URL
  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  
  // Fetch archetype data from URL parameter (not from selectedArchetype state)
  const { data: archetypeWithHeaderData } = useArchetypeWithHeader(
    archetypeIdNum
  );
  
  // Fetch user instance - ONLY if instanceUserId is specified in URL
  // This means we're viewing a specific instance, not listing all instances
  const shouldLoadInstance = archetypeIdNum && instanceUserId;
  const { data: userInstanceData } = useUserInstance(
    shouldLoadInstance ? archetypeIdNum : undefined,
    instanceUserId
  );
  
  // Check if current user owns this instance
  // If there's no instanceUserId (new archetype registration), consider user as owner
  const isOwner = isAuthenticated && (!instanceUserId || user?.id === instanceUserId);

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

  // Load card pairs and card header when a specific instance is being viewed
  useEffect(() => {
    // Reset edit mode when changing instances
    setIsEditMode(false);
    
    // Only load pairs if we're viewing a specific instance (instanceUserId is set)
    if (instanceUserId && userInstanceData) {
      const pairs: CardPair[] = userInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCard: pair.topCard,
        bottomCard: pair.bottomCard,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));
      setLoadedPairs(pairs);

      // Load header card if it exists
      if (userInstanceData.headerCard) {
        setHeaderCard({
          id: userInstanceData.headerCard.id,
          name: userInstanceData.headerCard.name,
          imageUrl: userInstanceData.headerCard.imageUrl,
        });
      } else {
        setHeaderCard(null);
      }
    } else {
      setLoadedPairs([]);
      setHeaderCard(null);
    }
  }, [instanceUserId, userInstanceData]);

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
    setIsEditMode(false);
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
    setIsEditMode(false);
    // Reset to loaded data
    if (instanceUserId && userInstanceData) {
      const pairs: CardPair[] = userInstanceData.cardPairs.map((pair) => ({
        id: pair.id.toString(),
        topCard: pair.topCard,
        bottomCard: pair.bottomCard,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));
      setLoadedPairs(pairs);
      if (userInstanceData.headerCard) {
        setHeaderCard({
          id: userInstanceData.headerCard.id,
          name: userInstanceData.headerCard.name,
          imageUrl: userInstanceData.headerCard.imageUrl,
        });
      }
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
      // Navigate back to the archetype list or main page
      navigate("/");
    } catch (error) {
      console.error("Error deleting instance:", error);
      alert("Failed to delete instance. Please try again.");
    }
  };

  // Helper to show archetype instances list
  const showArchetypeInstancesList = !userId && archetypeId && !instanceUserId && selectedArchetype?.registered;

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      alert("You must be logged in to register archetypes.");
      return;
    }
    
    // Only allow edit mode if user is the owner or it's a new registration
    if (!selectedArchetype?.registered || isOwner) {
      setIsEditMode(true);
    }
  };

  const handleHeaderCardSelected = (card: Card) => {
    setHeaderCard({
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
    });
    setIsSelectingHeader(false);
  };

  const handleSaveCards = async (pairs: CardPair[]) => {
    if (!selectedArchetype) return;

    // Validate at least one pair
    if (pairs.length === 0) {
      alert("Please add at least one card pair before saving.");
      return;
    }

    if (!headerCard) {
      alert("Please select a header card for this archetype.");
      return;
    }

    try {
      const cardPairs = pairs.map((pair) => ({
        topCardId: pair.topCard!.id,
        bottomCardId: pair.bottomCard!.id,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));

      const response = await registerMutation.mutateAsync({
        archetypeId: selectedArchetype.id,
        cardPairs,
        headerCardId: headerCard.id,
      });

      alert(response.message);
      setSelectedArchetype(response.archetype);
      setIsEditMode(false);
      
      // Navigate to the user's instance after successful registration
      if (user?.id) {
        navigate(`/archetype/${selectedArchetype.id}/instance/${user.id}`);
      }
    } catch (error) {
      console.error("Error saving archetype:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to register archetype. Please try again.",
      );
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
        {(selectedArchetype && instanceUserId) || (selectedArchetype && !selectedArchetype.registered) ? (
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {selectedArchetype.name}
                </h2>
              </div>
              
              <div className="relative">
                {headerCard ? (
                  <div className="w-48 h-auto mx-auto rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
                    <img
                      src={headerCard.imageUrl}
                      alt={headerCard.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500">
                    <Layers className="w-12 h-12 text-blue-300" />
                  </div>
                )}

                {isEditMode && (
                  <button
                    onClick={() => setIsSelectingHeader(true)}
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
                  >
                    <Image className="w-4 h-4" />
                    <span>
                      {headerCard ? "Change Header" : "Select Header"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8">
              <CardPairEditor
                isEditMode={isEditMode && isOwner}
                onSave={handleSaveCards}
                onCancel={handleCancel}
                initialPairs={loadedPairs}
              />
            </div>

            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back to Search
              </button>

              {/* Show message if viewing someone else's instance */}
              {instanceUserId && !isOwner && (
                <div className="text-blue-300 text-sm">
                  Viewing <span className="font-semibold">{userInstanceData?.userName || 'another user'}'s</span> version (read-only)
                </div>
              )}

              {/* Edit button - only show if owner of the instance */}
              {isAuthenticated &&
                selectedArchetype.registered &&
                !isEditMode &&
                instanceUserId &&
                isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Archetype</span>
                    </button>
                    <button
                      onClick={handleDeleteInstance}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Instance</span>
                    </button>
                  </>
                )}

              {/* Register button - only show for unregistered archetypes */}
              {isAuthenticated &&
                !selectedArchetype.registered &&
                !isEditMode && (
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

      {isSelectingHeader && (
        <CardSearchModal
          isOpen={true}
          onClose={() => setIsSelectingHeader(false)}
          onSelectCard={handleHeaderCardSelected}
          title="Select Header Card"
        />
      )}
    </div>
  );
};
