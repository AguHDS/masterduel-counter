import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layers, Edit3, Image } from "lucide-react";
import { SearchInput } from "@/layouts/Search";
import { SearchResults } from "./SearchResults";
import { CardPairEditor } from "./CardPairEditor";
import { CardSearchModal } from "./CardSearchModal";
import { RegisteredArchetypesList } from "./RegisteredArchetypesList";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import { useAuth } from "@/features/AdminAuth/hooks/useAuth";
import {
  registerArchetype,
  getArchetypeCardPairs,
  getArchetypeWithHeaderCard,
  type Archetype,
} from "../api/archetypeApi";
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

export const ArchetypeAnalyzerContainer = ({ resetSearchRef }: ArchetypeAnalyzerContainerProps = {}) => {
  const { archetypeId } = useParams<{ archetypeId: string }>();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadedPairs, setLoadedPairs] = useState<CardPair[]>([]);
  const [headerCard, setHeaderCard] = useState<HeaderCard | null>(null);
  const [isSelectingHeader, setIsSelectingHeader] = useState(false);
  const { isAuthenticated } = useAuth();

  const { results, loading, error, performSearch } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  // Cargar arquetipo desde URL al montar el componente
  useEffect(() => {
    const loadArchetypeFromUrl = async () => {
      if (archetypeId) {
        try {
          const response = await getArchetypeWithHeaderCard(Number(archetypeId));
          if (response.success) {
            setSelectedArchetype(response.archetype);
          }
        } catch (error) {
          console.error("Error loading archetype from URL:", error);
        }
      } else {
        // Si no hay archetypeId en la URL, limpiar el arquetipo seleccionado
        setSelectedArchetype(null);
      }
    };

    loadArchetypeFromUrl();
  }, [archetypeId]);

  // Cargar pares de cartas y carta header cuando se selecciona un arquetipo registrado
  useEffect(() => {
    const loadArchetypeData = async () => {
      if (selectedArchetype && selectedArchetype.registered) {
        try {
          // Cargar pares de cartas
          const pairsResponse = await getArchetypeCardPairs(
            selectedArchetype.id,
          );
          const pairs: CardPair[] = pairsResponse.cardPairs.map((pair) => ({
            id: pair.id.toString(),
            topCard: {
              id: pair.top_card_id,
              name: pair.top_card_name,
              imageUrl: pair.top_card_image_url,
              imageUrlSmall: pair.top_card_image_url_small,
            },
            bottomCard: {
              id: pair.bottom_card_id,
              name: pair.bottom_card_name,
              imageUrl: pair.bottom_card_image_url,
              imageUrlSmall: pair.bottom_card_image_url_small,
            },
            effectiveness: pair.effectiveness || undefined,
            comment: pair.comment || undefined,
          }));
          setLoadedPairs(pairs);

          // Cargar carta header si existe
          if (selectedArchetype.header_card_id) {
            const headerResponse = await getArchetypeWithHeaderCard(
              selectedArchetype.id,
            );
            if (headerResponse.archetype.header_card_image_url) {
              setHeaderCard({
                id: headerResponse.archetype.header_card_id!,
                name: headerResponse.archetype.header_card_name!,
                imageUrl: headerResponse.archetype.header_card_image_url,
              });
            }
          } else {
            setHeaderCard(null);
          }
        } catch (error) {
          console.error("Error loading archetype data:", error);
          setLoadedPairs([]);
          setHeaderCard(null);
        }
      } else {
        setLoadedPairs([]);
        setHeaderCard(null);
      }
    };

    loadArchetypeData();
  }, [selectedArchetype]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  // Asignar handleResetSearch al ref para que pueda ser llamado desde fuera
  useEffect(() => {
    if (resetSearchRef) {
      resetSearchRef.current = handleResetSearch;
    }
  }, [resetSearchRef]);

  const handleSelectArchetype = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setIsEditMode(false);
    navigate(`/archetype/${archetype.id}`);
  };

  const handleSelectArchetypeFromList = async (archetypeId: number) => {
    try {
      const response = await getArchetypeWithHeaderCard(archetypeId);
      if (response.success) {
        setSelectedArchetype(response.archetype);
        setIsEditMode(false);
        navigate(`/archetype/${archetypeId}`);
      }
    } catch (error) {
      console.error("Error loading archetype:", error);
    }
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      performSearch();
    }
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      alert("You must be logged in as an admin to register archetypes.");
      return;
    }
    setIsEditMode(true);
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

    // Si no hay pares, marcar como no registrado
    if (pairs.length === 0) {
      try {
        const response = await registerArchetype(selectedArchetype.id, []);
        alert("Archetype unmarked as registered successfully");
        setSelectedArchetype(response.archetype);
        setHeaderCard(null);
        setIsEditMode(false);
      } catch (error) {
        console.error("Error unmarking archetype:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Failed to update archetype. Please try again.",
        );
      }
      return;
    }

    if (!headerCard) {
      alert("Please select a header card for this archetype.");
      return;
    }

    try {
      // Preparar los pares de cartas en el formato del backend
      const cardPairs = pairs.map((pair) => ({
        topCardId: pair.topCard!.id,
        bottomCardId: pair.bottomCard!.id,
        effectiveness: pair.effectiveness,
        comment: pair.comment,
      }));

      // Registrar el arquetipo con los pares y la carta header en el backend
      // Esto confirmará las cartas, guardará los pares, y marcará el arquetipo como registrado
      const response = await registerArchetype(
        selectedArchetype.id,
        cardPairs,
        headerCard.id,
      );

      alert(response.message);
      setSelectedArchetype(response.archetype);
      setIsEditMode(false);
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
    <div className="bg-gradient-to-br from-blue-900 to-slate-900 shadow-2xl border-t border-b border-blue-700 overflow-hidden flex flex-col min-h-[600px] relative" style={{ 
      boxShadow: '0 -20px 40px -20px rgba(0, 0, 0, 0.5), 0 20px 40px -20px rgba(0, 0, 0, 0.5)' 
    }}>
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
        {selectedArchetype ? (
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {selectedArchetype.name}
                </h2>
              </div>
              {/* Header Card Image o Ícono */}
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

                {/* Botón para seleccionar header card en modo edición */}
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

            {/* Card Pair Editor */}
            <div className="mt-8">
              <CardPairEditor
                isEditMode={isEditMode}
                onSave={handleSaveCards}
                initialPairs={loadedPairs}
              />
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => {
                  setSelectedArchetype(null);
                  navigate("/");
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back to Search
              </button>

              {isAuthenticated &&
                selectedArchetype.registered &&
                !isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Archetype</span>
                  </button>
                )}

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
            {!searchQuery ? (
              <RegisteredArchetypesList onSelectArchetype={handleSelectArchetypeFromList} />
            ) : (
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

                  {searchQuery.trim() && (
                    <button
                      onClick={handleManualSearch}
                      className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Search Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para seleccionar carta header */}
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
