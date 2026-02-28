import { useState, useCallback, memo } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  instanceApi,
  type ArchetypeInstanceWithDetails,
} from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { InstancesTable } from "@/shared/components/archetypeLists/InstancesTable";
import { ListFramedContainer } from "@/layouts/ListFramedContainer";
import { GuideSearch } from "@/shared/components/GuideSearch";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useNavigate, Link } from "react-router-dom";

interface ArchetypeInstancesListProps {
  archetypeId: number;
  archetypeName: string;
  onSelectInstance: (instanceId: number) => void;
  onCreateInstance: () => void;
}

const ITEMS_PER_PAGE = 10;

const ArchetypeInstancesListComponent = ({
  archetypeId,
  archetypeName,
  onSelectInstance,
  onCreateInstance,
}: ArchetypeInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"likes" | "updated">("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const queryFn = useCallback(async () => {
    if (debouncedSearchQuery.trim()) {
      return instanceApi.searchInstancesByArchetypeId(
        archetypeId,
        debouncedSearchQuery,
        sortBy,
      );
    }
    return instanceApi.getInstancesByArchetypeId(archetypeId, sortBy);
  }, [archetypeId, debouncedSearchQuery, sortBy]);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<ArchetypeInstanceWithDetails[]>({
    queryKey: ["archetypeInstances", archetypeId, sortBy, debouncedSearchQuery],
    queryFn,
    enabled: Number.isFinite(archetypeId),
    staleTime: 5000, // 5 seconds - balance between freshness and performance
    placeholderData: keepPreviousData, // Keep previous data while fetching to avoid blink/unmount
  });

  const handleBackClick = () => {
    navigate("/");
  };

  const hasInstances = data.length > 0;
  const canCreateInstance = isAuthenticated;

  if (isLoading) {
    return (
      <div className="flex flex-col items-start p-4 w-full">
        <ListFramedContainer
          contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] pt-2 pb-6 gap-4"
        >
          {/* Back button */}
          <div className="flex">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-blue-300 text-lg">Loading instances...</div>
          </div>
        </ListFramedContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start p-4 w-full">
        <ListFramedContainer
          contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] pt-2 pb-6 gap-4"
        >
          {/* Back button */}
          <div className="flex">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-400 text-lg">Failed to load instances</div>
          </div>
        </ListFramedContainer>
      </div>
    );
  }

  if (!hasInstances) {
    return (
      <div className="flex flex-col items-start p-4 w-full">
        <ListFramedContainer
          contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] pt-2 pb-6 gap-4"
        >
          {/* Back button */}
          <div className="flex">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center w-full justify-between gap-4">
            <h1 className="text-2xl relative top-[7px] font-bold text-white">
              {archetypeName}
            </h1>

            <div className="flex items-center gap-3 relative top-[7px]">
              <div className="w-56">
                <GuideSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search guides..."
                />
              </div>

              {canCreateInstance && (
                <button
                  onClick={onCreateInstance}
                  className="flex px-2 py-1 items-center bg-green-600 hover:bg-green-700 text-white rounded transition-colors shadow text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              )}
            </div>
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
              {debouncedSearchQuery.trim()
                ? `No guides found matching "${debouncedSearchQuery}"`
                : `No guides created yet for ${archetypeName}`}
            </div>
            {canCreateInstance && !debouncedSearchQuery.trim() && (
              <button
                onClick={onCreateInstance}
                className="flex items-center space-x-1 px-2 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Be the first to create a guide!</span>
              </button>
            )}
            {!canCreateInstance && !debouncedSearchQuery.trim() && (
              <div className="text-blue-300 text-lg text-center">
                <Link to="/signin" className="text-blue-400 hover:text-blue-300 underline">
                  Sign in
                </Link>
                <span> and be the first to create a guide!</span>
              </div>
            )}
          </div>
        </ListFramedContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start p-4 w-full">
      <ListFramedContainer
        contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[5%] pt-2 pb-6 gap-4"
      >
        {/* Back button */}
        <div className="flex relative top-3 right-3">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 px-3 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center w-full justify-between gap-4">
          <div className="flex mt-2 items-center gap-2 flex-1">
            <h1 className="text-2xl font-bold font-sans flex items-center">
              <span className="text-white max-[767px]:ml-2 mr-2">
                How to counter
              </span>

              <span className="relative top-[1px] bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {archetypeName}
              </span>
            </h1>
            <span className="text-base relative top-[4px] font-semibold text-white">
              -
            </span>
            <span className="text-base relative top-[4px] font-semibold text-blue-400">
              Guides ({data.length})
            </span>
          </div>

          <div className="flex items-center gap-3 relative top-[7px]">
            <div className="w-56">
              <GuideSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search guides..."
              />
            </div>

            {canCreateInstance && (
              <button
                onClick={onCreateInstance}
                className="flex px-2 py-1 items-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded transition-colors shadow text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            )}
          </div>
        </div>

        <InstancesTable
          instances={data}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSelectInstance={onSelectInstance}
          onPageChange={setCurrentPage}
          showArchetypeName={false}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </ListFramedContainer>
    </div>
  );
};

export const ArchetypeInstancesList = memo(ArchetypeInstancesListComponent);