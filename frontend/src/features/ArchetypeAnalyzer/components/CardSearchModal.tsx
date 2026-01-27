import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { useCardSelection } from "../hooks/useCardSelection";
import { type Card } from "../api/cardApi";

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
}

export const CardSearchModal = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
}: CardSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, loading, error, search, select, clearSearch } = useCardSelection();

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        search(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearSearch();
    }
  }, [searchQuery, search, clearSearch]);

  const handleSelectCard = async (cardId: number) => {
    const card = await select(cardId);
    if (card) {
      onSelectCard(card);
      setSearchQuery("");
      clearSearch();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    clearSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a Yu-Gi-Oh! card..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No cards found. Try a different search term.
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectCard(result.id)}
                  className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600 hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{result.name}</span>
                    <span className="text-slate-400 text-sm font-mono">#{result.id}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && !searchQuery && (
            <div className="text-center py-8 text-slate-400">
              Start typing to search for cards...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
