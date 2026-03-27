import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Search, ArrowLeft } from "lucide-react";
import { FramedContainer } from "@/layouts/FramedContainer";
import { useRegisteredArchetypes } from "../hooks/useRegisteredArchetypes";
import { useNavigate } from "react-router-dom";
import type { GuideType } from "@/features/archetypes/types";

interface RegisteredArchetypesListProps {
  onSelectArchetype: (archetypeId: number) => void;
  guideType?: GuideType;
}

const ITEMS_PER_PAGE = 15;

/** List of archetypes that are registered (with at least 1 guide instance)
 * Can be filtered by guide type (COUNTER or DECK)
*/
export const RegisteredArchetypesList = ({
  onSelectArchetype,
  guideType,
}: RegisteredArchetypesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "instances">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, error } = useRegisteredArchetypes(sortBy, guideType);

  const toggleSortBy = () => {
    setSortBy((prev) => (prev === "recent" ? "instances" : "recent"));
    setCurrentPage(0);
  };

  const getPageTitle = () => {
    if (guideType === "COUNTER") return "All Counter Guides";
    if (guideType === "DECK") return "Deck Guides";
    return "Latest Registered Archetypes";
  };

  const getPageSubtitle = () => {
    if (guideType === "COUNTER") return "Archetypes with counter guides";
    if (guideType === "DECK") return "Archetypes with deck guides";
    return "• updated by the community";
  };

  const getBorderColor = () => {
    if (guideType === "COUNTER") return "border-orange-500/40";
    if (guideType === "DECK") return "border-blue-500/40";
    return "border-blue-500/40";
  };

  const getAccentGradient = () => {
    if (guideType === "COUNTER") return "linear-gradient(90deg, rgb(249 115 22) 20%, rgb(234 88 12) 100%)";
    if (guideType === "DECK") return "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)";
    return "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)";
  };

  const handleBackClick = () => {
    navigate("/");
  };

  // Get archetypes data safely
  const archetypes = data?.data.archetypes || [];

  // Filter archetypes by search query (useMemo must be before any conditional returns)
  const filteredArchetypes = useMemo(() => {
    if (!searchQuery.trim()) return archetypes;
    
    const lowerQuery = searchQuery.toLowerCase();
    return archetypes.filter((archetype) =>
      archetype.name.toLowerCase().includes(lowerQuery)
    );
  }, [archetypes, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-blue-300 text-lg">Loading archetypes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-red-400 text-lg">
            Failed to load registered archetypes
          </div>
        </div>
      </div>
    );
  }

  if (archetypes.length === 0) {
    return (
      <div className="flex flex-col items-start w-full">
        <FramedContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-blue-300 text-lg">
              No registered archetypes yet
            </div>
          </div>
        </FramedContainer>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredArchetypes.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArchetypes = filteredArchetypes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex flex-col items-start w-full">
      <FramedContainer
        aria-label="Latest registered archetypes"
        contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] pt-2 pb-6 gap-4"
      >
        <div className="flex items-center justify-between relative top-3 mb-2">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white max-[767px]:ml-2">
              {getPageTitle()}
            </h2>
            <span className="text-sm font-semibold text-blue-300 max-[767px]:ml-2">
              {getPageSubtitle()}
            </span>
          </div>

          <div className="relative w-56 mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search archetypes"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-900/80 border border-slate-700 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div
          className="w-full h-[2px]"
          style={{ background: getAccentGradient() }}
        />
        
        <div className={`rounded-lg overflow-hidden border ${getBorderColor()} bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm`}>
          <div
            className="w-full h-[2px]"
            style={{ background: getAccentGradient() }}
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
            {currentArchetypes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-400 text-center">
                  No archetypes found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              currentArchetypes.map((archetype, index) => {
                const positionLabel = startIndex + index + 1;
                const instanceCount = archetype.instance_count || 0;
                const itemBorderColor = guideType === "COUNTER" ? "border-orange-500/40" : "border-blue-500/40";

                return (
                  <button
                    key={archetype.id}
                    onClick={() => onSelectArchetype(archetype.id)}
                    className="group relative w-full overflow-hidden rounded transition-all hover:scale-[1.01] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-violet-950/50 via-purple-900/40 to-violet-950/50 border ${itemBorderColor} rounded`} />
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
              })
            )}
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
    </div>
  );
};
