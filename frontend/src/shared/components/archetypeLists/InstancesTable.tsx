import type { MouseEvent } from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import instanceItemBg from "@/assets/Bluebackground_elements.webp";

interface InstancesTableProps {
  instances: ArchetypeInstanceWithDetails[];
  currentPage: number;
  itemsPerPage: number;
  onSelectInstance: (instanceId: number, archetypeId: number) => void;
  onPageChange: (page: number) => void;
  showArchetypeName?: boolean;
}

const MAX_CHARS_TITLE = 45;

export const InstancesTable = ({
  instances,
  currentPage,
  itemsPerPage,
  onSelectInstance,
  onPageChange,
  showArchetypeName = false,
}: InstancesTableProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredInstance, setHoveredInstance] = useState<number | null>(null);

  const totalPages = Math.ceil(instances.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstances = instances.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    onPageChange(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1));
  };

  const handleUserNameClick = (e: MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <div
      className="w-full"
      role="table"
      aria-label={
        showArchetypeName
          ? "User archetype instances"
          : "Archetype instances list"
      }
    >
      <div
        className="hidden md:grid grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] gap-3 mb-6 pb-3 border-b border-blue-600 bg-black/60 rounded-t-lg"
        role="row"
      >
        <div
          className="text-blue-300 font-semibold text-lg relative left-10"
          role="columnheader"
        >
          ID
        </div>
        <div role="columnheader" aria-hidden="true" />
        <div
          className="text-blue-300 font-semibold text-lg relative left-24"
          role="columnheader"
        >
          Title
        </div>
        <div
          className="text-blue-300 font-semibold text-lg relative left-32"
          role="columnheader"
        >
          {showArchetypeName ? "Archetype" : "Created by"}
        </div>
        <div
          className="text-blue-300 font-semibold text-lg relative left-9"
          role="columnheader"
        >
          Last Updated
        </div>
        <div
          className="text-blue-300 font-semibold text-lg relative right-7"
          role="columnheader"
        >
          Likes
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        {currentInstances.map((instance, index) => {
          const isCurrentUser = user?.id === instance.userId;
          const positionLabel = startIndex + index + 1;
          const formattedDate = new Date(instance.updatedAt).toLocaleDateString();
          const truncatedTitle = instance.title.length > MAX_CHARS_TITLE
            ? instance.title.slice(0, MAX_CHARS_TITLE) + "…"
            : instance.title;

          return (
            <button
              key={instance.id}
              onClick={() =>
                onSelectInstance(instance.id, instance.archetypeId)
              }
              onMouseEnter={() => setHoveredInstance(instance.id)}
              onMouseLeave={() => setHoveredInstance(null)}
              className="group relative w-full overflow-hidden rounded-xl border border-blue-500/40 bg-[#070B29]/80 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <img
                src={instanceItemBg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full pointer-events-none select-none"
              />
              <div className="absolute inset-0 z-10 pointer-events-none mix-blend-normal transition-colors duration-200 group-hover:bg-[#0b1546]/80 group-active:bg-[#030512]/95" />

              {/* Tooltip */}
              {hoveredInstance === instance.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 text-white text-sm rounded-lg shadow-lg border border-blue-500/50 whitespace-nowrap pointer-events-none z-20">
                  {instance.title}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900"></div>
                </div>
              )}

              <div className="relative z-10 flex flex-col gap-3 p-4 md:p-0 md:gap-0">
                {/* Mobile Layout - Column Format */}
                <div className="flex flex-col gap-3 md:hidden">
                  {/* Header row with ID and image */}
                  <div className="flex items-center gap-3">
                    <span className="text-[#FFD700] text-xl font-bold drop-shadow-md flex-shrink-0">
                      #{positionLabel}
                    </span>
                    {instance.headerCardImageUrl ? (
                      <img
                        src={instance.headerCardImageUrl}
                        alt={instance.headerCardName || "Header card"}
                        className="h-[55px] w-[55px] rounded border-none shadow-sm flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-[55px] h-[55px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-400 text-xs">-</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-green-400" aria-hidden="true" />
                      <span className="text-green-400 text-base font-semibold">{instance.likes}</span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="w-full">
                    <h3 className="text-white text-base font-bold leading-tight break-words">
                      {instance.title}
                    </h3>
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-300 font-medium min-w-[90px]">
                        {showArchetypeName ? "Archetype:" : "Created by:"}
                      </span>
                      <div className="flex items-center gap-1.5 flex-1">
                        {showArchetypeName ? (
                          <span className="text-white break-words">{instance.archetypeName}</span>
                        ) : (
                          <>
                            <span
                              onClick={(e) => handleUserNameClick(e, instance.userId)}
                              className="text-white hover:text-blue-400 hover:underline transition-colors cursor-pointer break-words"
                            >
                              {instance.userName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-green-400 px-1.5 py-0.5 bg-green-400/10 rounded flex-shrink-0">
                                You
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-300 font-medium min-w-[90px]">Updated:</span>
                      <span className="text-blue-100">{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] md:gap-3 md:items-center md:px-6 md:py-5">
                  <div className="text-[#ffbf1f] relative right-2 text-2xl font-bold drop-shadow-md">
                    {positionLabel}
                  </div>
                  <div className="flex items-center justify-start h-full">
                    {instance.headerCardImageUrl ? (
                      <img
                        src={instance.headerCardImageUrl}
                        alt={instance.headerCardName || "Header card"}
                        className="absolute left-25 bottom-3 h-[50px] w-[50px] rounded border-none shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                        <span className="text-slate-400 text-xs">-</span>
                      </div>
                    )}
                  </div>
                  <div
                    className="text-white relative font-bold text-[16px] pr-2 whitespace-nowrap"
                    title={instance.title}
                  >
                    {truncatedTitle}
                  </div>
                  <div className="text-white font-semibold text-lg flex items-center gap-2 relative left-5">
                    {showArchetypeName ? (
                      <span className="text-white text-base md:text-lg">
                        {instance.archetypeName}
                      </span>
                    ) : (
                      <>
                        <span
                          onClick={(e) => handleUserNameClick(e, instance.userId)}
                          className="hover:text-blue-400 hover:underline transition-colors cursor-pointer relative left-28"
                        >
                          {instance.userName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-green-400 relative left-[105px] top-[3px] px-2 rounded">
                            You
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-blue-300 text-lg relative right-15">
                    {formattedDate}
                  </div>
                  <div className="text-green-400 text-lg flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    <span>{instance.likes}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-4 mt-6"
          aria-label="Pagination navigation"
        >
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <span
            className="text-blue-300 text-sm font-medium"
            aria-current="page"
          >
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Go to next page"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};
