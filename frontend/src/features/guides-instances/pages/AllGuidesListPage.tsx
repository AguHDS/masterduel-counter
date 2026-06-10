import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { AllGuidesListView } from "../components/AllGuidesList";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { ArchetypeSearchModal } from "@/shared/components/modals/ArchetypeSearchModal";
import { GuideTypeSelectionModal } from "@/shared/components/modals/GuideTypeSelectionModal";
import { useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import type { GuideType, Archetype } from "@/features/archetypes/types";
import { buildArchetypePath, buildGuideEditorPath, buildGuidePath } from "@/lib/config/urlHelpers";
import { useCanonicalPathRedirect } from "@/shared/hooks/useCanonicalPathRedirect";

/** Page that shows ALL guides of a given type (counter or deck) across all archetypes.
 * Accessed via /guides/counter-guides or /guides/deck-guides
 */
export const AllGuidesListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState<{ id: number; name: string } | null>(null);

  const { results, totalResults, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  // Extract guide type from URL path segment (e.g., /guides/counter-guides)
  // Fallback to query param for backward compatibility (will be redirected by middleware)
  const currentPath = window.location.pathname;
  const guideType: GuideType | undefined = useMemo(() => {
    if (currentPath.endsWith('/counter-guides')) {
      return "COUNTER";
    }
    if (currentPath.endsWith('/deck-guides')) {
      return "DECK";
    }
    // Fallback to legacy query param
    const typeParam = searchParams.get("type");
    if (typeParam === "counter") return "COUNTER";
    if (typeParam === "deck") return "DECK";
    return undefined;
  }, [currentPath, searchParams]);

  // Canonical path for SEO - redirects query params to path-based URLs
  const canonicalPath = guideType
    ? buildArchetypePath({ guideType })
    : null;

  useCanonicalPathRedirect(canonicalPath);

  const handleSelectInstance = useCallback(
    (instanceId: number) => {
      navigate(
        buildGuidePath({
          guideId: instanceId,
          guideType,
        }),
      );
    },
    [guideType, navigate],
  );

  const handleCreateGuide = useCallback(() => {
    setIsArchetypeModalOpen(true);
  }, []);

  const handleArchetypeSelect = useCallback(
    (archetypeId: number, archetypeName: string) => {
      setIsArchetypeModalOpen(false);
      setPendingArchetype({ id: archetypeId, name: archetypeName });
      setIsTypeModalOpen(true);
    },
    [],
  );

  const handleTypeSelect = useCallback(
    (selectedType: GuideType) => {
      if (pendingArchetype) {
        navigate(buildGuideEditorPath({
          archetypeId: pendingArchetype.id,
          guideType: selectedType,
        }), {
          state: { guideType: selectedType },
        });
        setIsTypeModalOpen(false);
        setPendingArchetype(null);
      }
    },
    [navigate, pendingArchetype],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetypeFromSearch = useCallback(
    (archetype: Archetype, guideTypeFromSearch?: "COUNTER" | "DECK") => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      navigate(
        buildArchetypePath({
          archetypeId: archetype.id,
          archetypeName: archetype.name,
          guideType: guideTypeFromSearch,
        }),
      );
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
      return "Browse all Yu-Gi-Oh! counter guides for TCG, OCG, and Master Duel. Learn how to counter popular decks with handtraps and board breakers.";
    if (guideType === "DECK")
      return "Browse all Yu-Gi-Oh! deck guides for TCG, OCG, and Master Duel. Learn combo lines, deck builds, and strategies.";
    return "Browse all Yu-Gi-Oh! community guides for all formats (TCG, OCG, Master Duel).";
  };

  // Schema.org structured data for collection pages
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": getPageTitle(),
    "description": getPageDescription(),
    "url": `${window.location.origin}${buildArchetypePath({ guideType })}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Masterduel Counter",
      "url": "https://masterduelcounter.com"
    },
    "about": {
      "@type": "Thing",
      "name": guideType === "COUNTER" ? "Yu-Gi-Oh! Counter Strategies" : guideType === "DECK" ? "Yu-Gi-Oh! Deck Building Guides" : "Yu-Gi-Oh! Guides"
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <link
          rel="canonical"
          href={`${window.location.origin}${buildArchetypePath({ guideType })}`}
        />
        <meta name="description" content={getPageDescription()} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        <meta
          name="keywords"
          content={
            guideType === "COUNTER"
              ? "Yu-Gi-Oh, TCG, OCG, Master Duel, counter guides, handtraps, how to counter, board breakers, strategy"
              : guideType === "DECK"
                ? "Yu-Gi-Oh, TCG, OCG, Master Duel, deck guides, combos, deck builds, strategy"
                : "Yu-Gi-Oh, TCG, OCG, Master Duel, archetypes, guides, counters, decks, strategy"
          }
        />
        <meta
          property="og:url"
          content={`${window.location.origin}${buildArchetypePath({ guideType })}`}
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

        <div className="flex-1 scale-[0.92] origin-top max-[1023px]:scale-100">
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

          <main className="container mx-auto px-4 max-[1023px]:px-0 max-[1023px]:max-w-full" role="main" aria-label="Main content">
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

      {/* Guide type selection modal (shown when type is not already known from URL) */}
      <GuideTypeSelectionModal
        isOpen={isTypeModalOpen}
        onClose={() => { setIsTypeModalOpen(false); setPendingArchetype(null); }}
        onSelectType={handleTypeSelect}
        archetypeName={pendingArchetype?.name ?? ""}
      />
    </>
  );
};
