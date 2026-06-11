import { Eye, Star, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { buildProfilePath } from "@/lib/config/urlHelpers";

interface GuideMobileStatsBarProps {
  views: number;
  favoriteCount: number;
  favorited: boolean;
  likeCount: number;
  liked: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isEditMode: boolean;
  userName?: string;
  userId?: number | string;
  createdAt?: string;
  isSmallWidth: boolean;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
}

/** Renders responsive stats for a guide (views, favorites, likes, date and author) */
export const GuideMobileStatsBar = ({
  views,
  favoriteCount,
  favorited,
  likeCount,
  liked,
  isAuthenticated,
  isOwner,
  isEditMode,
  userName,
  userId,
  createdAt,
  isSmallWidth,
  onToggleFavorite,
  onToggleLike,
}: GuideMobileStatsBarProps) => {
  return (
    <div className="ml-auto flex items-center gap-2.5 max-[1023px]:flex lg:hidden">
      <div className="flex items-center gap-1">
        <Eye className="w-3 h-3 text-purple-400" />
        <span className="text-purple-400 text-[11px]">{views}</span>
      </div>
      <button
        onClick={
          isAuthenticated && !isEditMode ? onToggleFavorite : undefined
        }
        disabled={!isAuthenticated || isEditMode}
        className={`bg-transparent border-none p-0 inline-flex items-center gap-1 ${!isAuthenticated || isEditMode ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:opacity-80"}`}
      >
        <Star
          className={`w-3 h-3 ${favorited ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"}`}
        />
        <span className="text-yellow-400 text-[11px]">{favoriteCount}</span>
      </button>
      <button
        onClick={
          !isOwner && isAuthenticated && !isEditMode
            ? onToggleLike
            : undefined
        }
        disabled={!isAuthenticated || isOwner || isEditMode}
        className={`bg-transparent border-none p-0 inline-flex items-center gap-1 ${!isAuthenticated || isOwner || isEditMode ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:opacity-80"}`}
      >
        <ThumbsUp
          className={`w-3 h-3 ${liked ? "fill-green-400 text-green-400" : "text-green-400"}`}
        />
        <span className="text-green-400 text-[11px]">{likeCount}</span>
      </button>
      {userName && userId && (
        <>
          <span className="text-slate-500 text-[11px]">-</span>
          <Link
            to={buildProfilePath({ userName, userId })}
            className="text-blue-400 hover:text-blue-300 text-[11px] truncate max-w-[80px]"
          >
            By {userName}
          </Link>
        </>
      )}
      {createdAt && !isSmallWidth && (
        <>
          <span className="text-slate-500 text-[11px]">-</span>
          <span className="text-slate-400 text-[11px] whitespace-nowrap">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </>
      )}
    </div>
  );
};
