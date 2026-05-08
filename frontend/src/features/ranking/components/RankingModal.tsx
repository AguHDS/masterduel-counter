import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Crown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ThumbsUp,
  Eye,
  Star,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildGuidePath, buildProfilePath } from "@/lib/config/urlHelpers";
import {
  useRanking,
  useGuideRanking,
  useTrendingGuideRanking,
  useTrendingUserRanking,
} from "../hooks/useRanking";
import type {
  RankingResponse,
  GuideRankingResponse,
  TrendingUserRankingResponse,
  TrendingGuideRankingResponse,
} from "../types/ranking.types";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { getRankColor, getRankRowBg } from "../utils/rankingUtils";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserClick: (username: string, userId: string) => void;
}

function getTopRowBg(rank: number): string {
  if (rank === 1) {
    return "!border-l-4 !border-yellow-500 bg-gradient-to-r from-yellow-500/15 to-transparent !border-t-0 !border-b-0 !border-r-0";
  }
  if (rank === 2) {
    return "!border-l-4 !border-slate-300 bg-gradient-to-r from-slate-300/10 to-transparent !border-t-0 !border-b-0 !border-r-0";
  }
  if (rank === 3) {
    return "!border-l-4 !border-orange-700 bg-gradient-to-r from-orange-700/10 to-transparent !border-t-0 !border-b-0 !border-r-0";
  }

  return "";
}

