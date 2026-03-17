import { useState, useCallback, memo, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  instanceApi,
  type ArchetypeInstanceWithDetails,
} from "@/lib/http/instanceApi";
import { GuidesTable } from "@/shared/components/archetypeLists/GuidesTable";
import { GuideSearch } from "@/shared/components/GuideSearch";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface UserInstancesListProps {
  userId: string;
  onSelectArchetype: (archetypeId: number, instanceId: number) => void;
}

const ITEMS_PER_PAGE = 10;

const UserInstancesListComponent = ({
  userId,
  onSelectArchetype,
}: UserInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"likes" | "updated">("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset page to 0 when search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  // Reset page to 0 when sort changes
  const handleSortChange = (newSortBy: "likes" | "updated") => {
    setSortBy(newSortBy);
    setCurrentPage(0);
  };

  const queryFn = useCallback(async () => {
    if (debouncedSearchQuery.trim()) {
      return instanceApi.searchInstancesByUserId(
        userId,
        debouncedSearchQuery,
        sortBy,
      );
    }
    return instanceApi.getInstancesByUserId(userId, sortBy);
  }, [userId, debouncedSearchQuery, sortBy]);

  const {
    data: instances,
    isLoading,
    error,
  } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["userInstances", userId, sortBy, debouncedSearchQuery],
    queryFn,
    enabled: !!userId,
    staleTime: 5000,
    placeholderData: keepPreviousData,
  });

  // Adjust current page if it exceeds the total pages after data changes
  useEffect(() => {
    if (instances && instances.length > 0) {
      const totalPages = Math.ceil(instances.length / ITEMS_PER_PAGE);
      if (currentPage >= totalPages) {
        setCurrentPage(Math.max(0, totalPages - 1));
      }
    }
  }, [instances, currentPage]);

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
        <div className="text-red-400 text-lg">
          Failed to load user instances
        </div>
      </div>
    );
  }

  const userName =
    instances && instances.length > 0 ? instances[0]?.userName : "User";

  return (
    <div className="flex flex-col items-start w-full -mt-4">
      <div className="flex flex-col w-full px-2 sm:px-4 md:px-6 py-4 gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-1 text-left">
            {userName}'s Guides
          </h2>

          <div className="w-full sm:w-56">
            <GuideSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
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

        {!instances || instances.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-blue-300 text-lg">
              This user hasn't created any archetype instances yet
            </div>
          </div>
        ) : (
          <GuidesTable
            instances={instances}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onSelectInstance={(instanceId, archetypeId) =>
              onSelectArchetype(archetypeId, instanceId)
            }
            onPageChange={setCurrentPage}
            showArchetypeName={true}
            isProfilePage={true}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        )}
      </div>
    </div>
  );
};

export const UserInstancesList = memo(UserInstancesListComponent);
