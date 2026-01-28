import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";

interface ArchetypeInstancesListProps {
  archetypeId: number;
  archetypeName: string;
  onSelectInstance: (userId: string) => void;
  onCreateInstance: () => void;
}

const ITEMS_PER_PAGE = 10;

export const ArchetypeInstancesList = ({ 
  archetypeId, 
  archetypeName,
  onSelectInstance,
  onCreateInstance 
}: ArchetypeInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { isAuthenticated, user } = useAuth();
  
  const { data: instances, isLoading, error } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["archetypeInstances", archetypeId],
    queryFn: () => instanceApi.getInstancesByArchetypeId(archetypeId),
    enabled: !!archetypeId,
    staleTime: 0, // Always refetch to ensure likes are up to date
  });

  // Check if current user already has an instance
  const userHasInstance = instances?.some(instance => instance.userId === user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading instances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">Failed to load instances</div>
      </div>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-blue-300 text-lg">No guides created yet for {archetypeName}</div>
        {isAuthenticated && (
          <button
            onClick={onCreateInstance}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Be the first to create a guide!</span>
          </button>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(instances.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInstances = instances.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold text-white mb-2">
        {archetypeName}
      </h1>
      
      <div className="w-full flex items-center justify-between mb-4 px-[5%]">
        <h2 className="text-base font-semibold text-blue-400">
          All Guides ({instances.length})
        </h2>
        
        {isAuthenticated && !userHasInstance && (
          <button
            onClick={onCreateInstance}
            className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors shadow text-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Create</span>
          </button>
        )}
      </div>
      
      <div className="w-[90%] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl p-6">
        <div className="w-[95%] mx-auto">
          <div className="grid grid-cols-[60px_1fr_150px_100px] gap-4 mb-4 pb-3 border-b border-blue-600">
            <div className="text-blue-300 font-semibold text-sm">#</div>
            <div className="text-blue-300 font-semibold text-sm">Created by</div>
            <div className="text-blue-300 font-semibold text-sm">Last Updated</div>
            <div className="text-blue-300 font-semibold text-sm">Likes</div>
          </div>

          <div className="space-y-2">
            {currentInstances.map((instance, index) => {
              const isCurrentUser = user?.id === instance.userId;
              return (
                <button
                  key={instance.id}
                  onClick={() => onSelectInstance(instance.userId)}
                  className={`w-full grid grid-cols-[60px_1fr_150px_100px] gap-4 p-3 rounded transition-colors text-left ${
                    isCurrentUser 
                      ? 'bg-green-900 hover:bg-green-800 border border-green-600' 
                      : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  <div className="text-blue-200 text-sm">{startIndex + index + 1}</div>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    {instance.userName}
                    {isCurrentUser && (
                      <span className="text-xs bg-green-700 px-2 py-0.5 rounded">You</span>
                    )}
                  </div>
                  <div className="text-blue-300 text-sm">
                    {new Date(instance.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-green-400 text-sm flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    <span>{instance.likes}</span>
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
        </div>
      </div>
    </div>
  );
};
