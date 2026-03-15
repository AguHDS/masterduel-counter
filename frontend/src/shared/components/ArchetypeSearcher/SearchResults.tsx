import { type Archetype } from "@/features/ArchetypeAnalyzer/api/archetypeApi";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchResultsProps {
  results: Archetype[];
  loading: boolean;
  error: string | null;
  onSelectArchetype: (archetype: Archetype) => void;
}

export const SearchResults = ({
  results,
  loading,
  error,
  onSelectArchetype,
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

  // Anchura reducida para que coincida mejor con la searchbar
  const baseWrapperClass = "absolute left-1/2 top-[calc(100%-16px)] z-[100] w-[65%] sm:w-[90%] md:w-[600px] lg:w-[635px] -translate-x-1/2";

  // Efecto de blur + transparencia con la gama de colores del entorno (ámbar/negro)
  const basePanelClass = `rounded-lg border-2 border-amber-500/40 bg-black/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${
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
          <Search className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-amber-200/90 text-sm tracking-wide">
            Searching archetypes…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${baseWrapperClass}`}>
        <div
          className={`${basePanelClass} px-6 py-4 flex items-center gap-3 border-red-500/40`}
        >
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300/90 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseWrapperClass}`}>
      <div className={`${basePanelClass}`}>
        {/* Header con estilo del entorno */}
        <div className="px-5 py-3 text-xs tracking-wide uppercase text-amber-400/80 border-b border-amber-500/30 animate-in slide-in-from-top-2 fade-in duration-200 fill-mode-both">
          Found {results.length} archetype{results.length !== 1 ? "s" : ""}
        </div>

        {/* Contenedor de resultados */}
        <div className="max-h-80 overflow-y-auto search-dropdown px-2 py-3 space-y-2">
          {results.map((archetype, index) => {
            const delay = index * 40;

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype)}
                className="w-full rounded-lg px-4 py-3 text-left transition-all duration-150 bg-black/40 hover:bg-amber-950/30 active:bg-amber-900/40 active:scale-[0.98] border border-amber-500/20 hover:border-amber-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 animate-in slide-in-from-top-3 fade-in fill-mode-both"
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
                    className="text-[10px] uppercase tracking-wider text-amber-400/70 px-2 py-1 rounded-full bg-black/40 border border-amber-500/30 animate-in fade-in fill-mode-both"
                    style={{
                      animationDuration: "200ms",
                      animationDelay: `${delay + 60}ms`,
                    }}
                  >
                    ID {archetype.id}
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