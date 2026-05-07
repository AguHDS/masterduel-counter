import React, { useState } from "react";
import {
  X,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  ThumbsUp,
  MailWarning,
} from "lucide-react";
import type { TrendingAchievement } from "../../ranking/types/ranking.types";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";

interface TrendingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: TrendingAchievement[];
  username: string;
  profilePictureUrl?: string;
  onGuideClick?: (guideId: number) => void;
}

function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const ITEMS_PER_PAGE = 20;

export const TrendingHistoryModal: React.FC<TrendingHistoryModalProps> = ({
  isOpen,
  onClose,
  achievements,
  username,
  onGuideClick,
}) => {
  const [activeTab, setActiveTab] = useState<"user" | "guides">("user");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter((a) =>
    activeTab === "user" ? a.type === "user" : a.type === "guide",
  );

  const totalPages = Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = filteredAchievements.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleTabChange = (tab: "user" | "guides") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when changing tabs
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80"
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-gradient-to-br from-[#221519] via-[#1c1115] to-[#181013] rounded-xl border-2 border-[#c2901c]/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - Top right */}
        <div className="flex justify-end mr-4 py-1">
          <button
          onClick={onClose}
          className="relative top-3 z-50 hover:bg-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        </div>
        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-5">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTabChange("user")}
              className={`flex-1 py-3 px-4 rounded-t-lg font-bold text-sm tracking-wide transition-all border-2 ${
                activeTab === "user"
                  ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] border-b-transparent shadow-lg"
                  : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/60 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                User Ranking
              </div>
            </button>
            <button
              onClick={() => handleTabChange("guides")}
              className={`flex-1 py-3 px-4 rounded-t-lg font-bold text-sm tracking-wide transition-all border-2 ${
                activeTab === "guides"
                  ? "bg-gradient-to-b from-[#b88818]/30 to-[#b88818]/10 text-[#f4d68f] border-[#c2901c] border-b-transparent shadow-lg"
                  : "bg-gradient-to-b from-[#1a1216] to-[#120c0f] text-[#c2901c]/60 border-[#c2901c]/20 hover:text-[#c2901c]/80 hover:border-[#c2901c]/40"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                Guide Ranking
              </div>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-6 pb-3 pt-2">
          <div className="text-center text-gray-400 text-sm">
            {activeTab === "user"
              ? `User trending history for `
              : `Guide trending history for `}
            <span className="text-[#c2901c] font-medium">{username}</span>
          </div>
        </div>

        {/* Content container */}
        <div
          className="flex-1 border-2 border-[#c2901c] mx-6 mb-6 rounded-lg overflow-hidden flex flex-col"
          style={{
            background: "linear-gradient(160deg, #1e1418 0%, #181013 100%)",
          }}
        >
          {/* Table header */}
          <div className="flex-shrink-0 bg-black/20 border-b border-[#c2901c]/30">
            {activeTab === "user" ? (
              <div className="grid grid-cols-[1fr_100px_100px_100px] gap-3 px-4 py-3 text-xs font-bold text-[#c2901c] uppercase tracking-wider">
                <div>Month</div>
                <div className="text-right">Likes</div>
                <div className="text-right">Requests</div>
                <div className="text-right">Views</div>
              </div>
            ) : (
              <div className="grid grid-cols-[60px_1fr_100px_100px_100px] gap-3 px-4 py-3 text-xs font-bold text-[#c2901c] uppercase tracking-wider">
                <div className="text-center"></div>
                <div>Title</div>
                <div className="flex items-center justify-end gap-1">
                  <span>Likes</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span>Favs</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span>Views</span>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-homeAllPages">
            {currentPageData.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
                <p className="text-gray-400 text-center">
                  No trending{" "}
                  {activeTab === "user" ? "user rankings" : "guides"} available
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#c2901c]/10">
                {currentPageData.map((achievement, index) => {
                  if (activeTab === "user" && achievement.type === "user") {
                    // User ranking row
                    return (
                      <div
                        key={`${achievement.type}-${achievement.month}-${index}`}
                        className="grid grid-cols-[1fr_100px_100px_100px] gap-3 px-4 py-3 hover:bg-[#c2901c]/5 transition-colors"
                      >
                        {/* Month & Rank combined */}
                        <div className="flex items-center text-white font-medium">
                          <span>{formatMonthYear(achievement.month)}</span>
                          <span className="mx-2 text-gray-500">-</span>
                          <span className="text-yellow-400 font-semibold">
                            Top #{achievement.rank}
                          </span>
                        </div>

                        {/* Likes */}
                        <div className="flex items-center justify-end gap-1 text-green-400 text-sm font-semibold">
                          <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
                          {achievement.totalLikes.toLocaleString()}
                        </div>

                        {/* Requests */}
                        <div className="flex items-center justify-end gap-1 text-orange-400 text-sm font-semibold">
                          <MailWarning className="w-5 h-5 text-orange-400" />
                          {achievement.fulfilledRequests}
                        </div>

                        {/* Views */}
                        <div className="flex items-center justify-end gap-1 text-purple-400 text-sm font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          {achievement.totalViews.toLocaleString()}
                        </div>
                      </div>
                    );
                  } else if (
                    activeTab === "guides" &&
                    achievement.type === "guide"
                  ) {
                    // Guide ranking row
                    return (
                      <div
                        key={`${achievement.type}-${achievement.month}-${index}`}
                        className={`grid grid-cols-[60px_1fr_100px_100px_100px] gap-3 px-4 py-3 hover:bg-[#c2901c]/5 transition-colors ${
                          onGuideClick ? "cursor-pointer" : ""
                        }`}
                        onClick={() => {
                          if (onGuideClick) {
                            onGuideClick(achievement.guideId);
                            onClose();
                          }
                        }}
                      >
                        {/* Card Image */}
                        <div className="flex items-center justify-center">
                          {achievement.headerImageUrl ? (
                            <img
                              src={getOptimizedCardImageUrl(
                                achievement.headerImageUrl,
                                { size: "thumbnail" },
                              )}
                              alt="Guide card"
                              className="h-10 w-10 border border-[#c2901c]/60 shadow-sm object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                              <span className="text-slate-400 text-xs">-</span>
                            </div>
                          )}
                        </div>

                        {/* Title with Rank */}
                        <div className="flex flex-col justify-center min-w-0">
                          <div className="text-white font-medium truncate">
                            {achievement.guideTitle}
                            <span className="mx-2 text-gray-500">-</span>
                              <span className="text-yellow-400 font-semibold">Top #{achievement.rank} - <span className="text-xs text-yellow-600">{formatMonthYear(achievement.month)}</span> </span>
                          </div>
                          <div className="text-xs text-amber-500">
                            {achievement.archetypeName}
                            
                          </div>
                        </div>

                        {/* Likes */}
                        <div className="flex items-center justify-end gap-1 text-green-400 text-sm font-semibold">
                          <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
                          <span>{achievement.likes.toLocaleString()}</span>
                        </div>

                        {/* Favorites */}
                        <div className="flex items-center justify-end gap-1 text-yellow-400 text-sm font-semibold">
                          <Star className="w-3.5 h-3.5" />
                          <span>{achievement.favorites.toLocaleString()}</span>
                        </div>

                        {/* Views */}
                        <div className="flex items-center justify-end gap-1 text-purple-400 text-sm font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{achievement.views.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-[#c2901c]/30 bg-black/20">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#c2901c]/20 rounded hover:bg-[#c2901c]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#c2901c]/20 rounded hover:bg-[#c2901c]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
