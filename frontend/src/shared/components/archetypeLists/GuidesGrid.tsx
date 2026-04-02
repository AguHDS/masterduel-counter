import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Star, ThumbsUp, Eye } from "lucide-react";
import { type GuideListItem } from "@/lib/http/guideInstancesApi";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";

interface GuidesGridProps {
  instances: GuideListItem[];
  currentPage: number;
  itemsPerPage: number;
  onSelectInstance: (instanceId: number, archetypeId: number) => void;
  onPageChange: (page: number) => void;
  showArchetypeName?: boolean;
}

/** Grid for displaying guides as cards */
export const GuidesGrid = ({
  instances,
  currentPage,
  itemsPerPage,
  onSelectInstance,
  onPageChange,
  showArchetypeName = false,
}: GuidesGridProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleInstanceClick = (instanceId: number, archetypeId: number) => {
    onSelectInstance(instanceId, archetypeId);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push("...");
        for (let i = totalPages - 3; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {currentInstances.map((instance) => {
          const isCurrentUser = user?.id === instance.userId;
          const formattedDate = new Date(instance.createdAt).toLocaleDateString();

          return (
            <button
              key={instance.id}
              onClick={() => handleInstanceClick(instance.id, instance.archetypeId)}
              className="group relative w-full overflow-hidden rounded-xl border border-blue-500/40 bg-[#0a0e2e]/90 hover:border-blue-400/60 transition-colors hover:shadow-lg hover:shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {/* Card image header */}
              <div className="relative w-full h-48 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
                {instance.headerCardImageUrl ? (
                  <img
                    src={instance.headerCardImageUrl}
                    alt={instance.headerCardName || "Header card"}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No image</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e2e] via-transparent to-transparent opacity-60" />
              </div>

              {/* Card content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-white font-bold text-base leading-tight line-clamp-2 min-h-[2.5rem] text-left">
                  {instance.title}
                </h3>

                {/* Creator info */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400 text-xs">By</span>
                  <span
                    onClick={(e) => handleUserNameClick(e, instance.userId)}
                    className="text-blue-300 hover:text-blue-200 hover:underline transition-colors cursor-pointer truncate"
                    title={instance.userName}
                  >
                    {instance.userName}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-green-400 px-1.5 py-0.5 bg-green-400/10 rounded flex-shrink-0">
                      You
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-blue-500/20">
                  <div className="flex items-center gap-3 text-xs">
                    {/* Favorites */}
                    <div className="flex items-center gap-1 text-yellow-400" title="Favorites">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{instance.favorites}</span>
                    </div>
                    {/* Likes */}
                    <div className="flex items-center gap-1 text-green-400" title="Likes">
                      <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{instance.likes}</span>
                    </div>
                    {/* Views */}
                    <div className="flex items-center gap-1 text-blue-400" title="Views">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-semibold">{instance.views}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-400">
                    {formattedDate}
                  </div>
                </div>

                {/* Archetype name (if showing) */}
                {showArchetypeName && (
                  <div className="text-xs text-blue-300 truncate pt-1">
                    {instance.archetypeName}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2 mt-4"
          aria-label="Pagination navigation"
        >
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg disabled:text-blue-400/30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {getPageNumbers().map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-blue-300">
                  ...
                </span>
              );
            }

            const page = pageNum as number;
            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-blue-300 hover:text-blue-200 hover:bg-blue-500/10"
                }`}
                aria-label={`Go to page ${page + 1}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page + 1}
              </button>
            );
          })}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg disabled:text-blue-400/30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      )}
    </div>
  );
};
