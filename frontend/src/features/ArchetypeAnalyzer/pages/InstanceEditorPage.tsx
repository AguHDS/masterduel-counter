import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { ArchetypeAnalyzerContainer } from "../components/ArchetypeAnalyzerContainer";
import { useArchetypeWithHeader } from "../hooks/useArchetypeQueries";
import { SearchInput } from "@/shared/components/Search/Search";
import { SearchResults } from "@/shared/components/Search/SearchResults";
import { useArchetypeSearch } from "../hooks/useArchetypeSearch";
import type { Archetype } from "../api/archetypeApi";

export const InstanceEditorPage = () => {
  const { archetypeId } = useParams<{
    archetypeId: string;
    instanceUserId: string;
  }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  const { data: archetypeWithHeaderData, isLoading, error } = useArchetypeWithHeader(archetypeIdNum);
  const { results, loading: searchLoading, error: searchError } = useArchetypeSearch({ searchQuery, debounceDelay: 300, limit: 20 });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    navigate(`/archetype/${archetype.id}`);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-blue-300 text-lg">Loading...</div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !archetypeWithHeaderData?.success) {
    return (
      <>
        <Helmet>
          <title>Error - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-red-400 text-lg">Archetype not found</div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const archetype = archetypeWithHeaderData.archetype;

  return (
    <>
      <Helmet>
        <title>{archetype.name} - Instance Editor - Masterduel Counter</title>
        <meta name="description" content={`Create or edit your guide for the ${archetype.name} archetype in Yu-Gi-Oh! Master Duel.`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Search for archetypes to counter..."
          isDropdownOpen={isDropdownOpen && (searchLoading || searchError !== null || results.length > 0)}
          onRequestClose={() => setIsDropdownOpen(false)}
          onInputFocus={() => {
            if (searchQuery.trim()) {
              setIsDropdownOpen(true);
            }
          }}
        >
          {isDropdownOpen && (
            <SearchResults
              results={results}
              loading={searchLoading}
              error={searchError ?? null}
              onSelectArchetype={handleSelectArchetype}
            />
          )}
        </SearchInput>
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <ArchetypeAnalyzerContainer />
        </main>
        <Footer />
      </div>
    </>
  );
};
