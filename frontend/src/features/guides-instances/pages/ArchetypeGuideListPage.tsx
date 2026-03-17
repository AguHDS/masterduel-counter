import { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { ArchetypeInstancesGuideList } from "../components/ArchetypeGuideList";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { MainLogo } from "@/shared/components/MainLogo";

/** Page for the list of guides of the selected archetype */
export const ArchetypeGuideListPage = () => {
  const { archetypeId } = useParams<{ archetypeId: string }>();
  const navigate = useNavigate();

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  const {
    data: archetypeWithHeaderData,
    isLoading,
    error,
  } = useArchetypeWithHeader(archetypeIdNum);

  const handleSelectInstance = useCallback(
    (instanceId: number) => {
      if (archetypeId) {
        navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
      }
    },
    [archetypeId, navigate],
  );

  const handleCreateInstance = useCallback(() => {
    if (archetypeId) {
      navigate(`/archetype/${archetypeId}/instance/new`);
    }
  }, [archetypeId, navigate]);

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
        <MainLogo />

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
            />
          </FeatureErrorBoundary>
        </main>
        <Footer />
      </div>
    </>
  );
};