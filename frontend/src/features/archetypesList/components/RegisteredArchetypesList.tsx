import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FramedContainer } from "@/layouts/FramedContainer";
import { useRegisteredArchetypes } from "../hooks/useRegisteredArchetypes";
import instanceItemBg from "@/assets/Bluebackground_elements.webp";

interface RegisteredArchetypesListProps {
  onSelectArchetype: (archetypeId: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const RegisteredArchetypesList = ({ onSelectArchetype }: RegisteredArchetypesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredArchetype, setHoveredArchetype] = useState<number | null>(null);
  const { data, isLoading, error } = useRegisteredArchetypes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading archetypes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">Failed to load registered archetypes</div>
      </div>
    );
  }

  const archetypes = data?.data.archetypes || [];

  if (archetypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">No registered archetypes yet</div>
      </div>
    );
  }

  const totalPages = Math.ceil(archetypes.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArchetypes = archetypes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <FramedContainer
      aria-label="Latest registered archetypes"
      contentClassName="w-full px-3 sm:px-4 md:px-[5%] py-6 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <h2 className="text-2xl font-bold text-white">Latest Registered Archetypes •</h2>
        <span className="text-sm font-semibold text-blue-300">Newest guides from the community</span>
      </div>

      <div className="hidden md:grid grid-cols-[60px_minmax(220px,1fr)_160px] gap-3 mb-3 border-b border-blue-600 bg-black/60 rounded-t-lg md:px-6 md:py-4">
        <div className="text-blue-300 font-semibold text-lg">ID</div>
        <div className="text-blue-300 font-semibold text-lg relative left-20">Archetype</div>
        <div className="text-blue-300 font-semibold text-lg text-right">Instances</div>
      </div>

      <div className="flex flex-col gap-4">
        {currentArchetypes.map((archetype, index) => {
          const positionLabel = startIndex + index + 1;
          const instanceCount = archetype.instance_count || 0;
          const instanceLabel = `${instanceCount} ${instanceCount === 1 ? "instance" : "instances"}`;

          const badgeContent = archetype.name.charAt(0).toUpperCase();

          return (
            <button
              key={archetype.id}
              onClick={() => onSelectArchetype(archetype.id)}
              onMouseEnter={() => setHoveredArchetype(archetype.id)}
              onMouseLeave={() => setHoveredArchetype(null)}
              className="group relative w-full overflow-hidden rounded-xl border border-transparent transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <img
                src={instanceItemBg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 group-active:bg-black/40" />

              {/* Tooltip */}
              {hoveredArchetype === archetype.id && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 text-white text-sm rounded-lg shadow-lg border border-blue-500/50 whitespace-nowrap pointer-events-none">
                  {archetype.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900"></div>
                </div>
              )}

              <div className="relative z-10 flex flex-col gap-3 p-4 md:p-0 md:gap-0">
                <div className="flex items-center gap-3 md:hidden">
                  <span className="text-[#FFD700] text-xl font-bold drop-shadow-md">{positionLabel}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-yellow-400/50 bg-gradient-to-br from-purple-600/70 to-blue-500/70 flex items-center justify-center text-white font-semibold text-lg">
                      {badgeContent}
                    </div>
                    <span className="text-white text-base font-semibold leading-tight truncate" title={archetype.name}>
                      {archetype.name}
                    </span>
                  </div>
                </div>

                <div className="hidden md:grid md:grid-cols-[60px_minmax(220px,1fr)_160px] md:gap-3 md:items-center md:px-6 md:py-4">
                  <div className="text-[#ffbf1f] relative right-2 text-2xl font-bold drop-shadow-md">{positionLabel}</div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded border border-yellow-400/50 bg-gradient-to-br from-purple-600/70 to-blue-500/70 flex items-center justify-center text-white font-semibold text-xl">
                      {badgeContent}
                    </div>
                    <span className="text-white text-lg font-semibold truncate" title={archetype.name}>
                      {archetype.name}
                    </span>
                  </div>
                  <div className="text-blue-200 text-lg text-right">{instanceLabel}</div>
                </div>

                <div className="md:hidden grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
                  <span className="text-blue-300">Archetype</span>
                  <span className="text-white text-right" title={archetype.name}>{archetype.name}</span>
                  <span className="text-blue-300">Instances</span>
                  <span className="text-blue-100 text-right">{instanceLabel}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-blue-300 text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </FramedContainer>
  );
};
