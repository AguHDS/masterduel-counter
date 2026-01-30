import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { RegisteredArchetypesList } from "../components/RegisteredArchetypesList";

export const ArchetypesListPage = () => {
  const navigate = useNavigate();

  const handleSelectArchetype = (archetypeId: number) => {
    navigate(`/archetype/${archetypeId}`);
  };

  return (
    <>
      <Helmet>
        <title>Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guide</title>
        <meta name="description" content="Find the best counter strategies for Yu-Gi-Oh! Master Duel archetypes. Community-driven deck guides, card recommendations, and effective counter plays." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <RegisteredArchetypesList onSelectArchetype={handleSelectArchetype} />
        </main>
        <Footer />
      </div>
    </>
  );
};
