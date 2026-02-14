import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { FramedContainer } from "@/layouts/FramedContainer";
import { useRegisteredArchetypes } from "../hooks/useRegisteredArchetypes";
import instanceItemBg from "@/assets/background_instanceitem_plane.webp";

interface RegisteredArchetypesListProps {
  onSelectArchetype: (archetypeId: number) => void;
}

const ITEMS_PER_PAGE = 10;

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
      contentClassName="w-full px-3 sm:px-4 md:px-[5%] py-5 flex flex-col"
    >
      <div className="flex my-5 max-[767px]:ml-4  sm:flex-row sm:items-end gap-2">
        <h2 className="text-2xl relative bottom-1 font-bold text-white">
          Latest Archetypes •
        </h2>
        <span className="text-sm relative max-[640px]:top-1 bottom-[7px] font-semibold text-blue-300">
          Updated by the community
        </span>
      </div>

      <div
        className="w-full flex justify-center m-auto h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)",
        }}
      />

      <div className="rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_minmax(220px,1fr)_160px] gap-3 border-b border-blue-600 bg-black/60 md:px-6 md:py-4">
          <div className="text-blue-300 font-semibold text-lg">ID</div>
          <div className="text-blue-300 font-semibold text-lg relative left-16">
            Archetype
          </div>
          <button
            onClick={toggleSortBy}
            className="flex items-center justify-end gap-2 text-blue-300 font-semibold text-lg hover:text-blue-200 transition-colors group"
            title={`Sort by ${sortBy === "recent" ? "instance count" : "most recent"}`}
          >
            <span>Instances</span>
            {sortBy === "instances" ? (
              <ArrowDown
                className="w-4 h-4 relative top-[2px] right-[5px] group-hover:scale-110 transition-transform text-green-400"
                aria-hidden="true"
              />
            ) : (
              <ArrowUp
                className="w-4 h-4 relative top-[2px] right-[4px] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          {currentArchetypes.map((archetype, index) => {
            const positionLabel = startIndex + index + 1;
            const instanceCount = archetype.instance_count || 0;
            const instanceLabel = `${instanceCount} ${
              instanceCount === 1 ? "instance" : "instances"
            }`;
            const badgeContent = archetype.name.charAt(0).toUpperCase();

            return (
              <button
                key={archetype.id}
                onClick={() => onSelectArchetype(archetype.id)}
                className="group relative w-full overflow-hidden border-b border-blue-900/30 last:border-b-0 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <img
                  src={instanceItemBg}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 group-active:bg-black/40" />

                <div className="relative z-10 flex flex-col gap-3 p-4 md:p-0 md:gap-0">
                  <div className="flex items-center gap-3 md:hidden">
                    <span className="text-[#FFD700] text-xl font-bold drop-shadow-md">
                      {positionLabel}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-yellow-400/50 bg-gradient-to-br from-purple-600/70 to-blue-500/70 flex items-center justify-center text-white font-semibold text-lg">
                        {badgeContent}
                      </div>
                      <span
                        className="text-white text-base font-semibold leading-tight truncate"
                        title={archetype.name}
                      >
                        {archetype.name}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-[60px_minmax(220px,1fr)_160px] md:gap-3 md:items-center md:px-6 md:py-4">
                    <div className="text-[#ffbf1f] relative right-2 text-2xl font-bold drop-shadow-md">
                      {positionLabel}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded border border-yellow-400/50 bg-gradient-to-br from-purple-600/30 to-blue-500/70 flex items-center justify-center text-yellow-500 font-semibold text-xl">
                        {badgeContent}
                      </div>
                      <span
                        className="text-white text-lg font-semibold truncate"
                        title={archetype.name}
                      >
                        {archetype.name}
                      </span>
                    </div>
                    <div className="text-blue-200 text-lg text-right">
                      {instanceLabel}
                    </div>
                  </div>

                  <div className="md:hidden text-left relative mx-5 grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
                    <span className="text-blue-300">Archetype</span>
                    <span
                      className="text-white text-right"
                      title={archetype.name}
                    >
                      {archetype.name}
                    </span>
                    <span className="text-blue-300">Instances</span>
                    <span className="text-blue-100 text-right">
                      {instanceLabel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex relative top-1 items-center justify-center gap-4 my-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 text-yellow-400 hover:text-yellow-300 disabled:text-yellow-400/30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-blue-300 text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 text-yellow-400 hover:text-yellow-300 disabled:text-yellow-400/30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </FramedContainer>
  );
};
