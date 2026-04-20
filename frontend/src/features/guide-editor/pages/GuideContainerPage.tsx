import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { GuideContainer } from "../components/GuideContainer";
import { useArchetypeWithHeader, useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { CounterGuideHelp } from "../components/CounterGuideHelp";
import { DeckGuideHelp } from "../components/DeckGuideHelp";
import type { GuideType } from "@/features/archetypes/types";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { CommentSection } from "@/features/comments";
import type { Archetype } from "@/features/archetypes/types";
import { TooltipProvider } from "@/features/archetypes/contexts/TooltipContext";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { buildArchetypePath, buildGuidePath, extractNumericIdFromSlug } from "@/lib/config/urlHelpers";
import { useCanonicalPathRedirect } from "@/shared/hooks/useCanonicalPathRedirect";

/** Container page for guides of a specific archetype */
export const GuideContainerPage = () => {
  const { archetypeId, instanceId, guideSlug } = useParams<{
    archetypeId?: string;
    instanceId?: string;
    guideSlug?: string;
  }>();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isGuideHelpOpen, setIsGuideHelpOpen] = useState(false);
  const [guideType, setGuideType] = useState<GuideType>("COUNTER");

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { results, totalResults, loading, error: searchError } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const legacyArchetypeIdNum = archetypeId
    ? Number.parseInt(archetypeId, 10)
    : undefined;
  const isCreatingNew = instanceId === "new";

  // SEO guide URLs only need the trailing numeric id to load the guide
  const parsedInstanceId = instanceId
    ? Number.parseInt(instanceId, 10)
    : extractNumericIdFromSlug(guideSlug);
  const instanceIdNum = Number.isNaN(parsedInstanceId)
    ? undefined
    : parsedInstanceId;

  const {
    data: guideInstanceData,
    isLoading: isGuideLoading,
    error: guideError,
  } = useGetGuideInstance(
    legacyArchetypeIdNum,
    isCreatingNew ? undefined : instanceIdNum,
  );

  const archetypeIdNum =
    legacyArchetypeIdNum ?? guideInstanceData?.instance.archetypeId;

  const {
    data: archetypeWithHeaderData,
    isLoading,
    error,
  } = useArchetypeWithHeader(archetypeIdNum);


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

  // For 301 redirect of old URLs
  const canonicalGuidePath = !isCreatingNew && guideInstanceData && archetypeWithHeaderData?.success
    ? buildGuidePath({
        guideId: guideInstanceData.instance.id,
        archetypeId: guideInstanceData.instance.archetypeId,
        archetypeName: archetypeWithHeaderData.archetype.name,
        userName: guideInstanceData.userName,
        guideType: guideInstanceData.instance.guideType,
      })
    : null;

  useCanonicalPathRedirect(canonicalGuidePath, { includeSearch: true });

  const isPageLoading = !isCreatingNew && (isGuideLoading || !archetypeIdNum || isLoading);

  if (isPageLoading) {
    return (
      <>
        <Helmet>
          <title>Loading - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 mb-9"
            style={{ maxWidth: "87.5rem" }}
            role="main"
            aria-label="Main content"
          >
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-blue-300 text-lg">Loading...</div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (
    (!isCreatingNew && !guideInstanceData) ||
    guideError ||
    error ||
    !archetypeWithHeaderData?.success
  ) {
    return (
      <>
        <Helmet>
          <title>Error - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 mb-9"
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

  return (
    <>
      <Helmet>
        <title>
          {archetype.name} {guideType === "DECK" ? "Deck Guide" : "Counter Guide"} - Masterduel Counter
        </title>
        <meta
          name="description"
          content={`Read this ${guideType === "DECK" ? "deck guide" : "counter guide"} for ${archetype.name} in Yu-Gi-Oh! Master Duel.`}
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        
        <div className="scale-[0.92] origin-top">
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

          {isEditMode && (
            <div className="max-w-[98rem] mx-auto px-4 sm:px-14 lg:px-16 w-full z-20">
              <div className="flex justify-center">
                <button
                  onClick={() => setIsGuideHelpOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-tr from-blue-900/80 via-blue-700/20 to-blue-800/50 hover:bg-blue-700/20 active:bg-blue-900/10 border border-blue-800/40 text-white"
                  title="Guide Help"
                >
                  <AlertCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">
                    {guideType === "COUNTER" 
                      ? "How to correctly create a counter guide"
                      : "How to correctly create a deck guide"}
                  </span>
                </button>
              </div>
            </div>
          )}

          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 mb-9"
            style={{ maxWidth: "93%" }}
            role="main"
            aria-label="Main content"
          >
            <FeatureErrorBoundary featureName="Instance Editor">
              <TooltipProvider>
                <GuideContainer 
                  onEditModeChange={setIsEditMode}
                  onGuideTypeChange={setGuideType}
                />
              </TooltipProvider>
            </FeatureErrorBoundary>
          </main>

          {instanceIdNum && (
            <div className="max-w-[84rem] mx-auto px-4 sm:px-14 lg:px-16 w-full mb-12">
              <CommentSection
                instanceId={instanceIdNum}
                title={"Comments"}
                maxHeight="600px"
              />
            </div>
          )}
        </div>
        <Footer />
      </div>

      {guideType === "COUNTER" ? (
        <CounterGuideHelp
          isOpen={isGuideHelpOpen}
          onClose={() => setIsGuideHelpOpen(false)}
        />
      ) : (
        <DeckGuideHelp
          isOpen={isGuideHelpOpen}
          onClose={() => setIsGuideHelpOpen(false)}
        />
      )}
    </>
  );
};
