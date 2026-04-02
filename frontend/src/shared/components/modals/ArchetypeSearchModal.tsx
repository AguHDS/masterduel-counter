import { useState, useEffect } from "react";
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

  // Calculate centered position if needed
  const modalPosition = centered
    ? {
        top: Math.max(20, (window.innerHeight - 500) / 2),
        left: (window.innerWidth - 450) / 2,
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

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[150] bg-black/50"
        onClick={handleClose}
      />
      
      {/* Floating Modal */}
      <div 
        className="fixed z-[160] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500/40 flex flex-col"
        style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          width: '450px',
          maxHeight: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-blue-500/30">
          <h3 className="text-xl font-bold text-cyan-400">
            Select Archetype
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 border-b border-blue-500/20">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 z-10" />
            <input
              type="text"
              value={archetypeSearchQuery}
              onChange={(e) => setArchetypeSearchQuery(e.target.value)}
              placeholder="Search archetype..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border-2 border-blue-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {archetypeResults &&
          archetypeResults.data.archetypes.length > 0 ? (
            <div className="space-y-2">
              {archetypeResults.data.archetypes.map((archetype) => (
                <button
                  key={archetype.id}
                  onClick={() =>
                    handleSelectArchetype(archetype.id, archetype.name)
                  }
                  className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-blue-500/20 hover:border-cyan-400/50 transition-colors"
                >
                  <p className="text-white font-medium">{archetype.name}</p>
                </button>
              ))}
            </div>
          ) : archetypeSearchQuery.trim() ? (
            <p className="text-gray-400 text-center py-8">
              No archetypes found
            </p>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Start typing to search...
            </p>
          )}
        </div>
      </div>
    </>
  );
};
