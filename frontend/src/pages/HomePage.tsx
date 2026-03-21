import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";
import { RegisteredArchetypesList } from "../features/registered-archetypes";
import { FeatureErrorBoundary } from "../shared/components";
import { MainLogo } from "../shared/components/MainLogo";
import { HomeAllComponents } from "../features/home";

export const HomePage = () => {
  const navigate = useNavigate();

  const handleSelectRegisteredArchetype = (archetypeId: number) => {
    navigate(`/archetype/${archetypeId}`);
  };

  return (
    <>
      <Helmet>
        <title>
          Masterduel Counter - Yu-Gi-Oh! Counters and Deck Guides
        </title>
        <meta
          name="description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta
          name="keywords"
          content="Yu-Gi-Oh, Master Duel, archetypes, counters, deck guides, strategy, card game"
        />
        <meta property="og:title" content="Masterduel Counter - Yu-Gi-Oh! Master Duel Counters and Deck Guides" />
        <meta
          property="og:description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them. Community-driven deck guides, card recommendations, and effective counter plays."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Masterduel Counter - Yu-Gi-Oh! Master Duel Counters and Deck Guides" />
        <meta
          name="twitter:description"
          content="Find the best counter strategies and deck guides for Yu-Gi-Oh! Master Duel, and learn how to win against them."
        />
        <link rel="canonical" href="https://masterduelcounter.com" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />

        <MainLogo />

        <div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "92rem" }}
        >
          <HomeAllComponents />
        </div>

        {/* Este componente RegisteredArchetypesList, esta destinado a mostrar todas las guias creadas de Counters Guides o Deck Guides.
        Al buscar y clickear un resultado tipo Counter o Deck en la MainSearch, va a mostrar RegisteredArchetypesList con las guias
        de Counter Guides o Deck Guides dependiendo de que se haya seleccionado.
        Ahora mismo, solo existe un unico tipo de guia en mi app (revisar App.tsx). Hay que agregar logica para identificar si las guias 
        conseguidas son de tipo counter guides o deck guide. */}
        <main
          className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-3"
          style={{ maxWidth: "87.5rem" }}
          role="main"
          aria-label="Main content"
        >
          <FeatureErrorBoundary featureName="Archetypes List">
            <RegisteredArchetypesList
              onSelectArchetype={handleSelectRegisteredArchetype}
            />
          </FeatureErrorBoundary>
        </main>
        <Footer />
      </div>
    </>
  );
};