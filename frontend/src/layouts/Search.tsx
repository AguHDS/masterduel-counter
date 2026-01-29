import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  showResults?: boolean;
  children?: React.ReactNode;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search for archetypes...",
  showResults = true,
  children,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="p-6 border-b border-blue-700 bg-gradient-to-r from-blue-900/50 to-slate-900/50">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 z-10 pointer-events-none" aria-hidden="true" />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/70 border-2 border-blue-600/50 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 backdrop-blur-sm"
              autoComplete="off"
              aria-label="Search for Yu-Gi-Oh archetypes"
              role="searchbox"
              spellCheck="false"
            />

            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {showResults && isFocused && searchQuery.trim() && children && (
        <div className="absolute top-full left-0 right-0 z-50">{children}</div>
      )}
    </div>
  );
};
