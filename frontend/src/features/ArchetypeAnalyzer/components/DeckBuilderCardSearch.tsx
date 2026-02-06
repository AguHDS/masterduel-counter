import { useState, useEffect, useRef, useMemo } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useSearchCards } from "../hooks/useCardQueries";
import type { Card } from "../api/cardApi";
import { CardTooltip } from "./CardTooltip";

interface DeckBuilderCardSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
}

export const DeckBuilderCardSearch = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
}: DeckBuilderCardSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Use the query hook directly - results only update when searchQuery changes
  const { data: searchResults = [], isLoading, error } = useSearchCards(searchQuery);

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

  const handleSelectCard = (cardId: number, cardName: string, imageUrl: string, imageUrlSmall: string) => {
    // Create card object instantly using external URLs from search results
    // When user saves the instance, backend will confirm and upload to Cloudinary
    const card: Card = {
      id: cardId,
      name: cardName,
      imageUrl: imageUrl,
      imageUrlSmall: imageUrlSmall,
      imageUrlCropped: imageUrl, // Use full image as cropped for now
    };
    onSelectCard(card);
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  // Calculate responsive column count and dimensions based on container width
  const getColumnCount = () => {
    if (containerSize.width >= 400) return 3;
    if (containerSize.width >= 300) return 2;
    return 2;
  };

  const columnCount = getColumnCount();
  const gap = 8;
  const paddingHorizontal = 12 * 2;
  const totalGap = gap * (columnCount - 1);
  const cardWidth = Math.floor((containerSize.width - paddingHorizontal - totalGap) / columnCount);
  const cardImageHeight = Math.floor(cardWidth * (86 / 59));

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
    <div className="fixed right-0 top-0 bottom-0 z-50 flex items-start justify-end pt-16 pr-4">
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-blue-950/95 rounded-lg shadow-2xl border-2 border-blue-500/30 backdrop-blur-sm"
        style={{ width: '380px', height: 'calc(100vh - 80px)' }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 120px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400 text-sm px-4 text-center">
              {error.message}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm px-4 text-center">
              {searchQuery.trim() ? "No cards found. Try a different search term." : "Type to search for cards..."}
            </div>
          ) : (
            <Virtuoso
              data={cardRows}
              itemContent={(index, row) => (
                <div
                  key={index}
                  className="grid gap-2 px-3"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                    paddingTop: index === 0 ? '12px' : '0',
                    paddingBottom: '12px',
                  }}
                >
                  {row.map((card) => (
                    <div key={card.id} className="flex flex-col">
                      <CardTooltip
                        cardId={card.id}
                        imageUrl={card.imageUrlExternal || ""}
                        cardName={card.name}
                      >
                        <div
                          onClick={() => handleSelectCard(
                            card.id, 
                            card.name, 
                            card.imageUrlExternal || "", 
                            card.imageUrlSmallExternal || card.imageUrlExternal || ""
                          )}
                          className="cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img
                            src={card.imageUrlSmallExternal || card.imageUrlExternal}
                            alt={card.name}
                            className="w-full rounded border border-slate-600 hover:border-blue-400"
                            style={{ height: `${cardImageHeight}px`, objectFit: 'cover' }}
                            loading="lazy"
                          />
                          <p className="text-xs text-slate-300 mt-1 truncate text-center">
                            {card.name}
                          </p>
                        </div>
                      </CardTooltip>
                    </div>
                  ))}
                </div>
              )}
              style={{ height: '100%' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
