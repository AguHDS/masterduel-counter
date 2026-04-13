import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { AllGuidesListView } from "../components/AllGuidesList";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { ArchetypeSearchModal } from "@/shared/components/modals/ArchetypeSearchModal";
import { useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import type { GuideType, Archetype } from "@/features/archetypes/types";

/** Page that shows ALL guides of a given type (counter or deck) across all archetypes.
 * Accessed via /guides?type=counter or /guides?type=deck
 */
export const AllGuidesListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);

  const { results, totalResults, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const typeParam = searchParams.get("type");
  const guideType: GuideType | undefined =
    typeParam === "counter" ? "COUNTER" : typeParam === "deck" ? "DECK" : undefined;

  const handleSelectInstance = useCallback(
    (instanceId: number, archetypeId: number) => {
      if (typeParam) {
        navigate(`/archetype/${archetypeId}/instance/${instanceId}?type=${typeParam}`);
      } else {
        navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
      }
    },
    [navigate, typeParam],
  );

  const handleCreateGuide = useCallback(() => {
    setIsArchetypeModalOpen(true);
  }, []);

  const handleArchetypeSelect = useCallback(
    (archetypeId: number) => {
      setIsArchetypeModalOpen(false);
      navigate(`/archetype/${archetypeId}/instance/new`, {
        state: { guideType: guideType ?? "COUNTER" },
      });
    },
    [navigate, guideType],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetypeFromSearch = useCallback(
    (archetype: Archetype, guideTypeFromSearch?: "COUNTER" | "DECK") => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      if (guideTypeFromSearch) {
        navigate(`/archetype/${archetype.id}?type=${guideTypeFromSearch.toLowerCase()}`);
      } else {
        navigate(`/archetype/${archetype.id}`);
      }
    },
    [navigate],
  );

  const handleInputFocus = useCallback(() => {
    if (searchQuery.trim()) setIsDropdownOpen(true);
  }, [searchQuery]);

  const handleRequestClose = useCallback(() => setIsDropdownOpen(false), []);

  const shouldShowDropdown = useMemo(() => isDropdownOpen, [isDropdownOpen]);

  const getPageTitle = () => {
    if (guideType === "COUNTER") return "Counter Guides - Masterduel Counter";
    if (guideType === "DECK") return "Deck Guides - Masterduel Counter";
    return "Guides - Masterduel Counter";
  };

  const getPageDescription = () => {
    if (guideType === "COUNTER")
      return "Browse all Yu-Gi-Oh! Master Duel counter guides. Learn how to counter popular decks with handtraps and board breakers.";
    if (guideType === "DECK")
      return "Browse all Yu-Gi-Oh! Master Duel deck guides. Learn combo lines, deck builds, and strategies.";
    return "Browse all Yu-Gi-Oh! Master Duel community guides.";
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

      <div className="min-h-screen flex flex-col">
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
            <FeatureErrorBoundary featureName="AllGuidesList">
              <AllGuidesListView
                onSelectInstance={handleSelectInstance}
                onCreateGuide={handleCreateGuide}
                guideType={guideType}
              />
            </FeatureErrorBoundary>
          </main>
        </div>

        <Footer />
      </div>

      {/* Archetype selection modal for guide creation */}
      <ArchetypeSearchModal
        isOpen={isArchetypeModalOpen}
        onClose={() => setIsArchetypeModalOpen(false)}
        onSelectArchetype={handleArchetypeSelect}
        centered
      />
    </>
  );
};
