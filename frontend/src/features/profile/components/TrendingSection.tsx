import React from "react";
import { Trophy } from "lucide-react";
import type { TrendingAchievement } from "../../ranking/types/ranking.types";
import { getOptimizedCardImageUrl, getOptimizedProfilePictureUrl } from "@/lib/utils/imageOptimization";

interface TrendingSectionProps {
  achievements: TrendingAchievement[];
  profilePictureUrl?: string;
  onShowAll: () => void;
  onGuideClick?: (guideId: number) => void;
}

function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  achievements,
  profilePictureUrl,
  onShowAll,
  onGuideClick,
}) => {
  const topThree = achievements.slice(0, 3);
  const hasData = topThree.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-yellow-500 font-bold text-sm flex items-center gap-2 border-t border-yellow-600/30 pt-6">
        <span className="text-lg">♦</span> Trending Ranking
      </h3>
      {hasData ? (
        <>
          <div className="space-y-1">
            {topThree.map((achievement, index) => {
              const isGuide = achievement.type === "guide";
              
              return (
                <div
                  key={`${achievement.type}-${achievement.month}-${index}`}
                  className={`flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors ${
                    isGuide && onGuideClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (isGuide && onGuideClick && achievement.type === "guide") {
                      onGuideClick(achievement.guideId);
                    }
                  }}
                >
                  {isGuide && achievement.type === "guide" ? (
                    // Guide achievement - show guide header card
                    achievement.headerImageUrl ? (
                      <img
                        src={getOptimizedCardImageUrl(
                          achievement.headerImageUrl,
                          { size: "thumbnail" },
                        )}
                        alt={achievement.guideTitle}
                        className="h-[50px] w-[50px] border-2 border-yellow-500/80 shadow-sm object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-400 text-xs">-</span>
                      </div>
                    )
                  ) : (
                    // User achievement - show profile picture
                    profilePictureUrl ? (
                      <img
                        src={getOptimizedProfilePictureUrl(profilePictureUrl, { size: 'mini' }) || profilePictureUrl}
                        alt="Profile"
                        className="h-[50px] w-[50px] rounded-full border-2 border-yellow-500/80 shadow-sm object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-slate-400" />
                      </div>
                    )
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-semibold truncate flex-1">
                        {isGuide && achievement.type === "guide"
                          ? achievement.guideTitle
                          : "User Ranking"}
                      </p>
                      <span className="text-yellow-400 text-xs font-semibold flex-shrink-0 flex items-center gap-1">
                        #{achievement.rank}
                      </span>
                    </div>
                    <p className="text-amber-200/70 text-xs truncate">
                      {isGuide && achievement.type === "guide"
                        ? achievement.archetypeName
                        : formatMonthYear(achievement.month)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onShowAll}
            className="w-full px-4 hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors"
          >
            View all ({achievements.length})
          </button>
        </>
      ) : (
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">No trending achievements yet</p>
        </div>
      )}
    </div>
  );
};