function getCurrentMonthLabel(): string {
  const date = new Date();
  return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function getAvailableMonths(): Array<{ value: string; label: string }> {
  const months: Array<{ value: string; label: string }> = [];
  const currentDate = new Date();
  
  // Current month
  const currentMonth = currentDate.toISOString().slice(0, 7);
  months.push({
    value: currentMonth,
    label: "Current Month",
  });
  
  // Last month
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  months.push({
    value: lastMonth.toISOString().slice(0, 7),
    label: "Last Month",
  });
  
  // Previous 4 months for history
  for (let i = 2; i <= 5; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ value: monthStr, label });
  }
  
  return months;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  onUserClick,
}) => {
  const [rankingType, setRankingType] = useState<"all-time" | "trending">("trending");
  const [entityType, setEntityType] = useState<"guides" | "users">("guides");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => 
    new Date().toISOString().slice(0, 7)
  );
  
  // Separate pagination for each section
  const [allTimeGuidePage, setAllTimeGuidePage] = useState(1);
  const [allTimeUserPage, setAllTimeUserPage] = useState(1);
  const [trendingGuidePage, setTrendingGuidePage] = useState(1);
  const [trendingUserPage, setTrendingUserPage] = useState(1);
  
  const navigate = useNavigate();
  const limit = 100;

  const monthLabel = useMemo(() => getCurrentMonthLabel(), []);
  const availableMonths = useMemo(() => getAvailableMonths(), []);

  // All-time data
  const {
    data: userData,
    isLoading: isLoadingUsers,
    error: userError,
  } = useRanking(allTimeUserPage, limit);

  const {
    data: guideData,
    isLoading: isLoadingGuides,
    error: guideError,
  } = useGuideRanking(allTimeGuidePage, limit);

  // Trending data
  const {
    data: trendingGuideData,
    isLoading: isLoadingTrendingGuides,
    error: trendingGuideError,
  } = useTrendingGuideRanking(selectedMonth, trendingGuidePage, limit);

  const {
    data: trendingUserData,
    isLoading: isLoadingTrendingUsers,
    error: trendingUserError,
  } = useTrendingUserRanking(selectedMonth, trendingUserPage, limit);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset page when switching tabs
  useEffect(() => {
    if (rankingType === "all-time") {
      if (entityType === "guides") setAllTimeGuidePage(1);
      else setAllTimeUserPage(1);
    } else {
      if (entityType === "guides") setTrendingGuidePage(1);
      else setTrendingUserPage(1);
    }
  }, [rankingType, entityType]);

  // Reset trending page when changing month
  useEffect(() => {
    setTrendingGuidePage(1);
    setTrendingUserPage(1);
  }, [selectedMonth]);

  if (!isOpen) return null;

  // Determine current data and pagination
  const isShowingTrending = rankingType === "trending";
  const isShowingGuides = entityType === "guides";

  let currentData: RankingResponse | GuideRankingResponse | TrendingUserRankingResponse | TrendingGuideRankingResponse | undefined;
  let currentLoading: boolean;
  let currentError: unknown;
  let currentPagination: { page: number; limit: number; total: number; totalPages: number } | undefined;
  let currentPage: number;
  let setCurrentPage: (page: number) => void;

  if (isShowingTrending) {
    if (isShowingGuides) {
      currentData = trendingGuideData;
      currentLoading = isLoadingTrendingGuides;
      currentError = trendingGuideError;
      currentPagination = trendingGuideData?.pagination;
      currentPage = trendingGuidePage;
      setCurrentPage = setTrendingGuidePage;
    } else {
      currentData = trendingUserData;
      currentLoading = isLoadingTrendingUsers;
      currentError = trendingUserError;
      currentPagination = trendingUserData?.pagination;
      currentPage = trendingUserPage;
      setCurrentPage = setTrendingUserPage;
    }
  } else {
    if (isShowingGuides) {
      currentData = guideData;
      currentLoading = isLoadingGuides;
      currentError = guideError;
      currentPagination = guideData?.pagination;
      currentPage = allTimeGuidePage;
      setCurrentPage = setAllTimeGuidePage;
    } else {
      currentData = userData;
      currentLoading = isLoadingUsers;
      currentError = userError;
      currentPagination = userData?.pagination;
      currentPage = allTimeUserPage;
      setCurrentPage = setAllTimeUserPage;
    }
  }

  // Show message if trending has no data (no fallback to all-time)
  const showNoTrendingMessage =
    isShowingTrending &&
    !currentLoading &&
    currentData &&
    currentData.ranking.length === 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.75)] border border-[#c2901c]/40"
        style={{
          background:
            "linear-gradient(160deg, #251a1e 0%, #1d1318 60%, #191014 100%)",
        }}
      >
        <div className="h-[1px] flex-shrink-0 bg-gradient-to-r from-transparent via-[#c2901c] to-transparent" />

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-4">
            <div />
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-[#c2901c]" />
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Ranking
              </h2>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 group transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Main tabs: TRENDING vs ALL-TIME - Game UI style with borders */}
          <div className="flex gap-2">
            <button
              onClick={() => setRankingType("trending")}
              className={`relative flex-1 py-3.5 rounded-t-lg text-sm font-bold tracking-widest transition-all border-t-2 border-x-2 ${
                rankingType === "trending"
                  ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] shadow-lg z-10"
                  : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/50 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
              }`}
              style={{
                borderBottom: rankingType === "trending" ? "2px solid transparent" : "none",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                TRENDING ({monthLabel})
              </div>
            </button>
            <button
              onClick={() => setRankingType("all-time")}
              className={`relative flex-1 py-3.5 rounded-t-lg text-sm font-bold tracking-widest transition-all border-t-2 border-x-2 ${
                rankingType === "all-time"
                  ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] shadow-lg z-10"
                  : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/50 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
              }`}
              style={{
                borderBottom: rankingType === "all-time" ? "2px solid transparent" : "none",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                ALL-TIME
              </div>
            </button>
          </div>
        </div>

        {/* Content container with border continuation */}
        <div 
          className="flex-1 border-2 border-t-0 border-[#c2901c] mx-6 mb-6 rounded-b-lg overflow-hidden flex flex-col"
          style={{
            background: "linear-gradient(160deg, #1e1418 0%, #181013 100%)",
          }}
        >
          {/* Month selector for trending */}
          {isShowingTrending && (
            <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[#c2901c]/20 bg-black/20">
              <Calendar className="w-4 h-4 text-[#c2901c]/80" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 bg-[#0f0a0c] border border-[#c2901c]/30 rounded-md px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#c2901c] cursor-pointer hover:border-[#c2901c]/60 transition-colors"
              >
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sub-tabs: GUIDES vs USERS - Segmented control style */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex bg-black/30 rounded-md p-1 gap-1 border border-[#c2901c]/20">
              <button
                onClick={() => setEntityType("guides")}
                className={`flex-1 py-2.5 rounded text-xs font-bold tracking-wider transition-all ${
                  entityType === "guides"
                    ? "bg-gradient-to-b from-[#c2901c] to-[#a67615] text-black shadow-md"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                GUIDES
              </button>
              <button
                onClick={() => setEntityType("users")}
                className={`flex-1 py-2.5 rounded text-xs font-bold tracking-wider transition-all ${
                  entityType === "users"
                    ? "bg-gradient-to-b from-[#c2901c] to-[#a67615] text-black shadow-md"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                USERS
              </button>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#c2901c]/30 to-transparent mx-3" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-homeAllPages">
            {showNoTrendingMessage && (
              <div className="px-4 py-3 bg-[#c2901c]/10 border-b border-[#c2901c]/20">
                <p className="text-sm text-[#c2901c] text-center font-medium">
                  No trending activity for{" "}
                  {availableMonths.find((m) => m.value === selectedMonth)?.label}
                </p>
              </div>
            )}

            {entityType === "users" && (
              <>
                {currentLoading && (
                  <div className="flex items-center justify-center py-16">
                    <span className="text-gray-400">Loading…</span>
                  </div>
                )}
                {currentError && (
                  <div className="flex items-center justify-center py-16">
                    <span className="text-red-400 text-sm">
                      Error loading ranking.
                    </span>
                  </div>
                )}
                {currentData && currentData.ranking.length === 0 && !showNoTrendingMessage && (
                  <div className="flex items-center justify-center py-16">
                    <span className="text-gray-500">No users yet.</span>
                  </div>
                )}
                {currentData &&
                  'ranking' in currentData &&
                  currentData.ranking.map((user) => {
                    if (!('userId' in user)) return null;
                    return (
                    <a
                      key={user.userId}
                      href={buildProfilePath({
                        userName: user.username,
                        userId: user.userId,
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        onUserClick(user.username, user.userId);
                      }}
                      className={`flex items-center gap-3 px-6 py-3 border-b border-[#c2901c]/10 cursor-pointer no-underline hover:bg-white/[0.03] ${
                      user.rank <= 3
                        ? getTopRowBg(user.rank)
                        : getRankRowBg(user.rank)
                    }`}
                  >
                    <div className="w-10 flex-shrink-0 flex justify-center">
                      <span
                        className={`text-sm font-black tabular-nums ${getRankColor(user.rank)}`}
                      >
                        #{user.rank}
                      </span>
                    </div>

                    <Avatar
                      username={user.username}
                      profilePictureUrl={user.profilePictureUrl}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-semibold text-white truncate">
                          {user.username}
                        </span>
                        {user.rank <= 3 && (
                          <Crown className="w-4 h-4 flex-shrink-0 text-[#c2901c]" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-sm text-purple-400 font-medium">
                            {user.totalViews.toLocaleString()}
                            {isShowingTrending && 'monthlyViews' in user && (
                              <span className="ml-1 text-[11px] text-purple-300/80">
                                (+{user.monthlyViews.toLocaleString()})
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm text-emerald-400 font-medium">
                            {user.totalLikes.toLocaleString()}
                            {isShowingTrending && 'monthlyLikes' in user && user.monthlyLikes > 0 && (
                              <span className="ml-1 text-[11px] text-emerald-300/80">
                                (+{user.monthlyLikes.toLocaleString()})
                              </span>
                            )}
                          </span>
                        </span>
                        {user.fulfilledRequests > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-sm text-orange-400 font-medium">
                              {user.fulfilledRequests} Requests
                              {isShowingTrending && 'monthlyFulfilledRequests' in user && user.monthlyFulfilledRequests > 0 && (
                                <span className="ml-1 text-[11px] text-orange-300/80">
                                  (+{user.monthlyFulfilledRequests})
                                </span>
                              )}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {user.rank <= 3 && (
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                          user.rank === 1
                            ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/15"
                            : user.rank === 2
                              ? "border-slate-400/50 text-slate-300 bg-slate-400/15"
                              : "border-amber-700/50 text-amber-600 bg-amber-700/15"
                        }`}
                      >
                        Top {user.rank}
                      </span>
                    )}
                  </a>
                  );
                })}
            </>
          )}

          {entityType === "guides" && (
            <>
              {currentLoading && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-400">Loading…</span>
                </div>
              )}
              {currentError && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-red-400 text-sm">
                    Error loading ranking.
                  </span>
                </div>
              )}
              {currentData && currentData.ranking.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-500">
                    {showNoTrendingMessage
                      ? "No trending activity this month"
                      : "No guides yet."}
                  </span>
                </div>
              )}
              {currentData &&
                'ranking' in currentData &&
                currentData.ranking.map((guide) => {
                  if (!('id' in guide)) return null;
                  const isCounter = guide.guideType === "COUNTER";
                  return (
                    <a
                      key={guide.id}
                      href={buildGuidePath({
                        guideId: guide.id,
                        archetypeName: guide.archetypeName,
                        userName: guide.authorName,
                        guideType: guide.guideType,
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(
                          buildGuidePath({
                            guideId: guide.id,
                            archetypeName: guide.archetypeName,
                            userName: guide.authorName,
                            guideType: guide.guideType,
                          }),
                        );
                        onClose();
                      }}
                      className={`flex items-center gap-4 px-6 py-3 border-b border-[#c2901c]/10 cursor-pointer no-underline hover:bg-white/[0.03] ${
                        guide.rank <= 3
                          ? getTopRowBg(guide.rank)
                          : getRankRowBg(guide.rank)
                      }`}
                    >
                      <div className="w-10 flex-shrink-0 flex justify-center">
                        <span
                          className={`text-sm font-black tabular-nums ${getRankColor(guide.rank)}`}
                        >
                          #{guide.rank}
                        </span>
                      </div>

                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-[#c2901c]/20 bg-[#0d0b10]">
                        {guide.headerImageUrl ? (
                          <img
                            src={getOptimizedCardImageUrl(guide.headerImageUrl, {
                              size: "thumbnail",
                            })}
                            alt={guide.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-base font-semibold truncate leading-snug">
                          {guide.title}
                        </p>
                        <p className="text-gray-500 text-xs truncate mt-0.5">
                          <span className="text-gray-500">by </span>
                          <span className="text-blue-200">
                            {guide.authorName}
                          </span>
                          <span className="text-gray-600"> · </span>
                          <span className="text-yellow-500">
                            {guide.archetypeName}
                          </span>{" "}
                          <span className="text-gray-600"> · </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-[2px] rounded-md border ${
                              isCounter
                                ? "bg-amber-950/60 text-amber-500 border-amber-700/50"
                                : "bg-blue-950/60 text-blue-400 border-blue-800/50"
                            }`}
                          >
                            {isCounter ? "Counter" : "Deck"}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            {(guide.views ?? 0).toLocaleString()}
                            {isShowingTrending && 'monthlyViews' in guide && (
                              <span className="ml-1 text-[11px] text-purple-300/80">
                                (+{guide.monthlyViews.toLocaleString()})
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {guide.likes.toLocaleString()}
                            {isShowingTrending && 'monthlyLikes' in guide && guide.monthlyLikes > 0 && (
                              <span className="ml-1 text-[11px] text-emerald-300/80">
                                (+{guide.monthlyLikes.toLocaleString()})
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {(guide.favorites ?? 0).toLocaleString()}
                            {isShowingTrending && 'monthlyFavorites' in guide && guide.monthlyFavorites > 0 && (
                              <span className="ml-1 text-[11px] text-yellow-300/80">
                                (+{guide.monthlyFavorites.toLocaleString()})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
            </>
          )}
          </div>
        </div>

        {/* Pagination footer outside border */}
        {currentPagination && currentPagination.totalPages > 1 && (
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1a1216] to-[#120c0f] border border-[#c2901c]/30 rounded-lg px-4 py-3">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold tracking-wide bg-gradient-to-b from-[#c2901c] to-[#a67615] text-black hover:from-[#d4a01e] hover:to-[#b88818] disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                PREVIOUS
              </button>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-bold text-[#c2901c]">
                  Page {currentPagination.page} of{" "}
                  {currentPagination.totalPages}
                </span>
                <span className="text-[10px] text-gray-500">
                  {currentPagination.total} total
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(currentPagination.totalPages, currentPage + 1),
                  )
                }
                disabled={currentPage === currentPagination.totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold tracking-wide bg-gradient-to-b from-[#c2901c] to-[#a67615] text-black hover:from-[#d4a01e] hover:to-[#b88818] disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 transition-all"
              >
                NEXT
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
