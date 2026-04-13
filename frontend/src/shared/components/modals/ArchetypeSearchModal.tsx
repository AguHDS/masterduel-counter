import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import { useSearchArchetypes } from "@/features/archetypes/hooks/useArchetypes";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface ArchetypeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArchetype: (archetypeId: number, archetypeName: string) => void;
  position?: { top: number; left: number };
  centered?: boolean;
}

export const ArchetypeSearchModal = ({
  isOpen,
  onClose,
  onSelectArchetype,
  position,
  centered = false,
}: ArchetypeSearchModalProps) => {
  const [archetypeSearchQuery, setArchetypeSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedArchetypeQuery = useDebounce(archetypeSearchQuery, 300);
  const { data: archetypeResults } = useSearchArchetypes(
    debouncedArchetypeQuery,
    10,
  );

  // Clean up search query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setArchetypeSearchQuery("");
    }
  }, [isOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Calculate centered position if needed
  const modalPosition = centered
    ? {
        top: Math.max(20, (window.innerHeight - 500) / 2),
        left: Math.max(20, (window.innerWidth - 450) / 2),
      }
    : position || { top: 0, left: 0 };

  if (!isOpen) return null;

  const handleClose = () => {
    setArchetypeSearchQuery("");
    onClose();
  };

  const handleSelectArchetype = (archetypeId: number, archetypeName: string) => {
    setArchetypeSearchQuery("");
    onSelectArchetype(archetypeId, archetypeName);
  };

  const archetypes = archetypeResults?.data.archetypes ?? [];
  const showWelcome = !archetypeSearchQuery.trim();
  const showNoResults = archetypeSearchQuery.trim() && archetypes.length === 0;
  const showResults = archetypes.length > 0;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[460] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_28%),rgba(2,6,23,0.72)] backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[470] flex flex-col overflow-hidden rounded-[24px] border border-blue-500/40 bg-gradient-to-br from-[#090d18] via-[#13182b] to-[#190f30] shadow-[0_0_44px_rgba(37,99,235,0.18)]"
        style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          width: "450px",
          maxHeight: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 h-24 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-700/70 bg-slate-950/70 px-5 py-4 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white">Select Archetype</h3>
          <button
            onClick={handleClose}
            type="button"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800/70 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative z-10 border-b border-slate-700/70 bg-slate-950/55 px-5 py-4 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Search
            </span>
          </div>
          <div className="relative flex items-center rounded-[18px] border border-sky-400/25 bg-slate-950/60 px-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
            <input
              ref={inputRef}
              type="text"
              value={archetypeSearchQuery}
              onChange={(e) => setArchetypeSearchQuery(e.target.value)}
              placeholder="Search for an archetype..."
              className="w-full rounded-[16px] bg-transparent py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="relative z-10 flex-1 overflow-y-auto bg-slate-950/25 scrollbar-homeAllPages px-5 py-4">
          {showWelcome && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-sky-400/20 bg-sky-500/10 shadow-[0_12px_30px_rgba(59,130,246,0.18)]">
                <Search className="h-7 w-7 text-sky-200" />
              </div>
              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Ready
              </span>
              <p className="text-base font-semibold text-white">Start typing to search</p>
            </div>
          )}

          {showNoResults && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-700/80 bg-slate-900/70 shadow-[0_10px_30px_rgba(2,6,23,0.3)]">
                <Search className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-100">No archetypes found</p>
              <p className="text-sm text-slate-400">Try a different search term</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-1.5">
              {archetypes.map((archetype) => (
                <button
                  key={archetype.id}
                  onClick={() => handleSelectArchetype(archetype.id, archetype.name)}
                  className="group w-full text-left px-4 py-3 rounded-[14px] border border-slate-700/60 bg-slate-950/50 hover:border-sky-400/50 hover:bg-sky-500/8 transition-all duration-150 shadow-[0_4px_12px_rgba(2,6,23,0.25)]"
                >
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {archetype.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
