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
  placeholder = "Search for archetypes to saunter...",
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
    <div ref={containerRef} className="search-input-container">
      <div className="search-input-wrapper">
        {/* Background image */}
        <img
          src={Searchbar_WithBlueBackground}
          alt="searchbar background"
          className="search-background"
          draggable="false"
        />

        {/* Contenedor principal */}
        <div className="search-content-container">
          {/* Lupa */}
          <div className="lupa-container">
            <img
              src={lupaImg}
              alt="lupa"
              className="lupa-image"
              draggable="false"
            />
          </div>

          {/* Área del input */}
          <div className="input-area">
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
              className="search-input"
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="clear-button"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isDropdownOpen && children}
      </div>
      <style>{`
        /* Estilos con media queries específicas */
        .search-input-container {
          display: flex;
          justify-content: center;
          padding-top: 1rem;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }

        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 1040px;
          height: 100px;
        }

        @media (min-width: 640px) {
          .search-input-wrapper {
            height: 144px;
          }
        }

        .search-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        .search-content-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lupa-container {
          position: absolute;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .lupa-image {
          width: 40px;
          height: 40px;
          pointer-events: none;
          user-select: none;
          z-index: 2;
          position: relative;
          bottom: 3px;
        }

        @media(max-width: 640px) {
          .lupa-container {
            display: none;
          }
        }

        @media (min-width: 641px) and (max-width: 800px) {
          .lupa-container {
            left: 10%;
          }
          .lupa-image {
            width: 48px;
            height: 48px;
          }
        }

        @media (min-width: 800px) and (max-width: 1024px) {
          .lupa-container {
            left: 10%;
          }
          .lupa-image {
            width: 59px;
            height: 59px;
          }
        }

        @media (min-width: 1025px) {
          .lupa-container {
            left: 12%;
          }
          .lupa-image {
            width: 59px;
            height: 59px;
            
          }
        }
        
        .input-area {
          position: relative;
          bottom: 3px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 400px) {
          .input-area {
            width: 85%;
          }
        }

        @media (min-width: 401px) and (max-width: 640px) {
          .input-area {
            width: 80%;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .input-area {
            width: 75%;
          }
        }

        @media (min-width: 1025px) {
          .input-area {
            width: 70%;
          }
        }

        .search-input {
          width: 100%;
          height: 48px;
          font-size: 1rem;
          background: transparent;
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 1rem;
          outline: none;
          text-align: center;
          -webkit-tap-highlight-color: transparent;
          opacity: 0.85;
          padding: 0 2rem;
          z-index: 3;
          -webkit-appearance: none;
        }

        /* Placeholder styling */
        .search-input::placeholder {
          color: rgba(191, 219, 254, 0.9);
          opacity: 0.9;
          text-align: center;
        }

        .search-input::-webkit-input-placeholder {
          color: rgba(191, 219, 254, 0.9);
          opacity: 0.9;
          text-align: center;
        }

        .search-input::-moz-placeholder {
          color: rgba(191, 219, 254, 0.9);
          opacity: 0.9;
          text-align: center;
        }

        .search-input:-ms-input-placeholder {
          color: rgba(191, 219, 254, 0.9);
          opacity: 0.9;
          text-align: center;
        }

        .search-input:-moz-placeholder {
          color: rgba(191, 219, 254, 0.9);
          opacity: 0.9;
          text-align: center;
        }

        @media (min-width: 640px) {
          .search-input {
            height: 64px;
            font-size: 1.25rem;
            padding: 0 2.5rem;
          }
        }

        @media (min-width: 1024px) {
          .search-input {
            height: 80px;
            font-size: 1.5rem;
            padding: 0 3rem;
          }
        }

        .clear-button {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(191, 219, 254, 0.8);
          font-weight: 500;
          transition: color 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          z-index: 20;
          padding: 0.25rem 0.5rem;
        }

        .clear-button:hover {
          color: rgba(219, 234, 254, 1);
        }

        @media (min-width: 640px) {
          .clear-button {
            right: 1rem;
            font-size: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .clear-button {
            right: 1.5rem;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};
