import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";

interface UserInstancesListProps {
  userId: string;
  onSelectArchetype: (archetypeId: number, userId: string | null) => void;
}

const ITEMS_PER_PAGE = 10;

export const UserInstancesList = ({ userId, onSelectArchetype }: UserInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const { data: instances, isLoading, error } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["userInstances", userId],
    queryFn: () => instanceApi.getInstancesByUserId(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading user instances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">Failed to load user instances</div>
      </div>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">This user hasn't created any archetype instances yet</div>
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
      <h2 className="text-base font-semibold text-blue-400 mb-2 self-start ml-[5%]">
        {instances[0]?.userName}'s Archetype Instances
      </h2>
      
      <div className="w-[90%] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl p-6">
        <div className="w-[95%] mx-auto">
          <div className="grid grid-cols-[60px_1fr_150px_100px] gap-4 mb-4 pb-3 border-b border-blue-600">
            <div className="text-blue-300 font-semibold text-sm">#</div>
            <div className="text-blue-300 font-semibold text-sm">Archetype</div>
            <div className="text-blue-300 font-semibold text-sm">Last Updated</div>
            <div className="text-blue-300 font-semibold text-sm">Likes</div>
          </div>

          <div className="space-y-2">
            {currentInstances.map((instance, index) => (
              <button
                key={instance.id}
                onClick={() => onSelectArchetype(instance.archetypeId, instance.userId)}
                className="w-full grid grid-cols-[60px_1fr_150px_100px] gap-4 p-3 bg-blue-900 hover:bg-blue-800 rounded transition-colors text-left"
              >
                <div className="text-blue-200 text-sm">{startIndex + index + 1}</div>
                <div className="text-white font-medium text-sm">{instance.archetypeName}</div>
                <div className="text-blue-300 text-sm">
                  {new Date(instance.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-blue-300 text-sm">{instance.likes}</div>
              </button>
            ))}
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
