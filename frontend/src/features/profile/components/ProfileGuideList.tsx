import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { GuideSearch } from "@/shared/components/GuideSearch";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";
import { buildGuidePath } from "@/lib/config/urlHelpers";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";

interface FavoritedGuidesListProps {
  guides: GuideListItem[];
  onRemoveFavorite?: (guideId: number, archetypeId: number) => void;
  userRole?: string;
  showFavoriteButton?: boolean;
  title?: string;
  searchPlaceholder?: string;
}

const ITEMS_PER_PAGE = 10;

/** Guide list for Guides and Favorites tabs in user profile */
export const ProfileGuideList = ({
  guides,
  onRemoveFavorite,
  userRole,
  showFavoriteButton = true,
  title = "Favorite Guides",
  searchPlaceholder = "Search favorites...",
}: FavoritedGuidesListProps) => {
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [guideTypeFilter, setGuideTypeFilter] = useState<
    "all" | "counter" | "deck"
  >("all");

  const typeFilteredGuides =
    guideTypeFilter === "all"
      ? guides
      : guides.filter(
          (guide) =>
            guide.guideType ===
            (guideTypeFilter === "counter" ? "COUNTER" : "DECK"),
        );

  // Filter guides by search query (title only)
  const filteredGuides = searchQuery.trim()
    ? typeFilteredGuides.filter((guide) =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : typeFilteredGuides;

  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGuides = filteredGuides.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to page 0 when searching
  };

  const handleGuideTypeChange = (value: "all" | "counter" | "deck") => {
    setGuideTypeFilter(value);
    setCurrentPage(0);
  };

  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    guideId: number,
    archetypeId: number,
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

  const handleGuideClick = (guide: GuideListItem) => {
    if (guide.isDraft) {
      // Draft guides navigate to the creation page for that archetype
      navigate(`/archetypes/${guide.archetypeId}/instances/new?type=${guide.guideType === "COUNTER" ? "counter" : "deck"}`);
      return;
    }
    navigate(
      buildGuidePath({
        guideId: guide.id,
        archetypeId: guide.archetypeId,
        archetypeName: guide.archetypeName,
        userName: guide.userName,
        guideType: guide.guideType,
      }),
    );
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
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
          <Star className="w-20 h-20 mx-auto mb-6 opacity-30 text-yellow-500 relative" />
        </div>
        <p className="text-xl font-bold text-gray-300 mb-2">
          No favorited guides yet
        </p>
        <p className="text-sm text-gray-500">
          Explore guides and mark them as favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between gap-3">
        <div className="w-full sm:w-72">
          <h3 className="text-lg font-semibold text-amber-400">
            {title}
            {userRole === "user" && showFavoriteButton ? " (Max. 20)" : ""}
          </h3>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <div className="w-full sm:w-auto">
            <select
              value={guideTypeFilter}
              onChange={(event) =>
                handleGuideTypeChange(
                  event.target.value as "all" | "counter" | "deck",
                )
              }
              className="h-[32px] w-full sm:w-auto sm:min-w-[102px] rounded-md border border-[#4a4070]/70 bg-[#1a1545]/90 px-3 text-sm font-semibold text-blue-200 outline-none  focus:border-cyan-400"
              aria-label="Filter guides by type"
            >
              <option value="all">All</option>
              <option value="counter">Counter</option>
              <option value="deck">Deck</option>
            </select>
          </div>
          <div className="w-full sm:w-72">
            <GuideSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
      </div>

      {filteredGuides.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-[#1a1530]/60 rounded-lg border border-[#4a4070]/40">
          <p className="text-lg font-semibold text-gray-300">
            {searchQuery
              ? "No favorites match your search"
              : "No favorited guides"}
          </p>
          {searchQuery && (
            <p className="text-sm mt-2 text-gray-500">
              Try a different search term
            </p>
          )}
        </div>
      ) : (
        <>
          {/* List of guides - Table style */}
          <div className="space-y-1">
            {currentGuides.map((guide, index) => (
              <div
                key={guide.id}
                className="relative group"
                onClick={() => handleGuideClick(guide)}
              >
                {/* Glow border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 rounded-lg opacity-0 group-hover:opacity-100 blur-sm" />

                {/* Main row — draft guides get a grey/muted style */}
                <div className={`relative rounded-lg border-2 cursor-pointer overflow-hidden ${
                  guide.isDraft
                    ? "bg-gradient-to-r from-slate-800/80 via-slate-700/50 to-slate-800/80 border-slate-600/60 group-hover:border-slate-500/80 opacity-80"
                    : "bg-gradient-to-r from-[#1a1545]/95 via-purple-950/60 to-[#1a1545]/95 border-[#3d3470]/70 group-hover:border-blue-800/80"
                }`}>
                  {/* Desktop Layout */}
                  <div className="hidden xl:flex items-center gap-4 p-3">
                    {/* ID Number */}
                    <div className="flex-shrink-0 w-10 text-center">
                      <span className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                        {startIndex + index + 1}
                      </span>
                    </div>

                    {/* Card Image */}
                    <div className="flex-shrink-0">
                      {guide.headerCardImageUrl ? (
                        <img
                          src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { size: 'thumbnail' })}
                          alt={guide.headerCardName || "Card"}
                          className={`h-[65px] w-[65px] object-cover rounded border-2 shadow-lg ${guide.isDraft ? "border-slate-500/60 grayscale" : "border-cyan-500/60 group-hover:border-cyan-400"}`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-[65px] h-[65px] bg-[#2a2550] rounded border-2 border-[#4a4070] flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Card</span>
                        </div>
                      )}
                    </div>

                    {/* Title + Draft badge */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h4 className={`text-base font-bold truncate ${guide.isDraft ? "text-slate-300 group-hover:text-slate-100" : "text-white group-hover:text-cyan-300"}`}>
                        {guide.title}
                      </h4>
                      {guide.isDraft && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-600/70 border border-slate-500/60 text-slate-300 text-xs font-semibold">
                          <FileText className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Archetype */}
                    <div className="flex-shrink-0 w-40">
                      <p className={`text-sm font-semibold truncate ${guide.isDraft ? "text-slate-400" : "text-white"}`}>
                        {guide.archetypeName}
                      </p>
                    </div>

                    {/* Last Update */}
                    <div className="flex-shrink-0 w-28 text-center hidden lg:block">
                      <span className="text-sm text-gray-300">
                        {new Date(guide.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Stats — hidden for drafts */}
                    {!guide.isDraft && (
                      <div className="flex-shrink-0 w-[180px] text-right">
                        <div className="inline-flex items-center gap-3 text-sm font-bold">
                          <span className="inline-flex items-center gap-1 text-purple-400">
                            <Eye className="h-4 w-4" /> {guide.views}
                          </span>
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <span className="text-lg">↑</span> {guide.likes}
                          </span>
                          <span className="inline-flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4" /> {guide.favorites}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Remove Favorite Button */}
                    {showFavoriteButton && onRemoveFavorite && !guide.isDraft && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) =>
                            handleRemoveFavorite(e, guide.id, guide.archetypeId)
                          }
                          disabled={removingId === guide.id}
                          className="p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove from favorites"
                        >
                          <span className="text-yellow-600 hover:text-yellow-500">Remove</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Layout */}
                  <div className="xl:hidden p-3">
                    <div className="flex gap-3">
                      {/* ID Number + Card Image */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                          {startIndex + index + 1}
                        </span>
                        {guide.headerCardImageUrl ? (
                          <img
                            src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { size: 'thumbnail' })}
                            alt={guide.headerCardName || "Card"}
                            className={`h-[55px] w-[55px] object-cover rounded border-2 shadow-lg ${guide.isDraft ? "border-slate-500/60 grayscale" : "border-cyan-500/60 group-hover:border-cyan-400"}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-[55px] h-[55px] bg-[#2a2550] rounded border-2 border-[#4a4070] flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No Card
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        {/* Title + Draft badge */}
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold line-clamp-2 ${guide.isDraft ? "text-slate-300 group-hover:text-slate-100" : "text-white group-hover:text-cyan-300"}`}>
                            {guide.title}
                          </h4>
                          {guide.isDraft && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-600/70 border border-slate-500/60 text-slate-300 text-xs font-semibold">
                              <FileText className="h-2.5 w-2.5" />
                              Draft
                            </span>
                          )}
                        </div>

                        {/* Archetype */}
                        <p className={`text-xs font-semibold truncate ${guide.isDraft ? "text-slate-400" : "text-cyan-400/80"}`}>
                          {guide.archetypeName}
                        </p>

                        {/* Bottom Info */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-gray-400">
                            {new Date(guide.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "2-digit",
                              },
                            )}
                          </span>
                          {!guide.isDraft && (
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 text-green-400 font-bold">
                                <span className="text-base">↑</span> {guide.likes}
                              </span>
                              <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
                                <Star className="h-3.5 w-3.5" /> {guide.favorites}
                              </span>
                              <span className="inline-flex items-center gap-1 text-violet-300 font-bold">
                                <Eye className="h-3.5 w-3.5" /> {guide.views}
                              </span>
                              {showFavoriteButton && onRemoveFavorite && (
                                <button
                                  onClick={(e) =>
                                    handleRemoveFavorite(
                                      e,
                                      guide.id,
                                      guide.archetypeId,
                                    )
                                  }
                                  disabled={removingId === guide.id}
                                  className="p-1 hover:bg-yellow-500/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Remove from favorites"
                                >
                                  <Star className="w-4 h-4 text-yellow-400" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="group relative p-3 bg-gradient-to-r from-blue-600/60 to-blue-700/60 hover:from-blue-500/80 hover:to-blue-600/80 disabled:from-gray-700/40 disabled:to-gray-800/40 disabled:cursor-not-allowed rounded-lg border-2 border-blue-500/40 hover:border-blue-400/60 disabled:border-gray-600/30 shadow-lg hover:shadow-blue-500/30 disabled:shadow-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-white group-disabled:text-gray-500" />
              </button>

              <div className="px-6 py-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg border-2 border-slate-600/50 shadow-lg">
                <span className="text-gray-200 font-bold text-sm">
                  Page <span className="text-cyan-400">{currentPage + 1}</span>{" "}
                  of <span className="text-cyan-400">{totalPages}</span>
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="group relative p-3 bg-gradient-to-r from-blue-600/60 to-blue-700/60 hover:from-blue-500/80 hover:to-blue-600/80 disabled:from-gray-700/40 disabled:to-gray-800/40 disabled:cursor-not-allowed rounded-lg border-2 border-blue-500/40 hover:border-blue-400/60 disabled:border-gray-600/30 shadow-lg hover:shadow-blue-500/30 disabled:shadow-none"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5 text-white group-disabled:text-gray-500" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Support Message - Only for role "user" */}
      {onRemoveFavorite && userRole === "user" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1545]/60 via-[#1e1850]/60 to-[#1a1545]/60 rounded-lg border-2 border-[#3d3470]/50 text-center">
          <p className="text-sm text-gray-300">
            Need more space?{" "}
            <a
              href="https://www.paypal.com/paypalme/ponyrosa?locale.x=es_XC&country.x=AR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold "
            >
              Support us
            </a>{" "}
            and gain unlimited favorite guides space!
          </p>
        </div>
      )}
    </div>
  );
};
