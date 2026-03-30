import { useCallback, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { ArchetypeInstancesGuideList } from "../components/ArchetypeGuideList";
import { useArchetypeWithHeader, useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { GuideTypeSelectionModal } from "@/shared/components/modals/GuideTypeSelectionModal";
import type { GuideType, Archetype } from "@/features/archetypes/types";

/** Page for the list of guides of the selected archetype */
export const ArchetypeGuideListPage = () => {
  const { archetypeId } = useParams<{ archetypeId: string }>();
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

  const typeParam = searchParams.get("type");
  const guideType: GuideType | undefined = 
    typeParam === "counter" ? "COUNTER" :
    typeParam === "deck" ? "DECK" :
    undefined;

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  const {
    data: archetypeWithHeaderData,
    isLoading,
    error,
  } = useArchetypeWithHeader(archetypeIdNum);

  const handleSelectInstance = useCallback(
    (instanceId: number) => {
      if (archetypeId) {
        if (typeParam) {
          navigate(`/archetype/${archetypeId}/instance/${instanceId}?type=${typeParam}`);
        } else {
          navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
        }
      }
    },
    [archetypeId, navigate, typeParam],
  );

  const handleCreateInstance = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelectGuideType = useCallback(
    (guideType: GuideType) => {
      if (archetypeId) {
        navigate(`/archetype/${archetypeId}/instance/new`, {
          state: { guideType },
        });
        setIsModalOpen(false);
      }
    },
    [archetypeId, navigate],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  }, []);

  const handleSelectArchetypeFromSearch = useCallback(
    (archetype: Archetype, guideTypeFromSearch?: 'COUNTER' | 'DECK') => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      
      // Navigate to archetype guides filtered by type
      if (guideTypeFromSearch) {
        navigate(`/archetype/${archetype.id}?type=${guideTypeFromSearch.toLowerCase()}`);
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

  return (
    <>
      <Helmet>
        <title>{archetype.name} Guides - Masterduel Counter</title>
        <meta
          name="description"
          content={`Browse and create guides for the ${archetype.name} archetype to learn how to win against them in Yu-Gi-Oh! Master Duel.`}
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        
        <div className="flex justify-center">
          <div className="scale-[0.92] origin-top">
            <MainLogo />
          </div>
        </div>

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

        <main
          className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "87.5rem" }}
          role="main"
          aria-label="Main content"
        >
          <FeatureErrorBoundary featureName="Archetype Instances">
            <ArchetypeInstancesGuideList
              archetypeId={parseInt(archetypeId!)}
              archetypeName={archetype.name}
              onSelectInstance={handleSelectInstance}
              onCreateInstance={handleCreateInstance}
              guideType={guideType}
            />
          </FeatureErrorBoundary>
        </main>
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