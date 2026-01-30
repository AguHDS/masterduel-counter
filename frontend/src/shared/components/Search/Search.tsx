import lupaImg from "@/assets/Lupa.webp";
import Searchbar_WithBlueBackground from "@/assets/Bluesearch.webp";
import { useEffect, useRef } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  isDropdownOpen?: boolean;
  onRequestClose?: () => void;
  onInputFocus?: () => void;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search for archetypes...",
  children,
  isDropdownOpen = false,
  onRequestClose,
  onInputFocus,
}: SearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current || containerRef.current.contains(event.target as Node)) {
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

  return (
    <div ref={containerRef} className="flex justify-center py-8 px-4 pb-0">
      <div className="relative w-full max-w-[1040px] h-[144px]">
        
        {/* Background image */}
        <img
          src={Searchbar_WithBlueBackground}
          alt="searchbar background"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable="false"
          style={{ zIndex: 1 }}
        />

        {/* Lens icon */}
        <img
          src={lupaImg}
          alt="lupa"
          className="absolute left-[120px] top-[66px] -translate-y-1/2 w-14 h-14 pointer-events-none select-none"
          draggable="false"
          style={{ zIndex: 2 }}
        />

        {/* Input */}
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => onInputFocus?.()}
          onClick={() => onInputFocus?.()}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search for Yu-Gi-Oh archetypes"
          role="searchbox"
          spellCheck="false"
          className="w-full h-full pr-24 text-2xl py-8 bg-transparent border-none text-white placeholder-blue-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-transparent"
          style={{
            fontWeight: 600,
            zIndex: 3,
            position: 'relative',
            paddingLeft: "12rem",
            paddingTop: "1rem",
            WebkitTapHighlightColor: 'transparent',
          }}
        />

        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-32 top-1/2 -translate-y-1/2 text-blue-200 hover:text-blue-100 transition-colors text-xl"
            style={{ fontWeight: 500, zIndex: 4 }}
          >
            Clear
          </button>
        )}

        {isDropdownOpen && children}
      </div>
    </div>
  );
};
