import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { Navbar } from "../layouts/navbar/components/Navbar";
import { Footer } from "../layouts/Footer";
import { MainLogo } from "../shared/components/MainLogo";
import { HomeAllComponents } from "../features/home";
import { MainSearch } from "../shared/components/main-search/MainSearch";
import { MainSearchResults } from "../shared/components/main-search/MainSearchResults";
import { useArchetypeSearch } from "../features/archetypes/hooks/useArchetypes";
import type { Archetype } from "../features/archetypes/types";
import { buildArchetypePath } from "../lib/config/urlHelpers";

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
    (archetype: Archetype, guideType?: 'COUNTER' | 'DECK') => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      
      navigate(
        buildArchetypePath({
          archetypeId: archetype.id,
          archetypeName: archetype.name,
          guideType,
        }),
      );
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

  // Memoize the condition for showing dropdown to avoid unnecessary re-renders
  const shouldShowDropdown = useMemo(() => {
    return isDropdownOpen;
  }, [isDropdownOpen]);

  // Schema.org structured data for homepage with search functionality
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Masterduel Counter",
    "alternateName": "Yu-Gi-Oh! Counter and Deck Guides",
    "url": "https://masterduelcounter.com",
    "description": "Find counter strategies and deck guides for all Yu-Gi-Oh! formats (TCG, OCG, Master Duel). Community-driven guides with handtraps, combos, and strategies to beat meta decks.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://masterduelcounter.com/archetype/{search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Masterduel Counter",
      "logo": {
        "@type": "ImageObject",
        "url": "https://masterduelcounter.com/logo.webp"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Masterduel Counter - Yu-Gi-Oh! TCG, OCG & Master Duel Guides</title>

        <meta
          name="description"
          content="Find counter strategies and deck guides for all Yu-Gi-Oh! formats (TCG, OCG, Master Duel). Community-driven guides with handtraps, combos, and strategies to beat meta decks."
        />
        <meta
          name="keywords"
          content="Yu-Gi-Oh, TCG, OCG, Master Duel, archetypes, counters, deck guides, handtraps, combos, strategy"
        />

        <meta
          property="og:title"
          content="Masterduel Counter - Yu-Gi-Oh! TCG, OCG & Master Duel Guides"
        />
        <meta
          property="og:description"
          content="Find counter strategies and deck guides for all Yu-Gi-Oh! formats (TCG, OCG, Master Duel). Community-driven guides with handtraps, combos, and strategies."
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Masterduel Counter - Yu-Gi-Oh! TCG, OCG & Master Duel Guides"
        />
        <meta
          name="twitter:description"
          content="Find counter strategies and deck guides for all Yu-Gi-Oh! formats (TCG, OCG, Master Duel)."
        />

        <link rel="canonical" href="https://masterduelcounter.com" />
        
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="lg:scale-[0.92] lg:origin-top">
          <MainLogo asHeading={true} />

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

          <div className="w-full mx-auto max-[650px]:px-0 px-4 lg:px-8 lg:max-w-[96rem]">
            <HomeAllComponents isSearchActive={shouldShowDropdown} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
