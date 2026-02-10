import { Search, User, Mail, Calendar, AlertTriangle } from "lucide-react";
import type { SearchUserResult } from "../types/adminPanelTypes";

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchError: string;
  setSearchError: (error: string) => void;
  searchResults: SearchUserResult[];
  setSearchResults: (results: SearchUserResult[]) => void;
  searchLoading: boolean;
  loading: boolean;
  onSearch: (e: React.FormEvent) => void;
  onSelectUser: (userId: string) => void;
}

export const SearchBar = ({
  searchInput,
  setSearchInput,
  searchError,
  setSearchError,
  searchResults,
  setSearchResults,
  searchLoading,
  loading,
  onSearch,
  onSelectUser,
}: SearchBarProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg p-6">
      <form onSubmit={onSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-2">
            Search by username or email
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchError("");
                setSearchResults([]);
              }}
              placeholder="Enter username or email..."
              className="flex-1 bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || searchLoading}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Search size={18} />
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
          <p className="text-xs text-blue-400 mt-2">
            Press Enter to search. Results will appear below.
          </p>
        </div>

        {searchError && (
          <div
            className={`p-3 rounded-lg ${
              searchError.includes("successfully")
                ? "bg-green-500/10 border border-green-500/30 text-green-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            {searchError}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-blue-300">
              Search Results ({searchResults.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onSelectUser(result.id)}
                  className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-blue-900/30 rounded-lg text-left transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-400" />
                        <span className="font-medium text-white">
                          {result.username}
                        </span>
                        {result.is_banned && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                            Banned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Mail size={12} className="text-blue-400" />
                        <span className="text-blue-300">{result.email}</span>
                      </div>
                      {/* Show ban information if exists */}
                      {result.is_banned && result.ban_reason && (
                        <div className="flex items-start gap-1 mt-2 text-xs">
                          <AlertTriangle
                            size={10}
                            className="text-red-400 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-red-300 truncate">
                            Reason: {result.ban_reason}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <Calendar size={12} />
                        <span>
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          {result.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
