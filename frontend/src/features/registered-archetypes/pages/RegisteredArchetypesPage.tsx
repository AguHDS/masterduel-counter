import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { RegisteredArchetypesList } from "..";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import type { GuideType, Archetype } from "@/features/archetypes/types";

/**
 * Page that displays the list of registered archetypes filtered by guide type
 * Accessed via /archetypes?type=counter or /archetypes?type=deck
 */
export const RegisteredArchetypesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { results, totalResults, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const typeParam = searchParams.get("type");
  const guideType: GuideType | undefined =
    typeParam === "counter"
      ? "COUNTER"
      : typeParam === "deck"
        ? "DECK"
        : undefined;

  const handleSelectArchetype = (archetypeId: number) => {
    // Navigate to archetype guide list with the same type filter
    if (guideType) {
      navigate(`/archetype/${archetypeId}?type=${typeParam}`);
    } else {
      navigate(`/archetype/${archetypeId}`);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetypeFromSearch = useCallback(
    (archetype: Archetype, guideTypeFromSearch?: "COUNTER" | "DECK") => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      
      // Navigate to archetype guides filtered by type
      if (guideTypeFromSearch) {
        navigate(
          `/archetype/${archetype.id}?type=${guideTypeFromSearch.toLowerCase()}`,
        );
      } else {
        navigate(`/archetype/${archetype.id}`);
      }
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

  const shouldShowDropdown = useMemo(() => {
    return isDropdownOpen;
  }, [isDropdownOpen]);

  const getPageTitle = () => {
    if (guideType === "COUNTER") return "Counter Guides - Masterduel Counter";
    if (guideType === "DECK") return "Deck Guides - Masterduel Counter";
    return "Registered Archetypes - Masterduel Counter";
  };

  const getPageDescription = () => {
    if (guideType === "COUNTER")
      return "Browse all Yu-Gi-Oh! Master Duel archetypes with counter guides. Learn how to counter popular decks with handtraps and board breakers.";
    if (guideType === "DECK")
      return "Browse all Yu-Gi-Oh! Master Duel archetypes with deck guides. Learn combo lines, deck builds, and strategies.";
    return "Browse all registered Yu-Gi-Oh! Master Duel archetypes with community guides.";
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta
          name="keywords"
          content="Yu-Gi-Oh, Master Duel, archetypes, guides, counters, decks, strategy"
        />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Navbar />

        <div className="flex-1 scale-[0.92] origin-top">
          <MainLogo />

          {/* Main Search Section */}
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
                    onSelectArchetype={handleSelectArchetypeFromSearch}
                  />
                </MainSearch>
              </div>
            </div>
          </div>

          <main className="container mx-auto px-4">
            <FeatureErrorBoundary featureName="RegisteredArchetypesList">
              <RegisteredArchetypesList
                onSelectArchetype={handleSelectArchetype}
                guideType={guideType}
              />
            </FeatureErrorBoundary>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};
