import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { InstancesTable } from "./InstancesTable";

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
      
      <InstancesTable
        instances={instances}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onSelectInstance={(userId) => onSelectInstance(userId)}
        onPageChange={setCurrentPage}
        showArchetypeName={false}
      />
    </div>
  );
};
