import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { InstancesTable } from "@/shared/components/archetypeLists/InstancesTable";
import { FramedContainer } from "@/layouts/FramedContainer";

interface UserInstancesListProps {
  userId: string;
  onSelectArchetype: (archetypeId: number, instanceId: number) => void;
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
    <div className="flex flex-col items-center p-8 w-full">
      <h2 className="text-2xl font-bold text-yellow-500 mb-3 text-center">
        {instances[0]?.userName}'s Guides
      </h2>

      <FramedContainer contentClassName="px-3 sm:px-4 md:px-[5%] py-4">
        <InstancesTable
          instances={instances}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSelectInstance={(instanceId, archetypeId) => onSelectArchetype(archetypeId, instanceId)}
          onPageChange={setCurrentPage}
          showArchetypeName={true}
        />
      </FramedContainer>
    </div>
  );
};
