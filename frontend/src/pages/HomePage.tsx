import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";

import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";

import { RegisteredArchetypesList } from "../features/registered-archetypes";
import { FeatureErrorBoundary } from "../shared/components";
import { MainLogo } from "../shared/components/MainLogo";
import { HomeAllComponents } from "../features/home";

import { MainSearch } from "../shared/components/main-search/MainSearch";
import { MainSearchResults } from "../shared/components/main-search/MainSearchResults";

import { useArchetypeSearch } from "../features/archetypes/hooks/useArchetypes";
import type { Archetype } from "../features/archetypes/types";

export const HomePage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { results, totalResults, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetype = useCallback(
    (archetype: Archetype) => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      navigate(`/archetype/${archetype.id}`);
    },
    [navigate],
  );

  const handleInputFocus = useCallback(() => {
    if (searchQuery.trim()) {
      setIsDropdownOpen(true);
    }
  }, [searchQuery]);

  const handleRequestClose = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleSelectRegisteredArchetype = useCallback(
    (archetypeId: number) => {
      navigate(`/archetype/${archetypeId}`);
    },
    [navigate],
  );

  // Memoize the condition for showing dropdown to avoid unnecessary re-renders
  const shouldShowDropdown = useMemo(() => {
    return isDropdownOpen;
  }, [isDropdownOpen]);

  return (
    <>
      <Helmet>
        <title>Masterduel Counter - Yu-Gi-Oh! Counters and Deck Guides</title>

        <meta
          name="description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta
          name="keywords"
          content="Yu-Gi-Oh, Master Duel, archetypes, counters, deck guides, strategy, card game"
        />

        <meta
          property="og:title"
          content="Masterduel Counter - Yu-Gi-Oh! Master Duel Counters and Deck Guides"
        />
        <meta
          property="og:description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Masterduel Counter - Yu-Gi-Oh! Master Duel Counters and Deck Guides"
        />
        <meta
          name="twitter:description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them."
        />

        <link rel="canonical" href="https://masterduelcounter.com" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="scale-[0.92] origin-top">
          <MainLogo />

          {/* Main Search Section - Prominent entry point */}
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mb-9 mt-2 relative z-[100]">
            <div className="max-w-4xl mx-auto">
              <div className="relative mt-3">
                <MainSearch
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  isDropdownOpen={shouldShowDropdown}
                  onRequestClose={handleRequestClose}
                  onInputFocus={handleInputFocus}
                >
                  <MainSearchResults
                    isVisible={shouldShowDropdown}
                    results={results}
                    totalResults={totalResults}
                    loading={loading}
                    error={error ?? null}
                    onSelectArchetype={handleSelectArchetype}
                  />
                </MainSearch>
              </div>
            </div>
          </div>

          <div
            className="w-full mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "96rem" }}
          >
            <HomeAllComponents isSearchActive={shouldShowDropdown} />
          </div>

          {/* 
            Este componente RegisteredArchetypesList, esta destinado a mostrar todas las guias creadas de Counters Guides o Deck Guides.
            Al buscar y clickear un resultado tipo Counter o Deck en la MainSearch, va a mostrar RegisteredArchetypesList con las guias 
            de Counter Guides o Deck Guides dependiendo de que se haya seleccionado.

            Ahora mismo, solo existe un unico tipo de guia en mi app (revisar App.tsx).
            Hay que agregar logica para identificar si las guias conseguidas son de tipo counter guides o deck guide.
          */}

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
      </div>
    </>
  );
};