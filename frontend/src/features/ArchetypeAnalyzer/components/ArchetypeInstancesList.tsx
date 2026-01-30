import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  instanceApi,
  type ArchetypeInstanceWithDetails,
} from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { InstancesTable } from "@/shared/components/archetypeLists/InstancesTable";
import { FramedContainer } from "@/layouts/FramedContainer";

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
  onCreateInstance,
}: ArchetypeInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const {
    data: instances,
    isLoading,
    error,
  } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["archetypeInstances", archetypeId],
    queryFn: () => instanceApi.getInstancesByArchetypeId(archetypeId),
    enabled: !!archetypeId,
    staleTime: 0,
  });

  // Validaciones centralizadas
  const hasInstances = !!instances && instances.length > 0;
  const userHasInstance =
    instances?.some((instance) => instance.userId === user?.id) ?? false;
  const canCreateInstance = isAuthenticated && !userHasInstance;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-300 text-lg">Loading instances...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg">Failed to load instances</div>
      </div>
    );
  }

  // Empty state (sin componente externo)
  if (!hasInstances) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-blue-300 text-lg">
          No guides created yet for {archetypeName}
        </div>

        {canCreateInstance && (
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

  // Normal state (hay instancias)
  return (
    <div className="flex flex-col items-start p-4 w-full">
      <FramedContainer contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] py-6 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-4 w-full">
          <h1 className="text-2xl font-bold text-white w-full sm:w-auto whitespace-normal sm:whitespace-nowrap">
            {archetypeName}
          </h1>

          <span className="text-base font-semibold text-blue-400 w-full sm:w-auto whitespace-nowrap">
            All Guides ({instances.length})
          </span>

          {canCreateInstance && (
            <button
              onClick={onCreateInstance}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors shadow text-sm"
            >
              <Plus className="w-3 h-3" />
              <span>Create</span>
            </button>
          )}
        </div>

        <div
          className="w-full h-1"
          style={{
            background: "linear-gradient(90deg, #ff6600 0%, #ffb347 100%)",
          }}
        />

        <InstancesTable
          instances={instances}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSelectInstance={(userId) => onSelectInstance(userId)}
          onPageChange={setCurrentPage}
          showArchetypeName={false}
        />
      </FramedContainer>
    </div>
  );
};
