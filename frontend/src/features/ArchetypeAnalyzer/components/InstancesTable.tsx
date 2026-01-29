import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";

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

  const handleUserNameClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <section className="w-[90%] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl p-6" aria-label={showArchetypeName ? "User archetype instances" : "Archetype instances list"}>
      <div className="w-[95%] mx-auto">
        <div className="grid grid-cols-[60px_40px_1fr_1fr_150px_100px] gap-3 mb-4 pb-3 border-b border-blue-600" role="row">
          <div className="text-blue-300 font-semibold text-sm" role="columnheader">#</div>
          <div role="columnheader"></div>
          <div className="text-blue-300 font-semibold text-sm" role="columnheader">Title</div>
          <div className="text-blue-300 font-semibold text-sm" role="columnheader">
            {showArchetypeName ? "Archetype" : "Created by"}
          </div>
          <div className="text-blue-300 font-semibold text-sm" role="columnheader">Last Updated</div>
          <div className="text-blue-300 font-semibold text-sm" role="columnheader">Likes</div>
        </div>

        <div className="space-y-2">
          {currentInstances.map((instance, index) => {
            const isCurrentUser = user?.id === instance.userId;
            return (
              <button
                key={instance.id}
                onClick={() => onSelectInstance(instance.userId, instance.archetypeId)}
                className={`w-full grid grid-cols-[60px_40px_1fr_1fr_150px_100px] gap-3 py-2 px-3 rounded transition-colors text-left items-center min-h-12 ${
                  isCurrentUser
                    ? "bg-green-900 hover:bg-green-800 border border-green-600"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                <div className="text-blue-200 text-sm">{startIndex + index + 1}</div>
                <div className="flex items-center justify-start h-full">
                  {instance.headerCardImageUrl ? (
                    <img
                      src={instance.headerCardImageUrl}
                      alt={instance.headerCardName || "Header card"}
                      className="h-9 w-auto object-contain rounded border border-blue-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-6 h-9 bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-500 text-[10px]">-</span>
                    </div>
                  )}
                </div>
                <div className="text-white text-sm pr-2 truncate" style={{ maxWidth: '180px' }} title={instance.title}>
                  {instance.title.length > 25 ? instance.title.slice(0, 25) + '...' : instance.title}
                </div>
                <div className="text-white font-medium text-sm flex items-center gap-2">
                  {showArchetypeName ? (
                    instance.archetypeName
                  ) : (
                    <>
                      <span
                        onClick={(e) => handleUserNameClick(e, instance.userId)}
                        className="hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                      >
                        {instance.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs bg-green-700 px-2 py-0.5 rounded">You</span>
                      )}
                    </>
                  )}
                </div>
                <div className="text-blue-300 text-sm">
                  {new Date(instance.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-green-400 text-sm flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" aria-hidden="true" />
                  <span>{instance.likes}</span>
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
    </section>
  );
};
