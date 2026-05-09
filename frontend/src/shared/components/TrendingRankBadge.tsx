import React from "react";
import { Trophy } from "lucide-react";

interface TrendingRankBadgeProps {
  rank: number;
  compact?: boolean;
  className?: string;
  applyRelativePosition?: boolean;
}

export const TrendingRankBadge: React.FC<TrendingRankBadgeProps> = ({
  rank,
  compact = false,
  className = "",
  applyRelativePosition = false,
}) => {
  if (rank <= 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 py-1${applyRelativePosition ? " relative top-1" : ""} ${className}`}
      title={`Trending rank #${rank} this month`}
    >
      <Trophy
        className={
          compact ? "h-3 w-3 text-amber-300" : "h-3.5 w-3.5 text-amber-300"
        }
      />
      <span
        className={
          compact
            ? "text-[10px] font-semibold text-amber-200"
            : "text-[11px] font-semibold text-amber-200"
        }
      >
        Trending #{rank}
      </span>
    </div>
  );
};
