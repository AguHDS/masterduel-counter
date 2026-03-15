import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import { LatestUpdates } from "./LastestUpdates";
import { MainFeatures } from "./MainFeatures";
import { ArchetypeSearcher } from "@/shared/components/ArchetypeSearcher/ArchetypeSearcher";
import { SearchResults } from "@/shared/components/ArchetypeSearcher/SearchResults";
import { useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import type { Archetype } from "@/features/archetypes/types";

export const HomeAllComponents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState<"counters" | "decks">(
    "counters",
  );

  const { results, loading, error } = useArchetypeSearch({
    searchQuery,
    debounceDelay: 300,
    limit: 20,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    setIsDropdownOpen(false);
    setSearchQuery("");
    // Aquí puedes usar selectedButton para determinar a dónde navegar (counters o decks guides)
    // Por ejemplo: navigate(`/${selectedButton}/${archetype.id}`);
    navigate(`/archetype/${archetype.id}`);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleRequestClose = () => {
    setIsDropdownOpen(false);
  };

  const handleButtonChange = (button: "counters" | "decks") => {
    setSelectedButton(button);
    // Aquí puedes agregar lógica adicional cuando cambia el botón
    // Por ejemplo: resetear la búsqueda, cambiar el placeholder, etc.
  };

  return (
    <div className="w-full mb-8 mt-4">
      <div className="bg-black/70 shadow-2xl p-1 rounded-lg">
        <div className="relative border-2 border-amber-500/60 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.35)]">
          {/* BORDE INTERIOR BRILLANTE */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute" />
          </div>

          {/* BACKGROUNDS */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Imagen para desktop (ambas) - visible solo en lg y superior */}
            <div className="hidden lg:grid lg:grid-cols-2 w-full h-full">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `url(/src/assets/home-rework/bg_red.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `url(/src/assets/home-rework/bg_blue.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>

            {/* Imagen para móvil/tablet (solo azul) - visible en menores de lg */}
            <div
              className="lg:hidden w-full h-full"
              style={{
                backgroundImage: `url(/src/assets/home-rework/bg_noline.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* CONTENT */}
          <div className="relative z-10 p-4">
            <div className="mb-4">
              <ArchetypeSearcher
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedButton={selectedButton}
                onButtonChange={handleButtonChange}
                isDropdownOpen={
                  isDropdownOpen &&
                  (loading || error !== null || results.length > 0)
                }
                onRequestClose={handleRequestClose}
                onInputFocus={handleInputFocus}
              >
                {isDropdownOpen && (
                  <SearchResults
                    results={results}
                    loading={loading}
                    error={error ?? null}
                    onSelectArchetype={handleSelectArchetype}
                    selectedButton={selectedButton}
                  />
                )}
              </ArchetypeSearcher>
            </div>
            {/* GUIDES */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-[550px] relative">
                <CounterGuides />
              </div>

              <div className="h-[550px] relative">
                <DeckGuides />
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
          <div className="lg:col-span-2 h-2" aria-hidden="true" />

          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3">
            <div
              className="lg:col-span-2 h-[420px]"
              aria-label="Latest updates section"
            >
              <LatestUpdates />
            </div>

            <div className="h-[420px]" aria-label="Main features section">
              <MainFeatures />
            </div>
          </div>

          <div className="lg:col-span-2 h-2" aria-hidden="true" />

          <div
            className="lg:col-span-2 h-[500px]"
            aria-label="General statistics section"
          >
            <GeneralStats />
          </div>
        </div>
      </div>
    </div>
  );
};
