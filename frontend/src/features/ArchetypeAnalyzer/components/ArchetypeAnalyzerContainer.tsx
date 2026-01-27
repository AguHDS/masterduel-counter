import { useState } from "react";
import { Layers, Edit3 } from "lucide-react";
import { SearchInput } from "@/layouts/Search";
import { SearchResults } from "./SearchResults";
import { CardPairEditor } from "./CardPairEditor";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import { useAuth } from "@/features/AdminAuth/hooks/useAuth";
import { confirmCards } from "../api/cardApi";
import { type Archetype } from "../api/archetypeApi";

interface CardPair {
  id: string;
  topCard: { id: number; name: string; imageUrl: string; imageUrlSmall: string } | null;
  bottomCard: { id: number; name: string; imageUrl: string; imageUrlSmall: string } | null;
}

export const ArchetypeAnalyzerContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { isAuthenticated } = useAuth();

  const { results, loading, error, performSearch } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setIsEditMode(false);
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

  const handleSaveCards = async (pairs: CardPair[]) => {
    if (!selectedArchetype) return;

    try {
      // Extraer todos los IDs de cartas para confirmarlos en el backend
      const cardIds = pairs.flatMap((pair) => {
        const ids: number[] = [];
        if (pair.topCard) ids.push(pair.topCard.id);
        if (pair.bottomCard) ids.push(pair.bottomCard.id);
        return ids;
      });

      // Confirmar cartas en Cloudinary (marcarlas como permanentes)
      await confirmCards(cardIds);

      // Aquí podrías hacer una llamada adicional para marcar el arquetipo como registrado
      // Por ahora, simplemente actualizamos el estado local
      alert("Archetype registered successfully!");
      setSelectedArchetype({ ...selectedArchetype, registered: true });
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving archetype:", error);
      throw error;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-2xl border border-blue-700 overflow-hidden flex flex-col min-h-[600px] relative">
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
              <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500">
                <Layers className="w-12 h-12 text-blue-300" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {selectedArchetype.name}
                </h2>
                <div className="inline-flex items-center space-x-4 bg-slate-800/50 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">ID:</span>
                    <span className="text-blue-300 font-mono">
                      {selectedArchetype.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={
                        selectedArchetype.registered
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {selectedArchetype.registered
                        ? "Registered"
                        : "Not registered"}
                    </span>
                  </div>
                  {selectedArchetype.pending_requests > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Requests:</span>
                      <span className="text-yellow-400">
                        {selectedArchetype.pending_requests}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setSelectedArchetype(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Back to Search
                </button>

                {isAuthenticated && !selectedArchetype.registered && !isEditMode && (
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

            {/* Card Pair Editor */}
            <div className="mt-8">
              <CardPairEditor isEditMode={isEditMode} onSave={handleSaveCards} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-blue-600">
                <Layers className="w-10 h-10 text-blue-300" />
              </div>
              <p className="text-blue-200 text-lg font-medium">
                {searchQuery
                  ? "Search for archetypes above"
                  : "Card collection will appear here"}
              </p>
              <p className="text-blue-400 text-sm">
                {searchQuery
                  ? "Select an archetype from the search results to view details"
                  : "Use the search bar above to find your favorite cards"}
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
      </div>
    </div>
  );
};
