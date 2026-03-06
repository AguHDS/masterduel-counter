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

  const baseWrapperClass =
    "absolute left-1/2 top-[calc(100%-32px)] z-[100] w-[88%] sm:w-[80%] md:w-[720px] -translate-x-1/2";

  // Animación tipo cortina más rápida
  const basePanelClass = `rounded-2xl border border-[#5a3bcb]/60 bg-[#120b2f]/95 shadow-[0_20px_45px_rgba(13,7,30,0.6)] backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${
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
          <Search className="w-5 h-5 text-blue-300 animate-spin" />
          <span className="text-blue-200 text-sm tracking-wide">
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
          className={`${basePanelClass} px-6 py-4 flex items-center gap-3 border-red-500/50 bg-[#1b0f2f]/95`}
        >
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseWrapperClass}`}>
      <div className={`${basePanelClass}`}>
        {/* Header que aparece primero */}
        <div className="px-5 py-3 text-xs tracking-wide uppercase text-[#7c6bff]/80 border-b border-[#2b1a61] animate-in slide-in-from-top-2 fade-in duration-200 fill-mode-both">
          Found {results.length} archetype{results.length !== 1 ? "s" : ""}
        </div>

        {/* Contenedor de resultados con animación escalonada más rápida */}
        <div className="max-h-80 overflow-y-auto search-dropdown px-2 py-3 space-y-2">
          {results.map((archetype, index) => {
            const delay = index * 40; // 40ms de delay entre cada item (más rápido)

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype)}
                className="w-full rounded-xl px-4 py-3 text-left transition-all duration-150 bg-[#1a1238]/70 hover:bg-[#24184c]/75 active:bg-[#2b1d5b]/80 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6954ff] animate-in slide-in-from-top-3 fade-in fill-mode-both"
                style={{
                  animationDuration: "200ms",
                  animationDelay: `${delay}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white tracking-wide">
                      {archetype.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1 text-[#7dffb2]">
                        {archetype.registered ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span className="text-red-300">Not registered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider text-[#9aa0ff] px-2 py-1 rounded-full bg-[#232048]/80 border border-[#3c2c90]/60 animate-in fade-in fill-mode-both"
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
