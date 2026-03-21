import { type Archetype } from "@/features/archetypes/types/archetypes.types";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchResultsProps {
  results: Archetype[];
  loading: boolean;
  error: string | null;
  onSelectArchetype: (archetype: Archetype) => void;
  selectedButton: "counters" | "decks";
}

export const MainSearchResults = ({
  results,
  loading,
  error,
  onSelectArchetype,
  selectedButton,
}: SearchResultsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasContent = loading || error || results.length > 0;

  useEffect(() => {
    if (hasContent) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [hasContent]);

  if (!hasContent) {
    return null;
  }

  const colors = {
    counters: {
      border: "border-red-500/40",
      shadow: "shadow-[0_0_25px_rgba(239,68,68,0.25)]",
      text: "text-red-400/80",
      borderBottom: "border-red-500/30",
      hover: "hover:bg-red-950/30",
      active: "active:bg-red-900/40",
      borderHover: "hover:border-red-500/40",
      borderItem: "border-red-500/20",
      focus: "focus-visible:outline-red-500",
      badgeBorder: "border-red-500/30",
      badgeText: "text-red-400/70",
      loadingText: "text-red-200/90",
      loadingIcon: "text-red-400",
      errorBorder: "border-red-500/40",
      errorIcon: "text-red-400",
      errorText: "text-red-300/90",
      scrollbar: "scrollbar-counterguides",
    },
    decks: {
      border: "border-blue-500/40",
      shadow: "shadow-[0_0_25px_rgba(59,130,246,0.25)]",
      text: "text-blue-400/80",
      borderBottom: "border-blue-500/30",
      hover: "hover:bg-blue-950/30",
      active: "active:bg-blue-900/40",
      borderHover: "hover:border-blue-500/40",
      borderItem: "border-blue-500/20",
      focus: "focus-visible:outline-blue-500",
      badgeBorder: "border-blue-500/30",
      badgeText: "text-blue-400/70",
      loadingText: "text-blue-200/90",
      loadingIcon: "text-blue-400",
      errorBorder: "border-blue-500/40",
      errorIcon: "text-blue-400",
      errorText: "text-blue-300/90",
      scrollbar: "scrollbar-deckguides",
    },
  };

  const currentColors = colors[selectedButton];
  const baseWrapperClass = "absolute left-1/2 top-[calc(100%-16px)] z-[100] w-[65%] sm:w-[90%] md:w-[600px] lg:w-[635px] -translate-x-1/2";
  const basePanelClass = `rounded-lg border-2 ${currentColors.border} bg-black/80 ${currentColors.shadow} backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${
    isVisible
      ? "opacity-100 max-h-[500px] scale-100"
      : "opacity-0 max-h-0 scale-95 pointer-events-none"
  }`;

  if (loading) {
    return (
      <div className={`${baseWrapperClass}`}>
        <div
          className={`${basePanelClass} px-6 py-8 flex items-center justify-center gap-3`}
        >
          <Search className={`w-5 h-5 ${currentColors.loadingIcon} animate-spin`} />
          <span className={`${currentColors.loadingText} text-sm tracking-wide`}>
            Searching {selectedButton === "counters" ? "counter guides" : "deck guides"}…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${baseWrapperClass}`}>
        <div
          className={`${basePanelClass} px-6 py-4 flex items-center gap-3 ${currentColors.errorBorder}`}
        >
          <XCircle className={`w-5 h-5 ${currentColors.errorIcon}`} />
          <span className={`${currentColors.errorText} text-sm`}>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseWrapperClass}`}>
      <div className={`${basePanelClass}`}>
        <div className={`px-5 py-3 text-xs tracking-wide uppercase ${currentColors.text} border-b ${currentColors.borderBottom} animate-in slide-in-from-top-2 fade-in duration-200 fill-mode-both`}>
          Found {results.length} {selectedButton === "counters" ? "archetype" : "deck"}
          {results.length !== 1 ? "s" : ""} to {selectedButton === "counters" ? "counter" : "explore"}
        </div>

        <div className={`max-h-80 overflow-y-auto px-2 py-3 space-y-2 ${currentColors.scrollbar}`}>
          {results.map((archetype, index) => {
            const delay = index * 40;

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype)}
                className={`w-full rounded-lg px-4 py-3 text-left transition-all duration-150 bg-black/40 ${currentColors.hover} ${currentColors.active} active:scale-[0.98] border ${currentColors.borderItem} ${currentColors.borderHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${currentColors.focus} animate-in slide-in-from-top-3 fade-in fill-mode-both`}
                style={{
                  animationDuration: "200ms",
                  animationDelay: `${delay}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white/90 tracking-wide">
                      {archetype.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        {archetype.registered ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400/90">Registered</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" />
                            <span className="text-amber-600/90">Not registered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider ${currentColors.badgeText} px-2 py-1 rounded-full bg-black/40 border ${currentColors.badgeBorder} animate-in fade-in fill-mode-both`}
                    style={{
                      animationDuration: "200ms",
                      animationDelay: `${delay + 60}ms`,
                    }}
                  >
                    {selectedButton === "counters" ? "ID" : "Deck"} {archetype.id}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};