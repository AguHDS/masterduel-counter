import { useState, memo } from "react";
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

interface AllGuidesListProps {
  onSelectInstance: (instanceId: number, archetypeId: number) => void;
  onCreateGuide: () => void;
  guideType?: GuideType;
}

const ITEMS_PER_PAGE = 16;

/** Main container for the list of all guides of a given type, with back button, search, etc... */
const AllGuidesList = ({
  onSelectInstance,
  onCreateGuide,
  guideType,
}: AllGuidesListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<"likes" | "updated">("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<GuideListItem[]>({
    queryKey: ["allGuides", sortBy, debouncedSearchQuery, guideType],
    queryFn: () =>
      guideInstancesApi.getAllGuides(
        sortBy,
        guideType,
        debouncedSearchQuery.trim() || undefined,
      ),
    staleTime: 5000,
    placeholderData: keepPreviousData,
  });

  const handleBackClick = () => {
    navigate("/");
  };

  const hasGuides = data.length > 0;
  const canCreate = isAuthenticated;

  const pageTitle = guideType === "COUNTER" ? "All Counter Guides" : "All Deck Guides";
  const borderColorClass = guideType === "COUNTER" ? "border-orange-500/40" : "border-blue-500/40";

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);
  const showingCount = hasGuides ? endIndex - startIndex : 0;

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
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {!canCreate && (
            <span className="text-sm text-blue-300">
              You must{" "}
              <Link to="/signin" className="text-blue-400 hover:text-blue-300 underline">
                sign in
              </Link>{" "}
              to create a guide
            </span>
          )}
        </div>

        {/* Title section */}
        <div className="flex flex-col gap-2 mt-2">
          <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
          {!isLoading && !error && hasGuides && (
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
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(0);
                }}
                placeholder="Search by title or archetype..."
              />
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {canCreate && (
            <button
              onClick={onCreateGuide}
              className="flex px-3 py-1.5 items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create</span>
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

        {!isLoading && !error && !hasGuides && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-1">
            <div className="text-blue-300 text-lg text-center">
              {debouncedSearchQuery.trim()
                ? `No guides found matching "${debouncedSearchQuery}"`
                : "No guides created yet"}
            </div>
            {canCreate && !debouncedSearchQuery.trim() && (
              <button
                onClick={onCreateGuide}
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors shadow-lg mt-4"
              >
                <Plus className="w-5 h-5" />
                <span>Be the first to create a guide!</span>
              </button>
            )}
            {!canCreate && !debouncedSearchQuery.trim() && (
              <div className="text-blue-300 text-lg text-center mt-4">
                <Link to="/signin" className="text-blue-400 hover:text-blue-300 underline">
                  Sign in
                </Link>
                <span> and be the first to create a guide!</span>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && hasGuides && (
          <GuidesGrid
            instances={data}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onSelectInstance={onSelectInstance}
            onPageChange={setCurrentPage}
            showArchetypeName={true}
          />
        )}
      </FramedContainer>
    </div>
  );
};

export const AllGuidesListView = memo(AllGuidesList);
