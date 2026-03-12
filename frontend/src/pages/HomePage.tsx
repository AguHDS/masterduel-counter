import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";
import { RegisteredArchetypesList } from "../features/archetypesList";
import { SearchInput } from "../shared/components/Search/Search";
import { SearchResults } from "../shared/components/Search/SearchResults";
import { useArchetypeSearch } from "../features/ArchetypeAnalyzer/hooks/useArchetypeSearch";
import { FeatureErrorBoundary } from "../shared/components";
import { MainLogo } from "../shared/components/MainLogo";
import { HomeStatsSection } from "../features/home";
import type { Archetype } from "../features/ArchetypeAnalyzer/api/archetypeApi";

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { results, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    navigate(`/archetype/${archetype.id}`);
  };

  const handleSelectRegisteredArchetype = (archetypeId: number) => {
    navigate(`/archetype/${archetypeId}`);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  return (
    <>
      <Helmet>
        <title>
          Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guides
        </title>
        <meta
          name="description"
          content="Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta
          name="keywords"
          content="Yu-Gi-Oh, Master Duel, archetypes, counters, deck guides, strategy, card game"
        />
        <meta property="og:title" content="Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guides" />
        <meta
          property="og:description"
          content="Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guides" />
        <meta
          name="twitter:description"
          content="Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes and learn how to win against them."
        />
        <link rel="canonical" href="https://masterduelcounter.com" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />

        <MainLogo />

        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isDropdownOpen={
            isDropdownOpen && (loading || error !== null || results.length > 0)
          }
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
              loading={loading}
              error={error ?? null}
              onSelectArchetype={handleSelectArchetype}
            />
          )}
        </SearchInput>

        <div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "87.5rem" }}
        >
          <HomeStatsSection />
        </div>

        <main
          className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-3"
          style={{ maxWidth: "87.5rem" }}
          role="main"
          aria-label="Main content"
        >
          <FeatureErrorBoundary featureName="Archetypes List">
            <RegisteredArchetypesList
              onSelectArchetype={handleSelectRegisteredArchetype}
            />
          </FeatureErrorBoundary>
        </main>
        <Footer />
      </div>
    </>
  );
};