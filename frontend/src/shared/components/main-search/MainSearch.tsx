import { useEffect, useRef } from "react";
import search_button from "@/assets/home-rework/search_button_blackandwhite.webp";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedButton: "counters" | "decks";
  onButtonChange: (button: "counters" | "decks") => void;
  children?: React.ReactNode;
  isDropdownOpen?: boolean;
  onRequestClose?: () => void;
  onInputFocus?: () => void;
}

export const MainSearch = ({
  searchQuery,
  onSearchChange,
  selectedButton,
  onButtonChange,
  children,
  isDropdownOpen = false,
  onRequestClose,
  onInputFocus,
}: SearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !containerRef.current ||
        containerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      onRequestClose?.();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onRequestClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen, onRequestClose]);

  const countersFilter =
    selectedButton === "counters"
      ? "sepia(1) hue-rotate(-35deg) saturate(4.5) brightness(0.75)"
      : "saturate(0) brightness(0.6)";

  const decksFilter =
    selectedButton === "decks"
      ? "sepia(1) hue-rotate(190deg) saturate(4.5) brightness(0.75)"
      : "saturate(0) brightness(0.6)";

  const searchBorderColor =
    selectedButton === "decks" ? "border-blue-500/60" : "border-red-500/60";

  const searchFocusRingColor =
    selectedButton === "decks" ? "focus:ring-blue-500" : "focus:ring-red-500";

  const searchBackgroundColor =
    selectedButton === "decks" ? "bg-blue-950/30" : "bg-red-950/30";

  const activePlaceholder =
    selectedButton === "decks" ? "Search deck guides" : "Search counter guides";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* SEARCH */}
      <div ref={containerRef} className="relative w-full">
        <div className="relative w-full flex items-center">
          {/* Magnifying glass icon */}
          <div className="absolute left-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onInputFocus}
            onClick={onInputFocus}
            placeholder={activePlaceholder}
            autoComplete="off"
            aria-label="Search for Yu-Gi-Oh archetypes to counter"
            role="searchbox"
            spellCheck="false"
            className={`w-full text-white rounded-xs h-12 placeholder:text-slate-300 outline-none text-base sm:text-lg py-4 pl-12 pr-6 border-2 ${searchBorderColor} ${searchFocusRingColor} ${searchBackgroundColor} focus:ring-2 focus:outline-none transition-all duration-200 ease-linear [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden`}
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 px-3 py-1 text-sm text-white bg-slate-700/40 hover:bg-slate-600/50 rounded transition-colors border border-slate-400/40 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute left-0 right-0 mt-2 z-50">{children}</div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-6 mt-5">
        {/* COUNTERS */}
        <button
          onClick={() => onButtonChange("counters")}
          className="relative flex items-center justify-center transition-all duration-200"
          style={{ transform: "translateX(-10%)" }}
        >
          <img
            src={search_button}
            alt=""
            draggable="false"
            className="h-[54px] w-auto select-none"
            style={{ filter: countersFilter }}
          />
          <span className="absolute text-white text-[17px] font-semibold">
            Counter
          </span>
        </button>

        {/* DECKS */}
        <button
          onClick={() => onButtonChange("decks")}
          className="relative flex items-center justify-center transition-all duration-200"
          style={{ transform: "translateX(10%)" }}
        >
          <img
            src={search_button}
            alt=""
            draggable="false"
            className="h-[54px] w-auto select-none"
            style={{ filter: decksFilter }}
          />
          <span className="absolute text-white text-[17px] font-semibold">
            Decks
          </span>
        </button>
      </div>
    </div>
  );
};
