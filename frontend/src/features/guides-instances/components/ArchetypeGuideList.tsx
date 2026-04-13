import { useState, useCallback, memo } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { guideInstancesApi } from "../api/guideInstancesApi";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";
import { useAuth } from "@/features/auth";
import { GuidesGrid } from "@/shared/components/archetypeLists/GuidesGrid";
import { SortDropdown } from "@/shared/components/SortDropdown";
import { FramedContainer } from "@/layouts/FramedContainer";
import { GuideSearch } from "@/shared/components/GuideSearch";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useNavigate, Link } from "react-router-dom";
import type { GuideType } from "@/features/archetypes/types";

interface ArchetypeInstancesListProps {
  archetypeId: number;
  archetypeName: string;
  onSelectInstance: (instanceId: number) => void;
  onCreateInstance: () => void;
  guideType?: GuideType;
}

const ITEMS_PER_PAGE = 16;

/** Main container for the list of guides of the selected archetype, with back button, search, etc...
 * Supports filtering by guide type (COUNTER or DECK) via the guideType prop
 */

const ArchetypeGuideList = ({
  archetypeId,
  archetypeName,
  onSelectInstance,
  onCreateInstance,
  guideType,
}: ArchetypeInstancesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"likes" | "updated">("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const queryFn = useCallback(async () => {
    if (debouncedSearchQuery.trim()) {
      return guideInstancesApi.searchGuidesByArchetypeId(
        archetypeId,
        debouncedSearchQuery,
        sortBy,
        guideType,
      );
    }
    return guideInstancesApi.getGuidesByArchetypeId(
      archetypeId,
      sortBy,
      guideType,
    );
  }, [archetypeId, debouncedSearchQuery, sortBy, guideType]);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<GuideListItem[]>({
    queryKey: [
      "archetypeInstances",
      archetypeId,
      sortBy,
      debouncedSearchQuery,
      guideType,
    ],
    queryFn,
    enabled: Number.isFinite(archetypeId),
    staleTime: 5000, // 5 seconds - balance between freshness and performance
    placeholderData: keepPreviousData, // Keep previous data while fetching to avoid blink/unmount
  });

  const handleBackClick = () => {
    if (guideType === "COUNTER") {
      navigate("/guides?type=counter");
    } else if (guideType === "DECK") {
      navigate("/guides?type=deck");
    } else {
      navigate("/");
    }
  };

  const hasInstances = data.length > 0;
  const canCreateInstance = isAuthenticated;

  // Determine title based on guide type
  const pageTitle = guideType === "COUNTER" ? `Counter Guides` : `Deck Guides`;

  // Determine border color based on guide type
  const borderColorClass =
    guideType === "COUNTER" ? "border-orange-500/40" : "border-blue-500/40";

  // Calculate pagination info
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);
  const showingCount = hasInstances ? endIndex - startIndex : 0;

  return (
    <div className="flex flex-col items-start w-full">
      <FramedContainer
        contentClassName="flex flex-col w-full px-3 sm:px-4 md:px-[3%] pt-2 pb-6 gap-4"
        className={borderColorClass}
      >
        {/* Back button */}
        <div className="flex items-center justify-between relative top-3">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 py-1 text-blue-500 hover:underline active:text-blue-500/80 rounded-lg transition-colors text-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {!canCreateInstance && (
            <span className="text-sm text-blue-300">
              You must{" "}
              <Link
                to="/signin"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                sign in
              </Link>{" "}
              to create a guide
            </span>
          )}
        </div>

        {/* Title section */}
        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-baseline flex-wrap">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {archetypeName}:
            </span>

            <span className="text-white whitespace-nowrap ml-2 relative top-[2px]">
              {pageTitle}
            </span>
          </h1>
          {!isLoading && !error && hasInstances && (
            <p className="text-sm text-blue-300">
              Showing {showingCount} of {data.length} guides
            </p>
          )}
        </div>

        {/* Search, Sort, and Create button row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <div className="flex-1 max-w-56">
              <GuideSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search by title..."
              />
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {canCreateInstance && (
            <button
              onClick={onCreateInstance}
              className="flex px-3 py-1.5 items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
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
              guideType === "COUNTER"
                ? "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)"
                : "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)",
          }}
        />

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-blue-300 text-lg">Loading guides...</div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-red-400 text-lg">Failed to load guides</div>
            <div className="text-gray-400 text-sm">Please try again later</div>
          </div>
        )}

        {!isLoading && !error && !hasInstances && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-1">
            <div className="text-blue-300 text-lg text-center">
              {debouncedSearchQuery.trim()
                ? `No guides found matching "${debouncedSearchQuery}"`
                : "No guides created yet"}
            </div>
            {canCreateInstance && !debouncedSearchQuery.trim() && (
              <button
                onClick={onCreateInstance}
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors shadow-lg mt-4"
              >
                <Plus className="w-5 h-5" />
                <span>Be the first to create a guide!</span>
              </button>
            )}
            {!canCreateInstance && !debouncedSearchQuery.trim() && (
              <div className="text-blue-300 text-lg text-center mt-4">
                <Link
                  to="/signin"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Sign in
                </Link>
                <span> and be the first to create a guide!</span>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && hasInstances && (
          <GuidesGrid
            instances={data}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onSelectInstance={onSelectInstance}
            onPageChange={setCurrentPage}
            showArchetypeName={false}
          />
        )}
      </FramedContainer>
    </div>
  );
};

export const ArchetypeInstancesGuideList = memo(ArchetypeGuideList);
