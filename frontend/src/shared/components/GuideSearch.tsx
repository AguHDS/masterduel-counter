import { Search, X } from "lucide-react";
import { useState } from "react";

interface GuideSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const GuideSearch = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search guides...",
}: GuideSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 px-2 py-1 bg-gray-900/70 border rounded transition-all ${
          isFocused
            ? "border-blue-400/50 shadow-md shadow-blue-500/10"
            : "border-gray-700/50"
        }`}
      >
        <Search className="w-3.5 h-3.5 text-blue-400/70 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 min-w-0"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="p-0.5 hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
