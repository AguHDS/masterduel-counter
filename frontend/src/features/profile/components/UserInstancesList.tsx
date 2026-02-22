import { useState, useCallback, memo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { X } from "lucide-react";
import { instanceApi, type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { InstancesTable } from "@/shared/components/archetypeLists/InstancesTable";
import { FramedContainer } from "@/layouts/FramedContainer";
import { GuideSearch } from "@/shared/components/GuideSearch";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface UserInstancesListProps {
  userId: string;
  onSelectArchetype: (archetypeId: number, instanceId: number) => void;
}

const ITEMS_PER_PAGE = 10;

const UserInstancesListComponent = ({ userId, onSelectArchetype }: UserInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<'likes' | 'updated'>('updated');
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryFn = useCallback(async () => {
    if (debouncedSearchQuery.trim()) {
      return instanceApi.searchInstancesByUserId(userId, debouncedSearchQuery, sortBy);
    }
    return instanceApi.getInstancesByUserId(userId, sortBy);
  }, [userId, debouncedSearchQuery, sortBy]);

  const { data: instances, isLoading, error } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["userInstances", userId, sortBy, debouncedSearchQuery],
    queryFn,
    enabled: !!userId,
    staleTime: 5000,
    placeholderData: keepPreviousData,
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
    <div className="flex flex-col items-start w-full">
      <FramedContainer contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] py-6 gap-6">
        <div className="flex items-center justify-between w-full gap-4">
          <h2 className="text-2xl font-bold text-yellow-500 mb-1 text-left relative top-[7px]">
            {instances[0]?.userName}'s Guides
          </h2>

          <div className="w-56 relative top-[7px]">
            <GuideSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search guides..."
            />
          </div>
        </div>

        <div
          className="w-full h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)",
          }}
        />

        <InstancesTable
          instances={instances}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSelectInstance={(instanceId, archetypeId) => onSelectArchetype(archetypeId, instanceId)}
          onPageChange={setCurrentPage}
          showArchetypeName={true}
          isProfilePage={true}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </FramedContainer>
    </div>
  );
};

export const UserInstancesList = memo(UserInstancesListComponent);

interface FullScreenGuidesModalProps {
  userId: string;
  onClose: () => void;
  onSelectArchetype: (archetypeId: number, instanceId: number) => void;
}

export const FullScreenGuidesModal = ({ userId, onClose, onSelectArchetype }: FullScreenGuidesModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-yellow-500">All Guides</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <UserInstancesList userId={userId} onSelectArchetype={onSelectArchetype} />
        </div>
      </div>
    </div>
  );
};
