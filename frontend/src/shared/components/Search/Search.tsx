import Searchbar_WithBlueBackground from "@/assets/Bluesearch.webp";
import { useEffect, useRef } from "react";
import styles from "./search.module.css";

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
  placeholder = "Search archetypes...",
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
    <div ref={containerRef} className={styles.searchInputContainer}>
      <div className={styles.searchInputWrapper}>
        {/* Background image */}
        <img
          src={Searchbar_WithBlueBackground}
          alt="searchbar background"
          className={styles.searchBackground}
          draggable="false"
        />

        {/* Contenedor principal */}
        <div className={styles.searchContentContainer}>
          {/* Área del input */}
          <div className={styles.inputArea}>
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
              className={styles.searchInput}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className={styles.clearButton}
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
