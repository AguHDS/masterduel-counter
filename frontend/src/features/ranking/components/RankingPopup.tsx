import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Crown,
  ThumbsUp,
  Eye,
  BookOpen,
  MailWarning,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildGuidePath, buildProfilePath } from "@/lib/config/urlHelpers";
import type {
  RankingUser,
  RankingGuide,
  TrendingRankingUser,
  TrendingRankingGuide,
} from "../types/ranking.types";
import { Avatar } from "@/shared/components/DefaultAvatar";
import {
  useGuideRanking,
  useRanking,
  useTrendingGuideRanking,
  useTrendingUserRanking,
} from "../hooks/useRanking";
import { getRankColor, getRankRowBg } from "../utils/rankingUtils";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";

interface RankingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  users: RankingUser[];
  onUserClick: (username: string, userId: string) => void;
  onViewFullRanking: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  isLoading?: boolean;
  alignRight?: boolean;
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

export const RankingPopup: React.FC<RankingPopupProps> = ({
  isOpen,
  onClose,
  users,
  onUserClick,
  onViewFullRanking,
  triggerRef,
  isLoading = false,
  alignRight = false,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [rankingType, setRankingType] = useState<"all-time" | "trending">(
    "trending",
  );
  const [entityType, setEntityType] = useState<"guides" | "users">("guides");
  const navigate = useNavigate();

  const currentMonth = useMemo(
    () => new Date().toISOString().slice(0, 7),
    [],
  );
  const monthLabel = useMemo(() => getCurrentMonthLabel(), []);

  // All-time data
  const { data: guideData, isLoading: isLoadingGuides } = useGuideRanking(
    1,
    50,
  );
  const { data: userData, isLoading: isLoadingUsers } = useRanking(1, 50);

  // Trending data
  const {
    data: trendingGuideData,
    isLoading: isLoadingTrendingGuides,
  } = useTrendingGuideRanking(currentMonth, 1, 50);
  const {
    data: trendingUserData,
    isLoading: isLoadingTrendingUsers,
  } = useTrendingUserRanking(currentMonth, 1, 50);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        triggerRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // Determine which data to show
  const isShowingTrending = rankingType === "trending";
  const isShowingGuides = entityType === "guides";

  let currentData: Array<RankingUser | RankingGuide | TrendingRankingUser | TrendingRankingGuide> = [];
  let currentLoading = false;

  if (isShowingTrending) {
    if (isShowingGuides) {
      currentData = trendingGuideData?.ranking ?? [];
      currentLoading = isLoadingTrendingGuides;
    } else {
      currentData = trendingUserData?.ranking ?? [];
      currentLoading = isLoadingTrendingUsers;
    }
  } else {
    if (isShowingGuides) {
      currentData = guideData?.ranking ?? [];
      currentLoading = isLoadingGuides;
    } else {
      currentData = userData?.ranking ?? users;
      currentLoading = isLoadingUsers || isLoading;
    }
  }

  // Show message if trending has no data (no fallback to all-time)
  const showNoTrendingMessage =
    isShowingTrending && !currentLoading && currentData.length === 0;

  return (
    <div
      ref={popupRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute mt-2 w-[450px] max-w-[calc(100vw-2rem)] border border-[#c2901c]/40 rounded-xl shadow-2xl overflow-hidden z-50 ${
        alignRight ? "right-0" : "left-0"
      }`}
      style={{
        top: "100%",
        background:
          "linear-gradient(160deg, #221519 0%, #1c1115 60%, #181013 100%)",
      }}
    >
      <div className="h-[1px] flex-shrink-0 bg-gradient-to-r from-transparent via-[#c2901c] to-transparent" />

      {/* Header with title */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-[#c2901c]" />
          <span className="text-white font-bold text-lg tracking-wide">
            Ranking
          </span>
        </div>
      </div>

      {/* Main tabs: TRENDING vs ALL-TIME - Game UI style with borders */}
      <div className="px-3 pb-0">
        <div className="flex gap-2 mb-0">
          <button
            onClick={() => setRankingType("trending")}
            className={`relative flex-1 py-2 sm:py-3 rounded-t-lg text-[10px] sm:text-xs font-bold tracking-wide sm:tracking-widest transition-all border-t-2 border-x-2 ${
              rankingType === "trending"
                ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] shadow-lg z-10"
                : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/50 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
            }`}
            style={{
              borderBottom: rankingType === "trending" ? "2px solid transparent" : "none",
            }}
          >
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">TRENDING ({monthLabel})</span>
              <span className="sm:hidden">TREND ({monthLabel})</span>
            </div>
          </button>
          <button
            onClick={() => setRankingType("all-time")}
            className={`relative flex-1 py-2 sm:py-3 rounded-t-lg text-[10px] sm:text-xs font-bold tracking-wide sm:tracking-widest transition-all border-t-2 border-x-2 ${
              rankingType === "all-time"
                ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] shadow-lg z-10"
                : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/50 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
            }`}
            style={{
              borderBottom: rankingType === "all-time" ? "2px solid transparent" : "none",
            }}
          >
            <div className="flex items-center justify-center gap-1">
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">ALL-TIME</span>
              <span className="sm:hidden">ALL TIME</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content container with border continuation */}
      <div 
        className="border-2 border-t-0 border-[#c2901c] mx-3 rounded-b-lg overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1e1418 0%, #181013 100%)",
        }}
      >
        {/* Sub-tabs: GUIDES vs USERS - Segmented control style */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex bg-black/30 rounded-md p-1 gap-1 border border-[#c2901c]/20">
            <button
              onClick={() => setEntityType("guides")}
              className={`flex-1 py-2 rounded text-[10px] font-bold tracking-wider ${
                entityType === "guides"
                  ? "bg-gradient-to-b from-[#c2901c] to-[#a67615] text-black shadow-md"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              GUIDES
            </button>
            <button
              onClick={() => setEntityType("users")}
              className={`flex-1 py-2 rounded text-[10px] font-bold tracking-wider ${
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

        <div className="h-px bg-gradient-to-r from-transparent via-[#c2901c]/30 to-transparent mx-3" />

        {/* Scrollable content */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-homeAllPages">
          {entityType === "users" && (
          <>
            {currentLoading && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400 text-sm">Loading…</span>
              </div>
            )}
            {!currentLoading && currentData.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-500 text-sm">
                  {showNoTrendingMessage
                    ? "No trending activity this month"
                    : "No users in ranking yet."}
                </span>
              </div>
            )}
            {!currentLoading &&
              currentData.map((item) => {
                if (!('userId' in item)) return null;
                const user = item as RankingUser | TrendingRankingUser;
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
                  className={`flex items-center gap-3 px-4 py-[11px] border-b border-[#c2901c]/15 cursor-pointer no-underline hover:bg-white/[0.05] ${
                    user.rank <= 3
                      ? getTopRowBg(user.rank)
                      : getRankRowBg(user.rank)
                  }`}
                >
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <span
                      className={`text-xs font-black tabular-nums ${getRankColor(user.rank)}`}
                    >
                      #{user.rank}
                    </span>
                  </div>

                  <Avatar
                    username={user.username}
                    profilePictureUrl={user.profilePictureUrl}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {user.username}
                      </span>
                      {user.rank <= 3 && (
                        <Crown className="w-3 h-3 flex-shrink-0 text-[#c2901c]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-400 font-medium">
                          {user.totalLikes.toLocaleString()} Likes
                        </span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">
                          {user.totalViews.toLocaleString()} Views
                        </span>
                      </span>
                      {user.fulfilledRequests > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MailWarning className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-400 font-medium">
                            {user.fulfilledRequests} Requests
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {user.rank <= 3 && (
                    <span
                      className={`text-[10px] font-black px-2 py-[3px] rounded-full border ${
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
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400 text-sm">Loading…</span>
              </div>
            )}
            {!currentLoading && currentData.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-500 text-sm">
                  {showNoTrendingMessage
                    ? "No trending activity this month"
                    : "No guides in ranking yet."}
                </span>
              </div>
            )}
            {!currentLoading &&
              currentData.map((item) => {
                if (!('id' in item)) return null;
                const guide = item as RankingGuide | TrendingRankingGuide;
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
                    className={`flex items-center gap-3 px-4 py-[10px] border-b border-[#c2901c]/15 cursor-pointer no-underline hover:bg-white/[0.05] ${
                      guide.rank <= 3
                        ? getTopRowBg(guide.rank)
                        : getRankRowBg(guide.rank)
                    }`}
                  >
                    <div className="w-8 flex-shrink-0 flex justify-center">
                      <span
                        className={`text-xs font-black tabular-nums ${getRankColor(guide.rank)}`}
                      >
                        #{guide.rank}
                      </span>
                    </div>

                    <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden border border-[#c2901c]/20 bg-[#0d0b10]">
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
                          <BookOpen className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate leading-snug">
                        {guide.title}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                          <Eye className="w-3 h-3" />
                          {(guide.views ?? 0).toLocaleString()} Views
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <ThumbsUp className="w-3 h-3" />
                          {guide.likes.toLocaleString()} Likes
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          {(guide.favorites ?? 0).toLocaleString()} Favs
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
          </>
        )}
        </div>

        {/* Footer inside border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#c2901c]/30 to-transparent" />
        <div className="px-4 py-3">
          <button
            onClick={onViewFullRanking}
            className="w-full text-center text-xs font-bold text-[#c2901c] hover:text-[#f4d68f] tracking-wider py-1.5 rounded-md border border-[#c2901c]/30 hover:border-[#c2901c] hover:bg-[#c2901c]/10 transition-all"
          >
            View Full Ranking →
          </button>
        </div>
      </div>
    </div>
  );
};
