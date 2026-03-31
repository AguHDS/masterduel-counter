import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import { useDebounce } from "@/shared/hooks/useDebounce";

export const UserSearchDropdown = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use TanStack Query for better performance and caching
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["searchUsers", debouncedSearch],
    queryFn: () => profileApi.searchUsers(debouncedSearch, 15),
    enabled: debouncedSearch.trim().length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });

  const results = searchResults?.users || [];

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Update position when results change or window resizes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
      
      return () => {
        window.removeEventListener("resize", updateDropdownPosition);
        window.removeEventListener("scroll", updateDropdownPosition, true);
      };
    }
  }, [isOpen]);

  // Open dropdown when we have results
  useEffect(() => {
    if (debouncedSearch.trim().length > 0 && results.length > 0) {
      setIsOpen(true);
    } else if (debouncedSearch.trim().length === 0) {
      setIsOpen(false);
    }
  }, [results, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserClick = (userId: string) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  // Render dropdown content
  const renderDropdown = () => {
    if (!isOpen || !dropdownPosition) return null;

    const dropdownContent = (
      <div
        ref={dropdownRef}
        className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999,
        }}
      >
        {results.length > 0 ? (
          results.map((user) => (
            <button
              key={user.userId}
              onClick={() => handleUserClick(user.userId)}
              type="button"
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-800 active:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-b-0 text-left cursor-pointer"
            >
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <span className="text-white text-sm font-medium truncate">
                {user.username}
              </span>
            </button>
          ))
        ) : debouncedSearch.trim().length > 0 && !isFetching ? (
          <div className="p-4">
            <p className="text-gray-400 text-sm text-center">No users found</p>
          </div>
        ) : null}
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="relative w-56">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={updateDropdownPosition}
          placeholder="Search users..."
          className="w-full pl-10 pr-10 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
        {isFetching ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        ) : searchQuery ? (
          <button
            onClick={handleClearSearch}
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-300 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Dropdown Portal */}
      {renderDropdown()}
    </div>
  );
};
