import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CounterGuides } from "./CounterGuides";
import { DeckGuides } from "./DeckGuides";
import { GeneralStats } from "./GeneralStats";
import { LatestUpdates } from "./LastestUpdates";
import { MainFeatures } from "./MainFeatures";
import { MainSearch } from "@/shared/components/main-search/MainSearch";
import { MainSearchResults } from "@/shared/components/main-search/MainSearchResults";
import { useArchetypeSearch } from "@/features/archetypes/hooks/useArchetypes";
import type { Archetype } from "@/features/archetypes/types";
import MDCBackground from "@/assets/Maincontainer_background.webp";

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
    // Here we can use selectedButton to determine where to navigate (counters or decks guides)
    // For example: navigate(`/${selectedButton}/${archetype.id}`);
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
  };

  return (
    <div className="w-full mt-4">
      {/* MAIN CONTAINER */}
      <div className="bg-black/90 shadow-[0_12px_32px_-12px_rgba(0,0,0,1)] border border-white/10">
        <div className="relative overflow-hidden">
          {/* INNER GLOWING BORDER */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute" />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${MDCBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          {/* CONTENT */}
          <div className="relative z-10 p-4">
            {/* SEARCH SECTION - NOW INSIDE MAIN CONTAINER */}
            <div className="mt-5">
              <MainSearch
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedButton={selectedButton}
                onButtonChange={handleButtonChange}
                isDropdownOpen={
                  isDropdownOpen && (loading || error !== null || results.length > 0)
                }
                onRequestClose={handleRequestClose}
                onInputFocus={handleInputFocus}
              >
                {isDropdownOpen && (
                  <MainSearchResults
                    results={results}
                    loading={loading}
                    error={error ?? null}
                    onSelectArchetype={handleSelectArchetype}
                    selectedButton={selectedButton}
                  />
                )}
              </MainSearch>
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