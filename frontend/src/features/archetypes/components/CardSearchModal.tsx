import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useSearchCards } from "../hooks/useCardQueries";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

export type ModalVariant = "center" | "sidebar";

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
  variant?: ModalVariant;
  keepOpenAfterSelect?: boolean;
  autoCloseAfterSelect?: boolean;
}

// Constants outside the component to avoid recreations
const GAP = { center: 12, sidebar: 8 };
const PADDING = { center: 16, sidebar: 12 };
const CARD_ASPECT_RATIO = 86 / 59;
const CARD_TEXT_HEIGHT = 30;

export const CardSearchModal = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
  variant = "center",
  keepOpenAfterSelect = false,
  autoCloseAfterSelect = true,
}: CardSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce faster and search from the first letter
  useEffect(() => {
    if (!isOpen) {
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      // Marcar que se ha realizado una búsqueda si hay query
      if (searchQuery.trim().length > 0) {
        setHasSearched(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Reset hasSearched when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setHasSearched(false);
    }
  }, [isOpen]);

  // Run search for any query (including 1 character)
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

  // Optimize container measurement
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
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  const handleSelectCard = useCallback(
    (
      cardId: number,
      cardName: string,
      imageUrl?: string,
      imageUrlSmall?: string,
    ) => {
      const card: Card = {
        id: cardId,
        name: cardName,
        imageUrl: imageUrl || "",
        imageUrlSmall: imageUrlSmall || "",
        imageUrlCropped: imageUrl || "",
      };
      onSelectCard(card);

      if (variant === "sidebar" && autoCloseAfterSelect) {
        setSearchQuery("");
        onClose();
      } else if (variant === "center" && !keepOpenAfterSelect) {
        setSearchQuery("");
      }
    },
    [onSelectCard, variant, autoCloseAfterSelect, keepOpenAfterSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
    onClose();
  }, [onClose]);

  const getColumnCount = useCallback(() => {
    if (variant === "sidebar") {
      if (containerSize.width >= 400) return 3;
      return 2;
    } else {
      if (containerSize.width >= 768) return 4;
      if (containerSize.width >= 640) return 3;
      return 2;
    }
  }, [containerSize.width, variant]);

  const getModalStyles = useCallback(() => {
    if (variant === "sidebar") {
      return {
        container:
          "fixed right-0 top-0 bottom-0 z-[60] flex items-start justify-end pt-16 pr-4",
        modal:
          "relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500/40 backdrop-blur-md flex flex-col",
        size: { width: "400px", height: "calc(100vh - 80px)" },
      };
    } else {
      return {
        container:
          "fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200",
        modal:
          "relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500/40 w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300",
        size: {},
      };
    }
  }, [variant]);

  // Memorize heavy calculations
  const { columnCount, cardWidth, cardImageHeight, cardHeight } =
    useMemo(() => {
      if (containerSize.width === 0) {
        return {
          columnCount: 2,
          cardWidth: 0,
          cardImageHeight: 0,
          cardHeight: 0,
        };
      }

      const cols = getColumnCount();
      const gap = GAP[variant];
      const padding = PADDING[variant] * 2;
      const totalGap = gap * (cols - 1);
      const width = Math.floor(
        (containerSize.width - padding - totalGap) / cols,
      );
      const imageHeight = Math.floor(width * CARD_ASPECT_RATIO);

      return {
        columnCount: cols,
        cardWidth: width,
        cardImageHeight: imageHeight,
        cardHeight: imageHeight + CARD_TEXT_HEIGHT,
      };
    }, [containerSize.width, variant, getColumnCount]);

  // Memorize rows
  const cardRows = useMemo(() => {
    if (searchResults.length === 0 || columnCount === 0) return [];

    const rows = [];
    for (let i = 0; i < searchResults.length; i += columnCount) {
      rows.push(searchResults.slice(i, i + columnCount));
    }
    return rows;
  }, [searchResults, columnCount]);

  if (!isOpen) return null;

  const styles = getModalStyles();

  // Determine what to show:
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

  return (
    <div className={styles.container}>
      <div
        ref={containerRef}
        className={styles.modal}
        style={styles.size}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated gradient borders */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500"></div>
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-blue-950/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative p-4 sm:p-5 border-b border-blue-500/20 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative flex items-center">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 focus-within:text-cyan-300 transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a Yu-Gi-Oh! card..."
              className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-blue-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 backdrop-blur-sm font-medium text-sm sm:text-base"
              autoFocus
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"></div>
          </div>
        </div>

        {/* Search Results */}
        <div
          className={`relative flex-1 overflow-hidden bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/40 ${
            variant === "sidebar" ? "h-[calc(100%-130px)]" : ""
          }`}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 animate-spin" />
              <p className="text-cyan-300 text-sm font-medium">
                Searching cards...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-950/40 border-2 border-red-500/40 rounded-xl p-4 sm:p-6 backdrop-blur-sm mx-4">
                <p className="text-red-300 text-sm font-medium text-center">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {showNoResults && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-slate-600">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm font-medium text-center">
                No cards found
              </p>
              <p className="text-slate-500 text-xs text-center">
                Try a different search term
              </p>
            </div>
          )}

          {showResults && (
            <Virtuoso
              style={{
                height: variant === "sidebar" ? "100%" : containerSize.height,
              }}
              totalCount={cardRows.length}
              itemContent={(rowIndex) => {
                const row = cardRows[rowIndex];
                const isLastRow = rowIndex === cardRows.length - 1;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: `${GAP[variant]}px`,
                      padding:
                        rowIndex === 0
                          ? `${PADDING[variant]}px ${PADDING[variant]}px ${variant === "sidebar" ? 6 : 8}px ${PADDING[variant]}px`
                          : `${variant === "sidebar" ? 6 : 8}px ${PADDING[variant]}px ${isLastRow ? PADDING[variant] : variant === "sidebar" ? 6 : 8}px ${PADDING[variant]}px`,
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
                                  result.imageUrlExternal,
                                  result.imageUrlSmallExternal,
                                )
                              }
                              className="group relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 hover:from-blue-900/40 hover:via-slate-800/60 hover:to-purple-900/40 rounded-xl transition-all duration-300 border-2 border-slate-700/50 hover:border-cyan-400/60 overflow-hidden flex flex-col w-full h-full hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                              title={result.name}
                            >
                              {/* Card Image */}
                              <div
                                className="relative bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden"
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                  <div className="relative">
                                    <span className="text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg relative z-10">
                                      Select Card
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur-md"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Name */}
                              <div
                                className="px-2 py-1.5 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 group-hover:from-blue-950/90 group-hover:via-slate-900/90 group-hover:to-purple-950/90 flex-shrink-0 flex items-center border-t border-slate-700/50 group-hover:border-cyan-500/30 transition-all duration-300"
                                style={{ height: CARD_TEXT_HEIGHT }}
                              >
                                <p className="text-xs text-slate-300 group-hover:text-cyan-100 font-medium truncate leading-tight transition-colors duration-300">
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
              overscan={2}
              className="scrollbar-thin scrollbar-thumb-cyan-700/50 scrollbar-track-slate-800/50 hover:scrollbar-thumb-cyan-600/70 transition-colors"
              components={{
                Footer: () =>
                  variant === "sidebar" ? (
                    <div style={{ height: `${PADDING[variant]}px` }} />
                  ) : null,
              }}
            />
          )}

          {showWelcome && (
            <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4 px-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
              </div>
              <p className="text-slate-300 text-base sm:text-lg font-semibold text-center">
                Start Your Search
              </p>
              <p className="text-slate-400 text-sm text-center">
                Type to find a card
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
