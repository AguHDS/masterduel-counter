import { useState, useEffect, useRef, useMemo } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useSearchCards } from "../hooks/useCardQueries";
import { type Card } from "../api/cardApi";
import { CardTooltip } from "./CardTooltip";

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
  keepOpenAfterSelect?: boolean;
}

export const CardSearchModal = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
  keepOpenAfterSelect = false,
}: CardSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Use the query hook directly - results only update when debouncedQuery changes
  const { data: searchResults = [], isLoading, error } = useSearchCards(debouncedQuery);

  // Measure container size for responsive grid
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  const handleSelectCard = (cardId: number, cardName: string, imageUrl?: string, imageUrlSmall?: string) => {
    // Create card object instantly using external URLs from search results
    // When user saves changes, backend will confirm and upload to Cloudinary
    const card: Card = {
      id: cardId,
      name: cardName,
      imageUrl: imageUrl || '',
      imageUrlSmall: imageUrlSmall || '',
      imageUrlCropped: imageUrl || '', // Use full image as cropped for now
    };
    onSelectCard(card);
    if (!keepOpenAfterSelect) {
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  // Calculate responsive column count and dimensions based on container width
  const getColumnCount = () => {
    if (containerSize.width >= 768) return 4; // md
    if (containerSize.width >= 640) return 3; // sm
    return 2; // default
  };

  const columnCount = getColumnCount();
  const gap = 12;
  const paddingHorizontal = 16 * 2; // 16px left + 16px right padding
  // Proper Yu-Gi-Oh card aspect ratio is 59:86 (approx 0.686)
  const totalGap = gap * (columnCount - 1); // gaps between cards only
  const cardWidth = Math.floor((containerSize.width - paddingHorizontal - totalGap) / columnCount);
  const cardImageHeight = Math.floor(cardWidth * (86 / 59)); // Maintain aspect ratio
  const cardTextHeight = 30; // Fixed height for name only
  const cardHeight = cardImageHeight + cardTextHeight;

  // Group cards into rows for virtualization
  const cardRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < searchResults.length; i += columnCount) {
      rows.push(searchResults.slice(i, i + columnCount));
    }
    return rows;
  }, [searchResults, columnCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 rounded-xl shadow-2xl border-2 border-blue-500/30 w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden">
        {/* Decorative glow effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative p-4 border-b border-slate-700/50 bg-slate-900/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a Yu-Gi-Oh! card..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div ref={containerRef} className="relative flex-1 overflow-hidden bg-slate-900/20">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-400">
              {error.message}
            </div>
          )}

          {!isLoading && !error && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No cards found. Try a different search term.
            </div>
          )}

          {!isLoading && !error && searchResults.length > 0 && containerSize.width > 0 && containerSize.height > 0 && (
            <Virtuoso
              style={{ height: containerSize.height }}
              totalCount={cardRows.length}
              itemContent={(rowIndex) => {
                const row = cardRows[rowIndex];
                return (
                  <div 
                    style={{
                      display: 'flex',
                      gap: `${gap}px`,
                      padding: rowIndex === 0 ? '16px 16px 8px 16px' : '8px 16px',
                      justifyContent: 'start',
                    }}
                  >
                    {row.map((result) => {
                      const tooltipImage = result.imageUrlExternal ?? result.imageUrlSmallExternal ?? "";
                      return (
                        <CardTooltip
                          key={result.id}
                          cardId={result.id}
                          imageUrl={tooltipImage}
                          cardName={result.name}
                        >
                          <div
                            className="flex-shrink-0"
                            style={{ width: cardWidth, height: cardHeight }}
                          >
                            <button
                              onClick={() => handleSelectCard(
                                result.id,
                                result.name,
                                result.imageUrlExternal,
                                result.imageUrlSmallExternal
                              )}
                              className="group relative bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all duration-200 border-2 border-slate-600 hover:border-blue-500 overflow-hidden flex flex-col w-full h-full"
                              title={result.name}
                            >
                            {/* Card Image */}
                            <div className="relative bg-slate-800" style={{ height: cardImageHeight }}>
                              {result.imageUrlSmallExternal ? (
                                <img
                                  src={result.imageUrlSmallExternal}
                                  alt={result.name}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <span className="text-xs">No image</span>
                                </div>
                              )}
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium px-2 text-center">
                                  Select
                                </span>
                              </div>
                            </div>

                            {/* Card Name */}
                            <div className="px-2 py-1.5 bg-slate-800/80 flex-shrink-0 flex items-center" style={{ height: cardTextHeight }}>
                              <p className="text-xs text-white font-medium truncate leading-tight">
                                {result.name}
                              </p>
                            </div>
                            </button>
                          </div>
                        </CardTooltip>
                      );
                    })}
                  </div>
                );
              }}
              overscan={3}
              className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
            />
          )}

          {!isLoading && !error && !searchQuery && (
            <div className="text-center py-8 text-slate-400">
              Start typing to search for cards...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
