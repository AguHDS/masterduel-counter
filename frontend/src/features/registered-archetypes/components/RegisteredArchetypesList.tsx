import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { FramedContainer } from "@/layouts/FramedContainer";
import { useRegisteredArchetypes } from "../hooks/useRegisteredArchetypes";

interface RegisteredArchetypesListProps {
  onSelectArchetype: (archetypeId: number) => void;
}

const ITEMS_PER_PAGE = 15;

/** List of archetypes that are registered (with at least 1 guide instance)
 * TODO: The idea is that this component must show all registered archetypes (with at least one guide) of Counter Guides or Deck 
 * Guides, depending on what button was clicked: View all Counter Guides or View All Deck Guides in CounterGuides.tsx/DeckGuides.tsx.
 * Right now, we don't have a way to differenciate between Counter Guides and Deck Guides.
*/
export const RegisteredArchetypesList = ({
  onSelectArchetype,
}: RegisteredArchetypesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "instances">("recent");
  const { data, isLoading, error } = useRegisteredArchetypes(sortBy);

  const toggleSortBy = () => {
    setSortBy((prev) => (prev === "recent" ? "instances" : "recent"));
    setCurrentPage(0);
  };

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
        <div className="text-red-400 text-lg">
          Failed to load registered archetypes
        </div>
      </div>
    );
  }

  const archetypes = data?.data.archetypes || [];

  if (archetypes.length === 0) {
    return (
      <FramedContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-blue-300 text-lg">
            No registered archetypes yet
          </div>
        </div>
      </FramedContainer>
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
      contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] py-6 gap-6"
    >
      <div className="flex max-[767px]:ml-4 sm:flex-row sm:items-end gap-2 mt-2">
        <h2 className="text-2xl relative bottom-1 font-bold text-white">
          Lastest Registered Archetypes
        </h2>
        <span className="text-sm relative max-[640px]:top-1 bottom-[7px] font-semibold text-blue-300">
          • updated by the community
        </span>
      </div>

      <div className="rounded-lg overflow-hidden border border-blue-600/40 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm">
        <div
          className="w-full h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)",
          }}
        />
        
        <div className="hidden md:grid grid-cols-[1fr_100px] border-b border-blue-500/50 bg-slate-950/80 px-5 py-3">
          <div className="text-blue-300 font-semibold text-sm ml-9">
            Archetype
          </div>
          <button
            onClick={toggleSortBy}
            className="flex items-center justify-end gap-2 text-blue-300 font-semibold text-sm hover:text-blue-200 transition-colors group"
            title={`Sort by ${sortBy === "recent" ? "instance count" : "most recent"}`}
          >
            <span>Guides</span>
            {sortBy === "instances" ? (
              <ArrowDown
                className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-green-400"
                aria-hidden="true"
              />
            ) : (
              <ArrowUp
                className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <div className="space-y-1 p-3">
          {currentArchetypes.map((archetype, index) => {
            const positionLabel = startIndex + index + 1;
            const instanceCount = archetype.instance_count || 0;

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype.id)}
                className="group relative w-full overflow-hidden rounded transition-all hover:scale-[1.01] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-950/50 via-purple-900/40 to-violet-950/50 border border-blue-500/40 rounded" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-800/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 group-active:bg-black/40 transition-colors rounded" />

                <div className="relative z-10">
                  <div className="hidden md:grid md:grid-cols-[1fr_100px] md:gap-4 md:items-center md:px-5 md:py-2.5">
                    <div className="flex items-center gap-5">
                      <span className="text-slate-500 text-sm font-medium">
                        {positionLabel}
                      </span>
                      <span
                        className="text-white text-base font-medium truncate group-hover:text-blue-100 transition-colors"
                        title={archetype.name}
                      >
                        {archetype.name}
                      </span>
                    </div>
                    <div className="text-blue-200 text-sm text-right font-semibold">
                      {instanceCount}
                    </div>
                  </div>

                  <div className="md:hidden px-4 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-slate-500 text-sm font-medium flex-shrink-0">
                          {positionLabel}
                        </span>
                        <span
                          className="text-white text-sm font-medium truncate group-hover:text-blue-100 transition-colors"
                          title={archetype.name}
                        >
                          {archetype.name}
                        </span>
                      </div>
                      <span className="text-blue-200 text-sm font-semibold flex-shrink-0">
                        {instanceCount}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 disabled:text-blue-400/30 disabled:cursor-not-allowed transition-all rounded"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <span className="text-blue-300 text-base font-semibold min-w-max">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 disabled:text-blue-400/30 disabled:cursor-not-allowed transition-all rounded"
            aria-label="Next page"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </FramedContainer>
  );
};
