import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { RegisteredArchetypesList } from "../components/RegisteredArchetypesList";
import type { GuideType } from "@/features/archetypes/types";

/** Page for displaying a list of registered archetypes (with at least 1 guide instance) */
export const ArchetypesListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get guide type from query params (counter or deck)
  const typeParam = searchParams.get("type");
  const guideType: GuideType | undefined = 
    typeParam === "counter" ? "COUNTER" : 
    typeParam === "deck" ? "DECK" : 
    undefined;

  const handleSelectArchetype = (archetypeId: number) => {
    if (guideType === "COUNTER") {
      navigate(`/archetype/${archetypeId}?type=counter`);
    } else if (guideType === "DECK") {
      navigate(`/archetype/${archetypeId}?type=deck`);
    } else {
      navigate(`/archetype/${archetypeId}`);
    }
  };

  const pageTitle = guideType === "COUNTER" 
    ? "Counter Guides - Masterduel Counter"
    : guideType === "DECK"
    ? "Deck Guides - Masterduel Counter"
    : "Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guide";

  const pageDescription = guideType === "COUNTER"
    ? "Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes. Community-driven counter guides and effective plays."
    : guideType === "DECK"
    ? "Browse deck guides for Yu-Gi-Oh! Master Duel archetypes. Community-created deck builds, combo lines, and starting hands."
    : "Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel. Community-driven deck guides, card recommendations, and effective counter plays.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <RegisteredArchetypesList 
            onSelectArchetype={handleSelectArchetype}
            guideType={guideType}
          />
        </main>
        <Footer />
      </div>
    </>
  );
};
