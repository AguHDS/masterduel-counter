import { useState } from "react";
import { Layers } from "lucide-react";
import { SearchInput } from "@/layouts/Search";
import { SearchResults } from "./SearchResults";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import { type Archetype } from "../api/archetypeApi";

export const ArchetypeAnalyzerContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(
    null,
  );

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

    // for now we just show an alert
    alert(
      `Selected archetype: ${archetype.name}\nID: ${archetype.id}\nRegistered: ${archetype.registered}\nPending Requests: ${archetype.pending_requests}`,
    );
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      performSearch();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-2xl border border-blue-700 overflow-hidden flex flex-col min-h-[600px] relative">
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        placeholder="Search for archetypes (e.g., 'Blue-Eyes', 'Dark Magician')..."
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
                      : "Unregistered"}
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

            <p className="text-blue-300 max-w-md mx-auto">
              Archetype details will be displayed here. More features coming
              soon!
            </p>

            <button
              onClick={() => setSelectedArchetype(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Back to Search
            </button>
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
