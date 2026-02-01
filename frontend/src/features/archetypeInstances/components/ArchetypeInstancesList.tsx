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
  onSelectInstance: (instanceId: number) => void;
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
  const { isAuthenticated } = useAuth();

  const {
    data = [], // ← nunca undefined
    isLoading,
    error,
  } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["archetypeInstances", archetypeId],
    queryFn: () => instanceApi.getInstancesByArchetypeId(archetypeId),
    enabled: Number.isFinite(archetypeId),
    staleTime: 0,
  });

  const hasInstances = data.length > 0;
  const canCreateInstance = isAuthenticated;

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

  if (!hasInstances) {
    return (
      <div className="flex flex-col items-start p-4 w-full">
        <FramedContainer contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] py-6 gap-6">
          <div className="flex items-center w-full justify-between gap-4">
            <h1 className="text-2xl relative top-[7px] font-bold text-white">
              {archetypeName}
            </h1>

            {canCreateInstance && (
              <button
                onClick={onCreateInstance}
              className="flex relative top-[7px] px-2 py-1 items-center bg-green-600 hover:bg-green-700 text-white rounded transition-colors shadow text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            )}
          </div>

          <div
            className="w-full h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)",
            }}
          />

          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="text-blue-300 text-lg text-center">
              No guides created yet for {archetypeName}
            </div>
            {canCreateInstance && (
              <button
                onClick={onCreateInstance}
                className="flex items-center space-x-1 px-2 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Be the first to create a guide!</span>
              </button>
            )}
          </div>
        </FramedContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start p-4 w-full">
      <FramedContainer contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] py-6 gap-6">
        <div className="flex items-center w-full justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl relative top-[7px] font-bold text-white">
              {archetypeName} •
            </h1>

            <span className="text-base relative top-[10px] font-semibold text-blue-400">
              Guides ({data.length})
            </span>
          </div>

          {canCreateInstance && (
            <button
              onClick={onCreateInstance}
              className="flex relative top-[7px] px-2 py-1 items-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded transition-colors shadow text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          )}
        </div>

        <div
          className="w-full h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)",
          }}
        />

        <InstancesTable
          instances={data}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSelectInstance={onSelectInstance}
          onPageChange={setCurrentPage}
          showArchetypeName={false}
        />
      </FramedContainer>
    </div>
  );
};
