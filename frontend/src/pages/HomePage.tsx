import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";
import { ArchetypeAnalyzerContainer } from "../features/ArchetypeAnalyzer/components/ArchetypeAnalyzerContainer";

export const HomePage = () => {
  const resetSearchRef = useRef<(() => void) | null>(null);

  const handleLogoClick = () => {
    if (resetSearchRef.current) {
      resetSearchRef.current();
    }
  };

  return (
    <>
      <Helmet>
        <title>Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guide</title>
        <meta name="description" content="Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes. Community-driven deck guides, card recommendations, and effective counter plays." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar onLogoClick={handleLogoClick} />

        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <ArchetypeAnalyzerContainer resetSearchRef={resetSearchRef} />
        </main>

        <Footer />
      </div>
    </>
  );
};
