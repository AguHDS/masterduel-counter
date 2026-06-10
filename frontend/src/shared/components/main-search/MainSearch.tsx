import { useEffect, useRef, useState, useCallback } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
  isDropdownOpen?: boolean;
  onRequestClose?: () => void;
  onInputFocus?: () => void;
}

export const MainSearch = ({
  searchQuery,
  onSearchChange,
  children,
  isDropdownOpen = false,
  onRequestClose,
  onInputFocus,
}: SearchInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSmallPlaceholder, setIsSmallPlaceholder] = useState(window.innerWidth <= 390);

  const handleResize = useCallback(() => {
    setIsSmallPlaceholder(window.innerWidth <= 390);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

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

  const handleFocus = () => {
    setIsFocused(true);
    onInputFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative w-full mt-12">
        <div className="relative w-full flex items-center">
          {/* Wrapper para borde tipo neón */}
          <div
            className={`w-full p-[2px] rounded-full bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 transition-all duration-300 ease-in-out ${isFocused ? "shadow-[0_0_20px_rgba(251,146,60,0.7)]" : "shadow-none"}`}
          >
            <div className="relative w-full flex items-center">
              {/* Icono */}
              <div className="absolute left-5 pointer-events-none">
                <svg
                  className="w-6 h-6 text-orange-300"
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
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleFocus}
                placeholder={isSmallPlaceholder ? "Search Archetypes..." : "Search archetypes and find guides"}
                autoComplete="off"
                aria-label="Search for Yu-Gi-Oh archetypes"
                role="searchbox"
                spellCheck="false"
                className="w-full h-16 pl-14 pr-6 text-white text-lg sm:text-xl rounded-full bg-[#0f0d22] outline-none placeholder:text-orange-200/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] focus:shadow-[inset_0_0_12px_rgba(0,0,0,1)] transition-all duration-200 ease-in-out [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
              />

              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-5 px-3 py-1.5 text-sm text-orange-200/80 hover:text-orange-100/90 active:text-orange-300/70"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 mt-3 z-[100]">{children}</div>
      </div>
    </div>
  );
};

// Export a function to focus the input from parent components
export const focusSearchInput = (ref: React.RefObject<HTMLInputElement>) => {
  ref.current?.focus();
};
