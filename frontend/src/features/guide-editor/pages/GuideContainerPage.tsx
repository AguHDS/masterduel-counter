import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { GuideContainer } from "../components/GuideContainer";
import { useArchetypeWithHeader, useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { CounterGuideHelp } from "../components/counter-guides/CounterGuideHelp";
import { DeckGuideHelp } from "../components/deck-guides/DeckGuideHelp";
import type { GuideType } from "@/features/archetypes/types";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { CommentSection } from "@/features/comments";
import type { Archetype } from "@/features/archetypes/types";
import { TooltipProvider } from "@/features/archetypes/contexts/TooltipContext";
import { useGetGuideInstance } from "../hooks/useArchetypeQueries";
import { buildArchetypePath, buildGuidePath, extractNumericIdFromSlug, slugifySegment } from "@/lib/config/urlHelpers";
import { useCanonicalPathRedirect } from "@/shared/hooks/useCanonicalPathRedirect";

/** Container page for guides of a specific archetype */
export const GuideContainerPage = () => {
  const { archetypeId, instanceId, guideSlug } = useParams<{
    archetypeId?: string;
    instanceId?: string;
    guideSlug?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isGuideHelpOpen, setIsGuideHelpOpen] = useState(false);
  
  // Extract guideType from location state (for new guides) or search params (backward compatibility)
  const stateGuideType = (location.state as { guideType?: GuideType })?.guideType;
  const searchParams = new URLSearchParams(location.search);
  const queryGuideType = searchParams.get("type");
  const initialGuideType: GuideType = 
    stateGuideType ||
    (queryGuideType === "deck" ? "DECK" : queryGuideType === "counter" ? "COUNTER" : "COUNTER");
  
  const [guideType, setGuideType] = useState<GuideType>(initialGuideType);

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
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 mb-9 lg:max-w-[87.5rem]"
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
    (!archetypeWithHeaderData && !isLoading) ||
    (archetypeWithHeaderData && !archetypeWithHeaderData.success)
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

  if (!archetypeWithHeaderData) {
    return null;
  }
  const archetype = archetypeWithHeaderData.archetype;
  const currentGuideTitle = guideInstanceData?.instance.title?.trim();
  const currentGuideType = guideInstanceData?.instance.guideType ?? guideType;
  const pageTitle = currentGuideTitle
    ? `${currentGuideTitle} | ${archetype.name} ${currentGuideType === "DECK" ? "Deck Guide" : "Counter Guide"} - Masterduel Counter`
    : `${archetype.name} ${currentGuideType === "DECK" ? "Deck Guide" : "Counter Guide"} - Masterduel Counter`;
  const pageDescription = currentGuideTitle
    ? `Read ${currentGuideTitle}, a ${currentGuideType === "DECK" ? "deck guide" : "counter guide"} for ${archetype.name} in Yu-Gi-Oh! (TCG, OCG, Master Duel).`
    : `Read this ${currentGuideType === "DECK" ? "deck guide" : "counter guide"} for ${archetype.name} in Yu-Gi-Oh! (TCG, OCG, Master Duel).`;
  const canonicalUrl = `${window.location.origin}${canonicalGuidePath ?? location.pathname}`;

  // Schema.org structured data for rich snippets
  const authorProfileUrl = guideInstanceData?.instance.userId && guideInstanceData?.userName
    ? `${window.location.origin}/profile/${slugifySegment(guideInstanceData.userName)}-${guideInstanceData.instance.userId}`
    : undefined;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": currentGuideTitle || `${archetype.name} ${currentGuideType === "DECK" ? "Deck Guide" : "Counter Guide"}`,
    "description": pageDescription,
    "image": guideInstanceData?.headerCard?.imageUrlCropped || guideInstanceData?.headerCard?.imageUrl || `${window.location.origin}/logo.png`,
    "author": {
      "@type": "Person",
      "name": guideInstanceData?.userName || "Anonymous",
      ...(authorProfileUrl && { "url": authorProfileUrl })
    },
    "publisher": {
      "@type": "Organization",
      "name": "Masterduel Counter",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.webp`
      }
    },
    "datePublished": guideInstanceData?.instance.createdAt,
    "dateModified": guideInstanceData?.instance.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    ...(guideInstanceData?.instance?.likes && guideInstanceData.instance.likes > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "bestRating": "5",
        "ratingCount": guideInstanceData.instance.likes.toString()
      }
    })
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        
        <div className="lg:origin-top xl:scale-[0.92]">
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
            <div className="lg:max-w-[98rem] mx-auto px-4 sm:px-14 lg:px-16 w-full z-20">
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
            className="flex-1 w-full mx-auto max-[1023px]:px-0 px-0 xl:px-4 mb-9 min-[1300px]:max-w-[93%] min-[1024px]:max-[1250px]:max-w-full min-[1300px]:max-[1600px]:max-w-full"
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
            <div className="lg:max-w-[84rem] mx-auto px-4 sm:px-14 lg:px-16 w-full mb-12">
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
