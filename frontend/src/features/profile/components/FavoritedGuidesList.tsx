import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { GuideSearch } from "@/shared/components/GuideSearch";

interface FavoritedGuide {
  id: number;
  userId: string;
  userName: string;
  archetypeId: number;
  archetypeName: string;
  title: string;
  headerCardId: number | null;
  headerCardName: string | null;
  headerCardImageUrl: string | null;
  headerCardImageUrlSmall: string | null;
  headerCardImageUrlCropped: string | null;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface FavoritedGuidesListProps {
  guides: FavoritedGuide[];
  onRemoveFavorite?: (guideId: number, archetypeId: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const FavoritedGuidesList = ({
  guides,
  onRemoveFavorite,
}: FavoritedGuidesListProps) => {
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter guides by search query (title only)
  const filteredGuides = searchQuery.trim()
    ? guides.filter((guide) =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGuides = filteredGuides.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to page 0 when searching
  };

  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    guideId: number,
    archetypeId: number
  ) => {
    e.stopPropagation();
    if (!onRemoveFavorite) return;

    setRemovingId(guideId);
    try {
      await onRemoveFavorite(guideId, archetypeId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleGuideClick = (archetypeId: number, guideId: number) => {
    navigate(`/archetype/${archetypeId}/instance/${guideId}`);
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  if (guides.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No favorited guides yet</p>
        <p className="text-sm mt-2">
          Explore guides and mark them as favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <GuideSearch
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search favorites..."
          />
        </div>
      </div>

      {filteredGuides.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-lg">
            {searchQuery ? "No favorites match your search" : "No favorited guides"}
          </p>
        </div>
      ) : (
        <>
          {/* List of guides */}
          <div className="space-y-3">
            {currentGuides.map((guide) => (
              <div
                key={guide.id}
                className="relative bg-gradient-to-r from-slate-800 to-slate-800/90 rounded-lg p-4 hover:from-slate-700 hover:to-slate-700/90 transition-all duration-300 cursor-pointer group border-2 border-slate-600/50 hover:border-cyan-500/60 shadow-lg"
                onClick={() => handleGuideClick(guide.archetypeId, guide.id)}
              >
            <div className="flex items-center gap-4">
              {/* Header Card Image */}
              {guide.headerCardImageUrl ? (
                <img
                  src={guide.headerCardImageUrl}
                  alt={guide.headerCardName || "Card"}
                  className="h-[80px] w-[80px] object-cover rounded-lg border-2 border-yellow-500 shadow-md flex-shrink-0 group-hover:border-cyan-400 transition-colors"
                />
              ) : (
                <div className="w-[80px] h-[80px] bg-slate-700/80 rounded-lg border-2 border-slate-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-400 text-sm">No Card</span>
                </div>
              )}

              {/* Guide Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate mb-1">
                  {guide.title}
                </h4>
                <p className="text-sm text-yellow-400 font-semibold truncate mb-2">
                  {guide.archetypeName}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  <span className="text-slate-400">by <span className="text-gray-200 font-medium">{guide.userName}</span></span>
                  <span className="flex items-center gap-1 text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">
                    ↑ {guide.likes}
                  </span>
                  <span className="text-slate-400">{new Date(guide.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Remove Favorite Button */}
              {onRemoveFavorite && (
                <button
                  onClick={(e) =>
                    handleRemoveFavorite(e, guide.id, guide.archetypeId)
                  }
                  disabled={removingId === guide.id}
                  className="flex-shrink-0 text-yellow-400 hover:text-yellow-500 hover:scale-110 transition-all disabled:opacity-50 p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg"
                  title="Remove from favorites"
                >
                  <Star
                    className={`w-6 h-6 fill-yellow-400 ${
                      removingId === guide.id ? "animate-pulse" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 bg-blue-600/50 hover:bg-blue-600/70 disabled:bg-gray-600/30 disabled:cursor-not-allowed rounded transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-300 font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 bg-blue-600/50 hover:bg-blue-600/70 disabled:bg-gray-600/30 disabled:cursor-not-allowed rounded transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
};
