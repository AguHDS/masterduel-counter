import React, { useState, useEffect } from "react";
import {
  X,
  Crown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ThumbsUp,
  Eye,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildGuidePath, buildProfilePath } from "@/lib/config/urlHelpers";
import { useRanking, useGuideRanking } from "../hooks/useRanking";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { getRankColor, getRankRowBg } from "../utils/rankingUtils";

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

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  onUserClick,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "guides">("guides");
  const [userPage, setUserPage] = useState(1);
  const [guidePage, setGuidePage] = useState(1);
  const navigate = useNavigate();
  const limit = 50;

  const {
    data: userData,
    isLoading: isLoadingUsers,
    error: userError,
  } = useRanking(userPage, limit);

  const {
    data: guideData,
    isLoading: isLoadingGuides,
    error: guideError,
  } = useGuideRanking(guidePage, limit);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPagination =
    activeTab === "users" ? userData?.pagination : guideData?.pagination;
  const currentPage = activeTab === "users" ? userPage : guidePage;
  const setCurrentPage = activeTab === "users" ? setUserPage : setGuidePage;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50"
      onClick={onClose}
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

        <div className="flex-shrink-0 border-b border-[#c2901c]/20">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 pt-4 pb-4">
            <div />
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-[#c2901c]" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Ranking
              </h2>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/8 group"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>

          <div className="flex px-6 gap-0">
            {(["guides", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-bold tracking-widest border-b-2 ${
                  activeTab === tab
                    ? "text-[#c2901c] border-[#c2901c] bg-[#c2901c]/8"
                    : "text-gray-600 border-transparent hover:text-[#c2901c]/60 hover:bg-white/3"
                }`}
              >
                {tab === "users" ? "TOP 50 USERS" : "TOP 50 GUIDES"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-homeAllPages">
          {activeTab === "users" && (
            <>
              {isLoadingUsers && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-400">Loading…</span>
                </div>
              )}
              {userError && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-red-400 text-sm">
                    Error loading ranking.
                  </span>
                </div>
              )}
              {userData && userData.ranking.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-500">No users yet.</span>
                </div>
              )}
              {userData &&
                userData.ranking.map((user) => (
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
                    className={`flex items-center gap-4 px-6 py-3.5 border-b border-[#c2901c]/15 cursor-pointer no-underline hover:bg-white/[0.05] ${
                      user.rank <= 3
                        ? getTopRowBg(user.rank)
                        : getRankRowBg(user.rank)
                    }`}
                  >
                    <div
                      className={`w-10 flex-shrink-0 text-center font-black tabular-nums ${getRankColor(user.rank)} ${user.rank <= 3 ? "text-base" : "text-sm"}`}
                    >
                      #{user.rank}
                    </div>

                    <Avatar
                      username={user.username}
                      profilePictureUrl={user.profilePictureUrl}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {user.username}
                        </span>
                        {user.rank <= 3 && (
                          <Crown className="w-3.5 h-3.5 flex-shrink-0 text-[#c2901c]" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm text-emerald-400">
                            {user.totalLikes.toLocaleString()} Guide Likes
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span className="text-sm text-blue-300">
                            {user.totalViews.toLocaleString()} Guide Views
                          </span>
                        </span>
                        {user.fulfilledRequests > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            <span className="text-sm text-amber-300">
                              {user.fulfilledRequests} Requests
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {user.rank <= 3 && (
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full border flex-shrink-0 ${
                          user.rank === 1
                            ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/15"
                            : user.rank === 2
                              ? "border-slate-400/50 text-slate-300 bg-slate-400/15"
                              : "border-amber-600/50 text-amber-500 bg-amber-600/15"
                        }`}
                      >
                        Top {user.rank}
                      </span>
                    )}
                  </a>
                ))}
            </>
          )}

          {activeTab === "guides" && (
            <>
              {isLoadingGuides && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-400">Loading…</span>
                </div>
              )}
              {guideError && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-red-400 text-sm">
                    Error loading ranking.
                  </span>
                </div>
              )}
              {guideData && guideData.ranking.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-500">No guides yet.</span>
                </div>
              )}
              {guideData &&
                guideData.ranking.map((guide) => {
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
                      className={`flex items-center gap-4 px-6 py-3.5 border-b border-[#c2901c]/15 cursor-pointer no-underline hover:bg-white/[0.05] ${
                        guide.rank <= 3
                          ? getTopRowBg(guide.rank)
                          : getRankRowBg(guide.rank)
                      }`}
                    >
                      <div
                        className={`w-10 flex-shrink-0 text-center font-black tabular-nums ${getRankColor(guide.rank)} ${guide.rank <= 3 ? "text-base" : "text-sm"}`}
                      >
                        #{guide.rank}
                      </div>

                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[#c2901c]/25 bg-[#0d0b10] shadow-md">
                        {guide.headerImageUrl ? (
                          <img
                            src={guide.headerImageUrl}
                            alt={guide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {guide.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          by{" "}
                          <span className="text-blue-200">
                            {guide.authorName}
                          </span>
                          <span className="text-gray-600"> · </span>
                          <span className="text-yellow-500">
                            {guide.archetypeName}
                          </span>
                        </p>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="flex items-center gap-1 text-sm text-purple-400">
                            <Eye className="w-3 h-3" />
                            {(guide.views ?? 0).toLocaleString()} Views
                          </span>
                          <span className="flex items-center gap-1 text-sm text-emerald-400">
                            <ThumbsUp className="w-3 h-3" />
                            {guide.likes.toLocaleString()} Likes
                          </span>
                          <span className="flex items-center gap-1 text-sm text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            {(guide.favorites ?? 0).toLocaleString()} Favs
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-[3px] rounded border ${
                              isCounter
                                ? "bg-amber-950/60 text-amber-500 border-amber-700/50"
                                : "bg-blue-950/60 text-blue-400 border-blue-800/50"
                            }`}
                          >
                            {isCounter ? "Counter" : "Deck"}
                          </span>
                        </div>
                      </div>

                      {guide.rank <= 3 && (
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full border flex-shrink-0 ${
                            guide.rank === 1
                              ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/15"
                              : guide.rank === 2
                                ? "border-slate-400/50 text-slate-300 bg-slate-400/15"
                                : "border-amber-600/50 text-amber-500 bg-amber-600/15"
                          }`}
                        >
                          Top {guide.rank}
                        </span>
                      )}
                    </a>
                  );
                })}
            </>
          )}
        </div>

        {currentPagination && currentPagination.totalPages > 1 && (
          <div
            className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-[#c2901c]/20"
            style={{
              background: "linear-gradient(180deg, #261619 0%, #1d1318 100%)",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#c2901c]/12 hover:bg-[#c2901c]/22 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#c2901c] text-sm font-semibold border border-[#c2901c]/25 hover:border-[#c2901c]/45"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-gray-400 text-sm">
              {currentPagination.page} / {currentPagination.totalPages}
              <span className="text-gray-600 ml-2">
                ({currentPagination.total}{" "}
                {activeTab === "guides" ? "guides" : "users"})
              </span>
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(currentPagination.totalPages, prev + 1),
                )
              }
              disabled={currentPage === currentPagination.totalPages}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#c2901c]/12 hover:bg-[#c2901c]/22 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#c2901c] text-sm font-semibold border border-[#c2901c]/25 hover:border-[#c2901c]/45"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
