import React, { useRef, useEffect, useState } from "react";
import { Crown, ThumbsUp, Eye, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RankingUser } from "../types/ranking.types";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { useGuideRanking } from "../hooks/useRanking";
import { getRankColor, getRankRowBg } from "../utils/rankingUtils";

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
  const [activeTab, setActiveTab] = useState<"users" | "guides">("guides");
  const navigate = useNavigate();

  const { data: guideData, isLoading: isLoadingGuides } = useGuideRanking(
    1,
    50,
  );

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
    // Use mousedown so stopPropagation on child elements works correctly
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute mt-2 w-[420px] bg-[#17131d] border border-[#c2901c]/35 rounded-xl shadow-2xl overflow-hidden z-50 ${
        alignRight ? "right-0" : "left-0"
      }`}
      style={{ top: "100%" }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-0 bg-[#1f1a24]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="w-[18px] h-[18px] text-[#c2901c]" />
          <span className="text-white font-bold text-base tracking-wide">
            Ranking
          </span>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0e0b13] rounded-lg p-[3px] gap-[3px]">
          {(["guides", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-[7px] rounded-md text-[11px] font-bold tracking-widest transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#c2901c] text-black shadow-md"
                  : "text-[#c2901c]/60 hover:text-[#c2901c] hover:bg-[#c2901c]/5"
              }`}
            >
              {tab === "users" ? "TOP 50 USERS" : "TOP 50 GUIDES"}
            </button>
          ))}
        </div>

        {/* thin gold separator under tabs */}
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#c2901c]/40 to-transparent" />
      </div>

      {/* ── List ── */}
      <div className="max-h-[420px] overflow-y-auto scrollbar-cardpair bg-[#17131d]">
        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400 text-sm">Loading…</span>
              </div>
            )}
            {!isLoading && users.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-500 text-sm">
                  No users in ranking yet.
                </span>
              </div>
            )}
            {!isLoading &&
              users.map((user) => (
                <a
                  key={user.userId}
                  href={`/profile/${user.userId}`}
                  onClick={(e) => { e.preventDefault(); onUserClick(user.username, user.userId); }}
                  className={`flex items-center gap-3 px-4 py-[11px] border-b border-[#c2901c]/20 cursor-pointer no-underline ${getRankRowBg(user.rank)}`}
                >
                  {/* Rank */}
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
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate hover:text-[#c2901c] transition-colors">
                        {user.username}
                      </span>
                      {user.rank <= 3 && (
                        <Crown className="w-3 h-3 flex-shrink-0 text-[#c2901c]" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ThumbsUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-400 font-medium">
                        {user.totalLikes.toLocaleString()} Guide Likes
                      </span>
                    </div>
                  </div>

                  {user.rank <= 3 && (
                    <span
                      className={`text-[10px] font-black px-2 py-[3px] rounded-full border ${
                        user.rank === 1
                          ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10"
                          : user.rank === 2
                            ? "border-slate-400/40 text-slate-300 bg-slate-400/10"
                            : "border-amber-700/40 text-amber-600 bg-amber-700/10"
                      }`}
                    >
                      Top {user.rank}
                    </span>
                  )}
                </a>
              ))}
          </>
        )}

        {/* ── GUIDES TAB ── */}
        {activeTab === "guides" && (
          <>
            {isLoadingGuides && (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400 text-sm">Loading…</span>
              </div>
            )}
            {!isLoadingGuides &&
              (!guideData || guideData.ranking.length === 0) && (
                <div className="flex items-center justify-center py-12">
                  <span className="text-gray-500 text-sm">
                    No guides in ranking yet.
                  </span>
                </div>
              )}
            {!isLoadingGuides &&
              guideData?.ranking.map((guide) => {
                const isCounter = guide.guideType === "COUNTER";
                return (
                  <a
                    key={guide.id}
                    href={`/archetype/${guide.archetypeId}/instance/${guide.id}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/archetype/${guide.archetypeId}/instance/${guide.id}`); onClose(); }}
                    className={`flex items-center gap-3 px-4 py-[10px] border-b border-[#c2901c]/20 cursor-pointer no-underline ${getRankRowBg(guide.rank)}`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex-shrink-0 flex justify-center">
                      <span
                        className={`text-xs font-black tabular-nums ${getRankColor(guide.rank)}`}
                      >
                        #{guide.rank}
                      </span>
                    </div>

                    {/* Card art */}
                    <div className="w-11 h-11 flex-shrink-0 rounded-md overflow-hidden border border-[#c2901c]/20 bg-[#0d0b10]">
                      {guide.headerImageUrl ? (
                        <img
                          src={guide.headerImageUrl}
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate leading-snug">
                        {guide.title}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        <span className="text-gray-500">by </span>
                        <span className="text-blue-200">{guide.authorName}</span>
                        <span className="text-gray-600"> · </span>
                        <span className="text-yellow-500">{guide.archetypeName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                          <Eye className="w-3 h-3" />
                          {(guide.views ?? 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <ThumbsUp className="w-3 h-3" />
                          {guide.likes.toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-[2px] rounded border ${
                            isCounter
                              ? "bg-amber-950/60 text-amber-500 border-amber-700/50"
                              : "bg-blue-950/60 text-blue-400 border-blue-800/50"
                          }`}
                        >
                          {isCounter ? "Counter Guide" : "Deck Guide"}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c2901c]/30 to-transparent" />
      <div className="px-4 py-2.5 bg-[#110e15]">
        <button
          onClick={onViewFullRanking}
          className="w-full text-center text-xs font-semibold text-[#c2901c]/80 hover:text-[#c2901c] transition-colors tracking-wider py-1"
        >
          View Full Ranking →
        </button>
      </div>
    </div>
  );
};
