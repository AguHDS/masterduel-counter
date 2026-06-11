import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useSearchCards } from "@/features/archetypes/hooks/useCardQueries";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { useOptionalTooltipContext } from "@/features/archetypes/hooks/useTooltipContext";
import type { Card } from "@/features/archetypes/types";

interface DeckBuilderCardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
  title: string;
  autoCloseAfterSelect?: boolean;
  maxHeight?: string;
  /**
   * When true the panel escapes the document flow and renders as a fixed right-side
   * panel via createPortal (no backdrop — the deck builder stays fully interactive).
   * Use this on narrow viewports where there is no horizontal space for the panel.
   */
  floating?: boolean;
  /** Extra classes applied to the outer panel element (e.g. to override width). */
  panelClassName?: string;
}

// Constants
const GAP = 6;
const PADDING = 10;
const CARD_ASPECT_RATIO = 86 / 59;
const CARD_TEXT_HEIGHT = 28;

/**
 * An inline card search panel that sits flush to the right of the deck builder.
 * Unlike FloatingCardSearchModal, this renders in the normal document flow (no portal,
 * no backdrop-blur overlay) so the deck builder remains fully visible and interactive.
 *
 * Usage: place it as a flex sibling to the deck builder container.
 */
export const DeckBuilderCardSearchModal = ({
  isOpen,
  onClose,
  onSelectCard,
  title,
  autoCloseAfterSelect = false,
  maxHeight = "90vh",
  floating = false,
  panelClassName: extraPanelClassName,
}: DeckBuilderCardSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

  const tooltipContext = useOptionalTooltipContext();

  // Notify tooltip context when this panel opens/closes
  useEffect(() => {
    tooltipContext?.setModalOpen(isOpen);
  }, [isOpen, tooltipContext]);

  // Auto-focus search input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Track window width for responsive behavior (e.g. disable tooltips on small screens)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Reset state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setHasSearched(false);
    }
  }, [isOpen]);

  // Measure container via ResizeObserver for accurate card sizing
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

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [isOpen]);

  const { data: searchResults = [], isLoading, error } = useSearchCards(debouncedQuery);

  const handleSelectCard = useCallback(
    (
      id: number,
      name: string,
      imageUrl: string,
      imageUrlSmall: string,
      imageUrlCropped: string,
      frameType?: string,
      level?: number,
    ) => {
      const card: Card = {
        id,
        name,
        imageUrl,
        imageUrlSmall,
        imageUrlCropped,
        frameType,
        level,
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
    if (containerSize.width >= 300) return 4;
    return 3;
  }, [containerSize.width]);

  // Calculate card grid dimensions based on current container width
  const { columnCount, cardWidth, cardImageHeight, cardHeight } = useMemo(() => {
    if (containerSize.width === 0) {
      return { columnCount: 3, cardWidth: 0, cardImageHeight: 0, cardHeight: 0 };
    }

    const cols = getColumnCount();
    const totalGap = GAP * (cols - 1);
    const width = Math.floor(
      (containerSize.width - PADDING * 2 - totalGap) / cols,
    );
    const imageHeight = Math.floor(width * CARD_ASPECT_RATIO);

    return {
      columnCount: cols,
      cardWidth: width,
      cardImageHeight: imageHeight,
      cardHeight: imageHeight + CARD_TEXT_HEIGHT,
    };
  }, [containerSize.width, getColumnCount]);

  // Group results into rows for Virtuoso
  const cardRows = useMemo(() => {
    if (searchResults.length === 0 || columnCount === 0) return [];
    const rows = [];
    for (let i = 0; i < searchResults.length; i += columnCount) {
      rows.push(searchResults.slice(i, i + columnCount));
    }
    return rows;
  }, [searchResults, columnCount]);

  if (!isOpen) return null;

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

  const panelClassName = floating
    ? `fixed z-[470] right-4 top-16 bottom-4 flex flex-col overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_64px_rgba(37,99,235,0.28)] w-[300px]${extraPanelClassName ? ` ${extraPanelClassName}` : ""}`
    : `relative flex flex-col overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.18)] w-[360px] shrink-0 self-stretch min-h-[420px]${extraPanelClassName ? ` ${extraPanelClassName}` : ""}`;

  const panel = (
    <div
      ref={containerRef}
      className={panelClassName}
      style={floating ? { maxHeight } : undefined}
    >
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-700/70 bg-slate-950/70 px-5 py-4 backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white leading-tight">
            {title}
          </h3>
          <p className="text-[11px] text-slate-400">
            Click a card to add it to the deck
          </p>
        </div>
        <button
          onClick={handleClose}
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-800/70 hover:text-white"
          aria-label="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative z-10 border-b border-slate-700/70 bg-slate-950/55 px-4 py-3 backdrop-blur-xl">
        <div className="relative flex items-center rounded-[18px] border border-sky-400/25 bg-slate-950/60 px-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a Yu-Gi-Oh! card..."
            className="w-full rounded-[16px] bg-transparent py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      <div
        className="relative z-10 flex-1 overflow-hidden bg-slate-950/25 scrollbar-homeAllPages"
      >
        {isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-sky-400/20 bg-sky-500/10 shadow-[0_10px_30px_rgba(59,130,246,0.16)]">
              <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
            </div>
            <p className="text-sm font-medium text-slate-100">
              Searching cards...
            </p>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center px-4">
            <div className="rounded-[20px] border border-red-500/40 bg-red-950/25 p-5 shadow-[0_10px_24px_rgba(127,29,29,0.18)]">
              <p className="text-red-300 text-sm text-center">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {showNoResults && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-700/80 bg-slate-900/70">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-100">No cards found</p>
            <p className="text-xs text-slate-400">Try a different search term</p>
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
                    overflowX: "hidden",
                    gap: `${GAP}px`,
                    padding:
                      rowIndex === 0
                        ? `${PADDING}px ${PADDING}px 4px ${PADDING}px`
                        : `4px ${PADDING}px ${isLastRow ? PADDING : 4}px ${PADDING}px`,
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
                        disabled={windowWidth <= 700}
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
                                result.frameType,
                                result.level,
                              )
                            }
                            className="group relative flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-slate-700/90 bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-[#130f25] hover:border-sky-400/60 shadow-[0_8px_18px_rgba(2,6,23,0.35)]"
                            title={result.name}
                          >
                            {/* Card Image */}
                            <div
                              className="relative overflow-hidden bg-slate-950"
                              style={{ height: cardImageHeight }}
                            >
                              {result.imageUrlSmallExternal ? (
                                <img
                                  src={result.imageUrlSmallExternal}
                                  alt={result.name}
                                  className="relative z-10 h-full w-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-500">
                                  <span className="text-xs">No image</span>
                                </div>
                              )}

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

                              {/* Hover overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 opacity-0 group-hover:opacity-100">
                                <span className="rounded-full border border-sky-400/25 bg-sky-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_8px_18px_rgba(59,130,246,0.2)]">
                                  Select
                                </span>
                              </div>
                            </div>

                            {/* Card Name */}
                            <div
                              className="bg-slate-950/50 px-1 py-1 text-center"
                              style={{ height: CARD_TEXT_HEIGHT }}
                            >
                              <p className="truncate text-[10px] text-slate-300 group-hover:text-white">
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
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-sky-400/20 bg-sky-500/12 shadow-[0_12px_30px_rgba(59,130,246,0.18)]">
              <Search className="h-8 w-8 text-sky-200" />
            </div>
            <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              Ready
            </span>
            <p className="text-base font-semibold text-white">
              Start Your Search
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (floating) {
    return createPortal(panel, document.body);
  }
  return panel;
};
