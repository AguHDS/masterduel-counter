import { useEffect, useRef, useState } from "react";
import searchImg from "@/assets/home-rework/Search_v2.webp";
import search_button from "@/assets/home-rework/search_button.webp";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
  isDropdownOpen?: boolean;
  onRequestClose?: () => void;
  onInputFocus?: () => void;
}

export const ArchetypeSearcher = ({
  searchQuery,
  onSearchChange,
  children,
  isDropdownOpen = false,
  onRequestClose,
  onInputFocus,
}: SearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedButton, setSelectedButton] = useState<"counters" | "decks">(
    "counters",
  );

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
      ? "hue-rotate(90deg) saturate(1) brightness(1)"
      : "saturate(0) brightness(0.6)";

  const decksFilter =
    selectedButton === "decks"
      ? "hue-rotate(310deg) saturate(1) brightness(1)"
      : "saturate(0) brightness(0.6)";

  const searchFilter =
    selectedButton === "decks"
      ? "hue-rotate(310deg) saturate(0.9)"
      : "hue-rotate(90deg) saturate(0.9)";

  const activePlaceholder =
    selectedButton === "decks"
      ? "Search decks and learn combo lines"
      : "Search archetypes to counter";

  return (
    <div className="w-full max-w-2xl mx-auto mt-2">
      {/* SEARCH */}
      <div ref={containerRef} className="relative w-full">
        <div
          className="relative w-full h-[72px] flex items-center"
          style={{
            backgroundImage: `url(${searchImg})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            filter: searchFilter,
            opacity: 0.4,
          }}
        />

        <div className="absolute inset-0 flex items-center px-[14%]">
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
            className="w-full bg-transparent text-white placeholder:text-slate-300 outline-none text-base sm:text-lg [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="relative left-10 px-3 py-1 text-sm text-white bg-slate-700/40 hover:bg-slate-600/50 rounded transition-colors border border-slate-400/40 whitespace-nowrap"
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
      <div className="flex justify-center gap-6 mt-3">
        {/* COUNTERS */}
        <button
          onClick={() => setSelectedButton("counters")}
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
          onClick={() => setSelectedButton("decks")}
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
