import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { GuideContainer } from "../components/GuideContainer";
import { useArchetypeWithHeader } from "@/features/archetypes/hooks/useArchetypes";
import { FeatureErrorBoundary } from "@/shared/components";
import { GuideModalHelp } from "../components/GuideModalHelp";
import { MainLogo } from "@/shared/components/MainLogo";
import { CommentSection } from "@/features/comments";

/** Page for creating or editing a guide for a specific archetype instance */
export const InstanceEditorPage = () => {
  const { archetypeId, instanceId } = useParams<{
    archetypeId: string;
    instanceId: string;
  }>();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isGuideHelpOpen, setIsGuideHelpOpen] = useState(false);

  const archetypeIdNum = archetypeId ? parseInt(archetypeId) : undefined;
  const instanceIdNum = instanceId ? parseInt(instanceId) : undefined;

  const {
    data: archetypeWithHeaderData,
    isLoading,
    error,
  } = useArchetypeWithHeader(archetypeIdNum);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
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

  if (error || !archetypeWithHeaderData?.success) {
    return (
      <>
        <Helmet>
          <title>Error - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b flex flex-col">
          <Navbar />
          <main
            className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
        <title>{archetype.name} Guide - Masterduel Counter</title>
        <meta
          name="description"
          content={`Create or edit your counter guide for the ${archetype.name} archetype in Yu-Gi-Oh! Master Duel.`}
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        <MainLogo />

        {isEditMode && (
          <div className="max-w-[84rem] mx-auto px-4 sm:px-14 lg:px-16 w-full z-20">
            <div className="flex justify-end">
              <button
                onClick={() => setIsGuideHelpOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-tr from-blue-900/80 via-blue-700/20 to-blue-800/50 hover:bg-blue-700/20 active:bg-blue-900/10 border border-blue-800/40 text-white"
                title="Guide Help"
              >
                <AlertCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm">
                  How to create a guide correctly?
                </span>
              </button>
            </div>
          </div>
        )}

        <main
          className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
          style={{ maxWidth: "87.5rem" }}
          role="main"
          aria-label="Main content"
        >
          <FeatureErrorBoundary featureName="Instance Editor">
            <GuideContainer onEditModeChange={setIsEditMode} />
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
        <Footer />
      </div>

      <GuideModalHelp
        isOpen={isGuideHelpOpen}
        onClose={() => setIsGuideHelpOpen(false)}
      />
    </>
  );
};
