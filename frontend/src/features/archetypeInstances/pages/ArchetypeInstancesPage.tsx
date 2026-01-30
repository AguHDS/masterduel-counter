import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { ArchetypeInstancesList } from "../components/ArchetypeInstancesList";
import { useArchetypeWithHeader } from "@/features/ArchetypeAnalyzer/hooks/useArchetypeQueries";
import { useArchetypeSearch } from "@/features/ArchetypeAnalyzer/hooks/useArchetypeSearch";
import { useAuth } from "@/features/auth";
import { SearchInput } from "@/shared/components/Search/Search";
import { SearchResults } from "@/shared/components/Search/SearchResults";
import type { Archetype } from "@/features/ArchetypeAnalyzer/api/archetypeApi";

export const ArchetypeInstancesPage = () => {
  const { archetypeId } = useParams<{ archetypeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  const { data: archetypeWithHeaderData, isLoading, error } = useArchetypeWithHeader(archetypeIdNum);
  const { results, loading: searchLoading, error: searchError } = useArchetypeSearch({ searchQuery, debounceDelay: 300, limit: 20 });

  const handleSelectInstance = (instanceId: number) => {
    if (archetypeId) {
      navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
    }
  };

  const handleCreateInstance = () => {
    if (archetypeId) {
      navigate(`/archetype/${archetypeId}/instance/new`);
    }
  };

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
              <div className="text-blue-300 text-lg">Loading archetype...</div>
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

  // Si el arquetipo no está registrado, redirigir a crear instancia si está autenticado
  if (!archetype.registered && isAuthenticated) {
    navigate(`/archetype/${archetypeId}/instance/new`, { replace: true });
    return null;
  }

  // Si no está registrado y no está autenticado, mostrar mensaje
  if (!archetype.registered) {
    return (
      <>
        <Helmet>
          <title>{archetype.name} - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-blue-300 text-lg">
                This archetype is not registered yet. Please sign in to create the first guide.
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{archetype.name} Guides - Masterduel Counter</title>
        <meta name="description" content={`Browse and create guides for the ${archetype.name} archetype in Yu-Gi-Oh! Master Duel.`} />
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
          <ArchetypeInstancesList
            archetypeId={parseInt(archetypeId!)}
            archetypeName={archetype.name}
            onSelectInstance={handleSelectInstance}
            onCreateInstance={handleCreateInstance}
          />
        </main>
        <Footer />
      </div>
    </>
  );
};
