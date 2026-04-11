import { type Archetype } from "@/features/archetypes/types/archetypes.types";
import { Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useCallback, memo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  isVisible: boolean;
  results: Archetype[];
  totalResults?: number;
  loading: boolean;
  error: string | null;
  onSelectArchetype: (archetype: Archetype, guideType?: 'COUNTER' | 'DECK') => void;
}

type TabType = "all" | "counters" | "decks";

export const MainSearchResults = memo(
  ({
    isVisible,
    results,
    totalResults,
    loading,
    error,
    onSelectArchetype,
  }: SearchResultsProps) => {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Prevent body scroll when dropdown is open and user is scrolling within results
    useEffect(() => {
      if (!isVisible) return;

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const handleWheel = (e: WheelEvent) => {
        const container = scrollContainer;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          if (scrollHeight > clientHeight) {
            e.preventDefault();
          }
        }
      };

      scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
      
      return () => {
        scrollContainer.removeEventListener("wheel", handleWheel);
      };
    }, [isVisible]);

    const handleTabChange = useCallback((tab: TabType) => {
      setActiveTab(tab);
      setTimeout(() => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[role="searchbox"]',
        );
        searchInput?.focus();
      }, 0);
    }, []);

    const handleViewAllCounterGuides = useCallback(() => {
      navigate("/archetypes?type=counter");
    }, [navigate]);

    const handleViewAllDeckGuides = useCallback(() => {
      navigate("/archetypes?type=deck");
    }, [navigate]);

    const renderGuideItem = useCallback(
      (archetype: Archetype, index: number, type: "counter" | "deck") => {
        const delay = index * 40;
        const guideType = type === "counter" ? "COUNTER" : "DECK";
        const hasGuide =
          type === "counter"
            ? archetype.has_counter_guide ?? archetype.registered
            : archetype.has_deck_guide ?? archetype.registered;

        return (
          <button
            key={`${type}-${archetype.id}`}
            onClick={() => onSelectArchetype(archetype, guideType)}
            className="
              w-full px-3 py-1.5 text-left
              transition-all duration-150
              bg-black/70
              hover:bg-amber-900/20
              active:bg-amber-800/30 active:scale-[0.98]
              border border-yellow-500/30
              hover:border-amber-400/40
              rounded-md
              shadow-[0_0_8px_rgba(250,204,21,0.15)]
              hover:shadow-[0_0_12px_rgba(250,204,21,0.3)]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400
              animate-in slide-in-from-top-3 fade-in fill-mode-both
            "
            style={{
              animationDuration: "200ms",
              animationDelay: `${delay}ms`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-white/90 tracking-wide text-md">
                {archetype.name}
              </div>
              <div className="flex items-center gap-1">
                {hasGuide ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-400/90 text-xs">
                      has guides
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-gray-500/80" />
                    <span className="text-gray-500/80 text-xs">
                      no guides
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      },
      [onSelectArchetype],
    );

    const renderNoResults = useCallback(
      () => (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AlertCircle className="w-12 h-12 text-yellow-400/60 mb-3" />
          <p className="text-yellow-200/90 text-base font-medium text-center">
            Archetype not found
          </p>
          <p className="text-yellow-300/60 text-sm mt-1 text-center">
            Try a different search term
          </p>
        </div>
      ),
      [],
    );

    const hasResults = results.length > 0;
    const counterGuides = hasResults ? results.slice(0, 7) : [];
    const deckGuides = hasResults ? results.slice(0, 7) : [];

    const getFilteredResults = () => {
      if (activeTab === "counters") return results.slice(0, 15);
      if (activeTab === "decks") return results.slice(0, 15);
      return [];
    };

    const filteredResults = getFilteredResults();
    const actualTotal =
      totalResults !== undefined ? totalResults : results.length;

    const baseWrapperClass = `absolute left-1/2 top-[calc(100%-13px)] z-50 w-[91%] sm:w-[90%] md:w-[92%] lg:w-[815px] -translate-x-1/2 ${
      !isVisible ? "pointer-events-none" : ""
    }`;

    const basePanelClass = `
      border border-amber-400/50
      bg-[#0f0d22]/90
      shadow-[0_0_20px_rgba(250,204,21,0.25)]
      backdrop-blur-md
      overflow-hidden
      transition-all duration-200 ease-out
      ${
        isVisible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      }
    `;

    let content;

    if (loading) {
      content = (
        <div className="px-6 py-8 flex items-center justify-center gap-3">
          <Search className="w-5 h-5 text-yellow-300 animate-spin" />
          <span className="text-yellow-200/90 text-sm tracking-wide">
            Searching guides…
          </span>
        </div>
      );
    } else if (error) {
      content = (
        <div className="px-6 py-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300/90 text-sm">{error}</span>
        </div>
      );
    } else {
      content = (
        <>
          <div className="flex border-b border-yellow-400/20">
            <button
              onClick={() => handleTabChange("all")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "text-yellow-300 border-b-2 border-yellow-400 bg-yellow-900/50"
                  : "text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-[#242231]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTabChange("counters")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === "counters"
                  ? "text-yellow-300 border-b-2 border-yellow-400 bg-yellow-900/50"
                  : "text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-[#201e2e]"
              }`}
            >
              Counter Guides
            </button>
            <button
              onClick={() => handleTabChange("decks")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "decks"
                  ? "text-yellow-300 border-b-2 border-yellow-400 bg-yellow-900/50"
                  : "text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-[#242231]"
              }`}
            >
              Deck Guides
            </button>
          </div>

          <div 
            ref={scrollContainerRef}
            className="max-h-[550px] overflow-y-auto px-2 py-2 scrollbar-mainsearch"
          >
            {!hasResults ? (
              renderNoResults()
            ) : (
              <>
                {activeTab === "all" && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="px-2 mb-3 text-[14px] tracking-wide uppercase text-yellow-400/80 font-semibold">
                        Counter Guides
                      </h3>
                      {counterGuides.length > 0 ? (
                        <>
                          <div className="space-y-1.5">
                            {counterGuides.map((archetype, index) =>
                              renderGuideItem(archetype, index, "counter"),
                            )}
                          </div>
                          <button 
                            onClick={handleViewAllCounterGuides}
                            className="w-full mt-2 px-3 py-1.5 text-[14px] text-amber-400/90 hover:text-amber-300 active:text-amber-600 transition-all"
                          >
                            View All Counter Guides
                          </button>
                        </>
                      ) : (
                        <p className="text-yellow-300/60 text-sm px-2 py-4 text-center">
                          No counter guides found
                        </p>
                      )}
                    </div>

                    <h3 className="px-2 mb-3 text-[14px] tracking-wide uppercase text-yellow-400/80 font-semibold">
                      Deck Guides
                    </h3>
                    {deckGuides.length > 0 ? (
                      <>
                        <div className="space-y-1.5">
                          {deckGuides.map((archetype, index) =>
                            renderGuideItem(archetype, index, "deck"),
                          )}
                        </div>
                        <button 
                          onClick={handleViewAllDeckGuides}
                          className="w-full mt-2 px-3 py-1.5 text-[14px] text-amber-400/90 hover:text-amber-300 active:text-amber-600 transition-all"
                        >
                          View All Deck Guides
                        </button>
                      </>
                    ) : (
                      <p className="text-yellow-300/60 text-sm px-2 py-4 text-center">
                        No deck guides found
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "counters" && (
                  <div className="space-y-1.5">
                    <div className="px-2 py-1 text-[14px] tracking-wide uppercase text-yellow-400/80">
                      Found {actualTotal} archetypes
                      {actualTotal > 15 && (
                        <span className="ml-1 text-yellow-500/70">
                          (showing first 15)
                        </span>
                      )}
                    </div>
                    {filteredResults.map((archetype, index) =>
                      renderGuideItem(archetype, index, "counter"),
                    )}
                  </div>
                )}

                {activeTab === "decks" && (
                  <div className="space-y-1.5">
                    <div className="px-2 py-1 text-[14px] tracking-wide uppercase text-yellow-400/80">
                      Found {actualTotal} archetypes
                      {actualTotal > 15 && (
                        <span className="ml-1 text-yellow-500/70">
                          (showing first 15)
                        </span>
                      )}
                    </div>
                    {filteredResults.map((archetype, index) =>
                      renderGuideItem(archetype, index, "deck"),
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      );
    }

    return (
      <div className={`${baseWrapperClass}`}>
        <div className={`${basePanelClass}`}>{content}</div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.isVisible !== nextProps.isVisible) return false;
    if (prevProps.loading !== nextProps.loading) return false;
    if (prevProps.error !== nextProps.error) return false;

    if (!nextProps.isVisible) return true;

    if (prevProps.totalResults !== nextProps.totalResults) return false;
    if (prevProps.results.length !== nextProps.results.length) return false;
    if (prevProps.results === nextProps.results) return true;

    return false;
  },
);

MainSearchResults.displayName = "MainSearchResults";