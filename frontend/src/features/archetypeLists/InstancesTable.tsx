import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import instanceItemBg from "@/assets/background-item-instance.webp";

interface InstancesTableProps {
  instances: ArchetypeInstanceWithDetails[];
  currentPage: number;
  itemsPerPage: number;
  onSelectInstance: (userId: string, archetypeId: number) => void;
  onPageChange: (page: number) => void;
  showArchetypeName?: boolean;
}

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
      aria-label={showArchetypeName ? "User archetype instances" : "Archetype instances list"}
    >
      <div
        className="hidden md:grid grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] gap-3 mb-6 pb-3 border-b border-blue-600 bg-black/60 rounded-t-lg"
        role="row"
      >
        <div className="text-blue-300 font-semibold text-lg relative left-10" role="columnheader">
          ID
        </div>
        <div role="columnheader" aria-hidden="true" />
        <div className="text-blue-300 font-semibold text-lg relative left-24" role="columnheader">
          Title
        </div>
        <div className="text-blue-300 font-semibold text-lg" role="columnheader">
          {showArchetypeName ? "Archetype" : "Created by"}
        </div>
        <div className="text-blue-300 font-semibold text-lg relative right-10" role="columnheader">
          Last Updated
        </div>
        <div className="text-blue-300 font-semibold text-lg relative right-7" role="columnheader">
          Likes
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {currentInstances.map((instance, index) => {
          const isCurrentUser = user?.id === instance.userId;
          const positionLabel = startIndex + index + 1;

          const headerImage = instance.headerCardImageUrl ? (
            <img
              src={instance.headerCardImageUrl}
              alt={instance.headerCardName || "Header card"}
              className="absolute h-[57px] w-[44px] rounded border-none shadow-sm left-20"
            />
          ) : (
            <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
              <span className="text-slate-400 text-xs">-</span>
            </div>
          );

          const authorContent = showArchetypeName ? (
            <span className="text-white text-base md:text-lg">{instance.archetypeName}</span>
          ) : (
            <div className="flex items-center gap-2 relative">
              <span
                onClick={(e) => handleUserNameClick(e, instance.userId)}
                className="hover:text-blue-400 hover:underline transition-colors cursor-pointer"
              >
                {instance.userName}
              </span>
              {isCurrentUser && (
                <span className="text-[10px] uppercase tracking-wide bg-green-600/90 h- relative top-1 px-2 rounded">You</span>
              )}
            </div>
          );

          return (
            <button
              key={instance.id}
              onClick={() => onSelectInstance(instance.userId, instance.archetypeId)}
              className="group relative w-full overflow-hidden rounded-xl border border-blue-500/40 bg-[#070B29]/80 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <img
                src={instanceItemBg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/10 group-active:bg-black/40" />

              <div className="relative z-10 flex flex-col gap-3 p-4 md:p-0 md:gap-0">
                <div className="flex items-center gap-3 md:hidden">
                  <span className="text-[#FFD700] text-xl font-bold drop-shadow-md">{positionLabel}</span>
                  <div className="flex items-center justify-start flex-shrink-0">{headerImage}</div>
                  <span className="flex-1 min-w-0 text-white text-base font-semibold leading-tight truncate" title={instance.title}>
                    {instance.title}
                  </span>
                </div>

                <div className="hidden md:grid md:grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] md:gap-3 md:items-center md:px-6 md:py-5">
                  <div className="text-[#FFD700] text-2xl font-bold drop-shadow-md">{positionLabel}</div>
                  <div className="flex items-center justify-start h-full">{headerImage}</div>
                  <div className="text-white text-lg pr-2 truncate" title={instance.title}>
                    {instance.title}
                  </div>
                  <div className="text-white font-semibold text-lg flex items-center gap-2 relative left-5">{authorContent}</div>
                  <div className="text-blue-300 text-lg relative right-14">
                    {new Date(instance.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-green-400 text-lg flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    <span>{instance.likes}</span>
                  </div>
                </div>

                <div className="md:hidden grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
                  <span className="text-blue-300">{showArchetypeName ? "Archetype" : "Created by"}</span>
                  <div className="flex items-center justify-end gap-2 text-white">{authorContent}</div>
                  <span className="text-blue-300">Last Updated</span>
                  <span className="text-blue-100 text-right">
                    {new Date(instance.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-blue-300">Likes</span>
                  <span className="flex items-center justify-end gap-1 text-green-400">
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    <span>{instance.likes}</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 mt-6" aria-label="Pagination navigation">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="text-blue-300 text-sm font-medium" aria-current="page">
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
