import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { InstancesTable } from "@/features/ArchetypeAnalyzer/components/InstancesTable";

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

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-base font-semibold text-blue-400 mb-2 self-start ml-[5%]">
        {instances[0]?.userName}'s Archetype Instances
      </h2>
      
      <InstancesTable
        instances={instances}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onSelectInstance={(userId, archetypeId) => onSelectArchetype(archetypeId, userId)}
        onPageChange={setCurrentPage}
        showArchetypeName={true}
      />
    </div>
  );
};
