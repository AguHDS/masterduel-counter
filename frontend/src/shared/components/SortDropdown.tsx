import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps {
  value: "likes" | "updated" | "views";
  onChange: (value: "likes" | "updated" | "views") => void;
}

const sortOptions = [
  { value: "updated" as const, label: "Most Recent" },
  { value: "views" as const, label: "Most Viewed" },
  { value: "likes" as const, label: "Most Liked" },
];

/** Dropdown component for sorting guides */
export const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newValue: "likes" | "updated" | "views") => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0a0e2e]/80 border border-blue-500/40 rounded-lg text-white hover:border-blue-400/60 transition-colors text-sm min-w-[150px] justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-full min-w-[150px] bg-[#0a0e2e] border border-blue-500/40 rounded-lg shadow-lg shadow-black/50 z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? "bg-blue-600 text-white"
                  : "text-blue-300 hover:bg-blue-500/10 hover:text-white"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
