import { useCallback, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { ArchetypeInstancesGuideList } from "../components/ArchetypeGuideList";
import { useArchetypeWithHeader, useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { GuideTypeSelectionModal } from "@/shared/components/modals/GuideTypeSelectionModal";
import { useCanonicalPathRedirect } from "@/shared/hooks/useCanonicalPathRedirect";
import type { GuideType, Archetype } from "@/features/archetypes/types";
import {
  buildArchetypePath,
  buildGuideEditorPath,
  buildGuidePath,
} from "@/lib/config/urlHelpers";

/** Page for the list of guides of the selected archetype */
export const ArchetypeGuideListPage = () => {
  const { archetypeId: archetypeParam } = useParams<{ archetypeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { results, totalResults, loading, error: searchError } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  // Extract guide type from URL path segment (e.g., /archetype/rikka/counter-guides)
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

  const {
    data: archetypeWithHeaderData,
    isLoading,
    error,
  } = useArchetypeWithHeader(archetypeParam);

  const canonicalPath = archetypeWithHeaderData?.success && guideType
    ? buildArchetypePath({
        archetypeId: archetypeWithHeaderData.archetype.id,
        archetypeName: archetypeWithHeaderData.archetype.name,
        guideType,
      })
    : null;

  useCanonicalPathRedirect(canonicalPath);

  const handleSelectInstance = useCallback(
    (instanceId: number) => {
      navigate(
        buildGuidePath({
          guideId: instanceId,
          archetypeName: archetypeWithHeaderData?.archetype.name,
          guideType,
        }),
      );
    },
    [archetypeWithHeaderData?.archetype.name, guideType, navigate],
  );

  const handleCreateInstance = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelectGuideType = useCallback(
    (guideType: GuideType) => {
      // Always use the numeric archetype ID for guide editor navigation
      const archetypeId = archetypeWithHeaderData?.archetype.id;
      if (!archetypeId) {
        console.error('Cannot navigate to guide editor: archetype data not loaded');
        return;
      }
      
      navigate(buildGuideEditorPath({ archetypeId, guideType }), {
        state: { guideType },
      });
      setIsModalOpen(false);
    },
    [archetypeWithHeaderData?.archetype.id, navigate],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetypeFromSearch = useCallback(
    (archetype: Archetype, guideTypeFromSearch?: 'COUNTER' | 'DECK') => {
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

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "87.5rem" }}
            role="main"
            aria-label="Main content"
          >
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
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "87.5rem" }}
            role="main"
            aria-label="Main content"
          >
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

  const pageTitle =
    guideType === "COUNTER"
      ? `${archetype.name} - How to Counter & Handtraps | Masterduel Counter`
      : guideType === "DECK"
        ? `${archetype.name} - Best Deck Guides & Combos | Masterduel Counter`
        : `${archetype.name} Guides | Masterduel Counter`;

  const pageDescription =
    guideType === "COUNTER"
      ? `Find the best counter strategies, handtraps, and tips to stop ${archetype.name} in Yu-Gi-Oh! Master Duel.`
      : guideType === "DECK"
        ? `Discover the best ${archetype.name} deck guides, combos, and strategies for Yu-Gi-Oh! Master Duel.`
        : `Browse counter guides and deck guides for the ${archetype.name} archetype in Yu-Gi-Oh! Master Duel.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={`${window.location.origin}${canonicalPath ?? ""}`} />
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`Yu-Gi-Oh, Master Duel, ${archetype.name}, ${guideType === "COUNTER" ? "counter, handtraps, how to beat" : guideType === "DECK" ? "deck guide, combos, strategy" : "guides, counter, deck"}, archetypes`}
        />
        <meta property="og:url" content={`${window.location.origin}${canonicalPath ?? ""}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
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
                    error={searchError ?? null}
                    onSelectArchetype={handleSelectArchetypeFromSearch}
                  />
                </MainSearch>
              </div>
            </div>
          </div>

          <main className="container mx-auto px-4" role="main" aria-label="Main content">
            <FeatureErrorBoundary featureName="Archetype Instances">
              <ArchetypeInstancesGuideList
                archetypeId={archetype.id}
                archetypeName={archetype.name}
                onSelectInstance={handleSelectInstance}
                onCreateInstance={handleCreateInstance}
                guideType={guideType}
              />
            </FeatureErrorBoundary>
          </main>
        </div>

        <Footer />
      </div>

      {/* Guide Type Selection Modal */}
      <GuideTypeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectType={handleSelectGuideType}
        archetypeName={archetype.name}
      />
    </>
  );
};