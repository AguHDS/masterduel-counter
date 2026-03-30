import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useSearchCards } from "@/features/archetypes/hooks/useCardQueries";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

interface FloatingCardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
  anchorElement: HTMLElement | null;
  autoCloseAfterSelect?: boolean;
}

// Constants
const GAP = 8;
const PADDING = 12;
const CARD_ASPECT_RATIO = 86 / 59;
const CARD_TEXT_HEIGHT = 30;
const MODAL_WIDTH = 400;
const MODAL_HEIGHT = 600;

export const FloatingCardSearchModal = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
  anchorElement,
  autoCloseAfterSelect = false,
}: FloatingCardSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Calculate position based on anchor element
  useEffect(() => {
    if (!isOpen || !anchorElement) return;

    const calculatePosition = () => {
      const anchorRect = anchorElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = anchorRect.top;
      let left = anchorRect.right + 10; // 10px gap from anchor

      // If modal would go off right edge, position to the left of anchor
      if (left + MODAL_WIDTH > viewportWidth - 20) {
        left = anchorRect.left - MODAL_WIDTH - 10;
      }

      // If still off screen (element too far left), position on right edge with padding
      if (left < 20) {
        left = viewportWidth - MODAL_WIDTH - 20;
      }

      // Adjust vertical position to keep modal in viewport
      if (top + MODAL_HEIGHT > viewportHeight - 20) {
        top = Math.max(20, viewportHeight - MODAL_HEIGHT - 20);
      }

      setPosition({ top, left });
    };

    calculatePosition();

    // Recalculate on scroll or resize
    const handleUpdate = () => calculatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, anchorElement]);

  // Debounce search query
  useEffect(() => {
    if (!isOpen) {
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim().length > 0) {
        setHasSearched(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasSearched(false);
    }
  }, [isOpen]);

  // Search cards
  const {
    data: searchResults = [],
    isLoading,
    error,
  } = useSearchCards(debouncedQuery);

  // Reset when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setHasSearched(false);
    }
  }, [isOpen]);

  // Measure container
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize((prev) => {
          if (
            Math.abs(prev.width - width) > 1 ||
            Math.abs(prev.height - height) > 1
          ) {
            return { width, height };
          }
          return prev;
        });
      }
    };

    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSize);
    };

    updateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const handleSelectCard = useCallback(
    (id: number, name: string, imageUrl: string, imageUrlSmall: string, imageUrlCropped: string) => {
      const card: Card = {
        id,
        name,
        imageUrl,
        imageUrlSmall,
        imageUrlCropped,
      };
      onSelectCard(card);
      if (autoCloseAfterSelect) {
        onClose();
      }
    },
    [onSelectCard, autoCloseAfterSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
    onClose();
  }, [onClose]);

  const getColumnCount = useCallback(() => {
    if (containerSize.width >= 400) return 3;
    return 2;
  }, [containerSize.width]);

  // Calculate card dimensions
  const { columnCount, cardWidth, cardImageHeight, cardHeight } = useMemo(() => {
    if (containerSize.width === 0) {
      return {
        columnCount: 2,
        cardWidth: 0,
        cardImageHeight: 0,
        cardHeight: 0,
      };
    }

    const cols = getColumnCount();
    const gap = GAP;
    const padding = PADDING * 2;
    const totalGap = gap * (cols - 1);
    const width = Math.floor((containerSize.width - padding - totalGap) / cols);
    const imageHeight = Math.floor(width * CARD_ASPECT_RATIO);

    return {
      columnCount: cols,
      cardWidth: width,
      cardImageHeight: imageHeight,
      cardHeight: imageHeight + CARD_TEXT_HEIGHT,
    };
  }, [containerSize.width, getColumnCount]);

  // Create rows for virtualization
  const cardRows = useMemo(() => {
    if (searchResults.length === 0 || columnCount === 0) return [];

    const rows = [];
    for (let i = 0; i < searchResults.length; i += columnCount) {
      rows.push(searchResults.slice(i, i + columnCount));
    }
    return rows;
  }, [searchResults, columnCount]);

  if (!isOpen || !anchorElement) return null;

  // Determine what to show
  const showWelcome = !isLoading && !error && !searchQuery && !hasSearched;
  const showNoResults =
    !isLoading &&
    !error &&
    searchQuery &&
    searchResults.length === 0 &&
    hasSearched;
  const showResults =
    !isLoading &&
    !error &&
    searchResults.length > 0 &&
    containerSize.width > 0 &&
    cardWidth > 0;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[90]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className="fixed z-[100] bg-slate-900 rounded-lg shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${MODAL_WIDTH}px`,
          height: `${MODAL_HEIGHT}px`,
          maxHeight: "calc(100vh - 40px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <button
            onClick={handleClose}
            type="button"
            className="text-slate-400 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a Yu-Gi-Oh! card..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="relative flex-1 overflow-hidden bg-slate-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-slate-300 text-sm">
                Searching cards...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-950/40 border border-red-500/50 rounded p-4 mx-4">
                <p className="text-red-300 text-sm text-center">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {showNoResults && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm text-center">
                No cards found
              </p>
              <p className="text-slate-500 text-xs text-center">
                Try a different search term
              </p>
            </div>
          )}

          {showResults && (
            <Virtuoso
              style={{ height: "100%" }}
              totalCount={cardRows.length}
              itemContent={(rowIndex) => {
                const row = cardRows[rowIndex];
                const isLastRow = rowIndex === cardRows.length - 1;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: `${GAP}px`,
                      padding:
                        rowIndex === 0
                          ? `${PADDING}px ${PADDING}px 6px ${PADDING}px`
                          : `6px ${PADDING}px ${isLastRow ? PADDING : 6}px ${PADDING}px`,
                      justifyContent: "start",
                    }}
                  >
                    {row.map((result) => {
                      const tooltipImage =
                        result.imageUrlExternal ??
                        result.imageUrlSmallExternal ??
                        "";
                      return (
                        <CardTooltip
                          key={result.id}
                          cardId={result.id}
                          imageUrl={tooltipImage}
                          cardName={result.name}
                        >
                          <div
                            className="flex-shrink-0 animate-in fade-in slide-in-from-bottom-3 duration-300"
                            style={{
                              width: cardWidth,
                              height: cardHeight,
                              animationDelay: `${(result.id % 4) * 50}ms`,
                            }}
                          >
                            <button
                              onClick={() =>
                                handleSelectCard(
                                  result.id,
                                  result.name,
                                  result.imageUrlExternal || "",
                                  result.imageUrlSmallExternal || "",
                                  result.imageUrlCroppedExternal || "",
                                )
                              }
                              className="group relative bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 hover:border-blue-500 transition-colors overflow-hidden flex flex-col w-full h-full"
                              title={result.name}
                            >
                              {/* Card Image */}
                              <div
                                className="relative bg-slate-900 overflow-hidden"
                                style={{ height: cardImageHeight }}
                              >
                                {result.imageUrlSmallExternal ? (
                                  <img
                                    src={result.imageUrlSmallExternal}
                                    alt={result.name}
                                    className="w-full h-full object-contain relative z-10"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <span className="text-xs">No image</span>
                                  </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold px-3 py-1.5 bg-blue-600 rounded">
                                    Select
                                  </span>
                                </div>
                              </div>

                              {/* Card Name */}
                              <div
                                className="px-1 py-1 text-center bg-slate-800"
                                style={{ height: CARD_TEXT_HEIGHT }}
                              >
                                <p className="text-[10px] text-slate-300 truncate group-hover:text-white transition-colors">
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
              components={{
                Footer: () => <div style={{ height: `${PADDING}px` }} />,
              }}
            />
          )}

          {showWelcome && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
              <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <p className="text-white text-base font-medium text-center">
                Start Your Search
              </p>
              <p className="text-slate-400 text-sm text-center">
                Type to find a card
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
