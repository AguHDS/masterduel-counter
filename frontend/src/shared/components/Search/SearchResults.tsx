import { type Archetype } from "@/features/ArchetypeAnalyzer/api/archetypeApi";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";

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
  onSelectArchetype
}: SearchResultsProps) => {
  const baseWrapperClass =
    "absolute left-1/2 top-[calc(100%-32px)] z-50 w-[88%] sm:w-[80%] md:w-[720px] -translate-x-1/2";
  const basePanelClass =
    "rounded-2xl border border-[#5a3bcb]/60 bg-[#120b2f]/95 shadow-[0_20px_45px_rgba(13,7,30,0.6)] backdrop-blur-md overflow-hidden";

  if (loading) {
    return (
      <div className={`${baseWrapperClass}`}>
        <div className={`${basePanelClass} px-6 py-8 flex items-center justify-center gap-3`}>
          <Search className="w-5 h-5 text-blue-300 animate-spin" />
          <span className="text-blue-200 text-sm tracking-wide">Searching archetypes…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${baseWrapperClass}`}>
        <div className={`${basePanelClass} px-6 py-4 flex items-center gap-3 border-red-500/50 bg-[#1b0f2f]/95`}>
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={`${baseWrapperClass}`}>
      <div className={`${basePanelClass}`}>
        <div className="px-5 py-3 text-xs tracking-wide uppercase text-[#7c6bff]/80 border-b border-[#2b1a61]">
          Found {results.length} archetype{results.length !== 1 ? "s" : ""}
        </div>
        <div className="max-h-80 overflow-y-auto search-dropdown px-2 py-3 space-y-2">
          {results.map((archetype) => {
            const pendingLabel = `${archetype.pending_requests} request${archetype.pending_requests !== 1 ? "s" : ""}`;

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype)}
                className="w-full rounded-xl px-4 py-3 text-left transition-colors duration-150 bg-[#1a1238]/70 hover:bg-[#24184c]/75 active:bg-[#2b1d5b]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6954ff]"
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
                      {archetype.pending_requests > 0 && (
                        <div className="flex items-center gap-1 text-[#ffd56a]">
                          <Clock className="w-3 h-3" />
                          <span>{pendingLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#9aa0ff] px-2 py-1 rounded-full bg-[#232048]/80 border border-[#3c2c90]/60">
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