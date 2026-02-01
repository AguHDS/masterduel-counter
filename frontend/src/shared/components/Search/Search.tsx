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
  placeholder,
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

  return (
    <div ref={containerRef} className="flex justify-center pt-4 sm:pt-8 px-2 sm:px-4">
      <div className="relative w-full max-w-[1040px] h-[100px] sm:h-[144px]">
        {/* Background image */}
        <img
          src={Searchbar_WithBlueBackground}
          alt="searchbar background"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable="false"
          style={{ zIndex: 1 }}
        />

        {/* Contenedor para centrar todo el contenido */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8">
          {/* Lupa - Más cerca del centro */}
          <div className="w-20 relative left-[7%] bottom-1 sm:w-28 flex items-center justify-center">
            <img
              src={lupaImg}
              alt="lupa"
              className="w-10 h-10 sm:w-14 sm:h-14 pointer-events-none select-none"
              draggable="false"
              style={{ zIndex: 2 }}
            />
          </div>

          {/* Placeholder */}
          <div className="flex-1 flex justify-center mx-2 sm:mx-4">
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
              className="w-full relative bottom-1 h-12 sm:h-16 text-base sm:text-2xl bg-transparent border-none text-white placeholder-blue-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-transparent [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none opacity-85"
              style={{
                fontWeight: 600,
                zIndex: 3,
                textAlign: "center",
                WebkitTapHighlightColor: "transparent",
                padding: "0 1rem",
              }}
            />
          </div>

          {/* Clear button - Más cerca del borde derecho */}
          <div className="w-20 sm:w-28 flex items-center justify-end pr-2 sm:pr-4">
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="text-blue-200/80 relative right-[100%] bottom-1 hover:text-blue-100 transition-colors text-sm sm:text-xl"
                style={{ fontWeight: 500, zIndex: 4 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isDropdownOpen && children}
      </div>
    </div>
  );
};