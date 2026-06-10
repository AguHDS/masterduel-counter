import React from "react";
import { Trophy } from "lucide-react";
import type { GuideBestTrending } from "../../ranking/types/ranking.types";

interface TrendingBadgeProps {
  bestTrending: GuideBestTrending;
}

function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({
  bestTrending,
}) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 max-[1095px]:text-xs max-[1095px]:px-2 max-[1095px]:py-1 max-[1095px]:gap-1 max-[639px]:text-[10px] max-[639px]:px-1.5 max-[639px]:py-0.5 max-[639px]:gap-0.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#c2901c]/20 to-[#a67615]/10 border border-[#c2901c]/40 mb-5 max-[1023px]:mb-1">
      <Trophy className="w-5 h-5 text-[#c2901c]" />
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="bg-gradient-to-r from-[#f4d68f] to-[#c2901c] bg-clip-text text-transparent">
          Top #{bestTrending.rank} Trending
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-300">{formatMonthYear(bestTrending.month)}</span>
      </div>
    </div>
  );
};
