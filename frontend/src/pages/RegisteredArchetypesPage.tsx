import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";
import { RegisteredArchetypesList } from "../features/registered-archetypes";
import { FeatureErrorBoundary } from "../shared/components";
import type { GuideType } from "@/features/archetypes/types";

/**
 * Page that displays the list of registered archetypes filtered by guide type
 * Accessed via /archetypes?type=counter or /archetypes?type=deck
 */
export const RegisteredArchetypesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const typeParam = searchParams.get("type");
  const guideType: GuideType | undefined = 
    typeParam === "counter" ? "COUNTER" :
    typeParam === "deck" ? "DECK" :
    undefined;

  const handleSelectArchetype = (archetypeId: number) => {
    // Navigate to archetype guide list with the same type filter
    if (guideType) {
      navigate(`/archetype/${archetypeId}?type=${typeParam}`);
    } else {
      navigate(`/archetype/${archetypeId}`);
    }
  };

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
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <FeatureErrorBoundary featureName="RegisteredArchetypesList">
            <RegisteredArchetypesList 
              onSelectArchetype={handleSelectArchetype}
              guideType={guideType}
            />
          </FeatureErrorBoundary>
        </main>

        <Footer />
      </div>
    </>
  );
};
