import { Eye, Star, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { buildProfilePath } from "@/lib/config/urlHelpers";

interface GuideHeaderStatsProps {
  formattedCreatedDate: string | null;
  userName?: string;
  userId?: number | string;
  userProfilePictureUrl?: string;
  views: number;
  favorites: number;
  likes: number;
  isFavorited: boolean;
  isLiked: boolean;
  isAuthenticated: boolean;
  isEditMode: boolean;
  isOwner: boolean;
  onFavoriteToggle?: () => void;
  onLikeToggle?: () => void;
}

export const GuideHeaderStats = ({
  formattedCreatedDate,
  userName,
  userId,
  userProfilePictureUrl,
  views,
  favorites,
  likes,
  isFavorited,
  isLiked,
  isAuthenticated,
  isEditMode,
  isOwner,
  onFavoriteToggle,
  onLikeToggle,
}: GuideHeaderStatsProps) => {
  return (
    <>
      {formattedCreatedDate && (
        <div className="text-slate-500 text-xs mb-1 text-center lg:text-right lg:flex lg:justify-end">
          {formattedCreatedDate}
        </div>
      )}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 sm:p-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <div className="flex flex-col gap-2">
          {userName && userId && (
            <>
              <div className="flex flex-col py-1">
                <Link
                  to={buildProfilePath({ userName, userId })}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    username={userName}
                    profilePictureUrl={userProfilePictureUrl}
                    size="lg"
                    className="w-16 h-16 border-blue-400/50"
                  />
                  <div className="flex flex-col relative bottom-3 min-w-0">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                      Made by
                    </span>
                    <span className="text-blue-400 hover:text-blue-300 font-semibold text-base transition-colors break-all">
                      {userName}
                    </span>
                  </div>
                </Link>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-1" />
            </>
          )}

          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">
                Views
              </span>
            </div>
            <span className="text-purple-400 font-semibold">{views}</span>
          </div>

          <button
            onClick={
              isAuthenticated && !isEditMode ? onFavoriteToggle : undefined
            }
            disabled={!isAuthenticated || isEditMode}
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-colors ${
              isFavorited
                ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                : "bg-slate-800/50 hover:bg-slate-700/50 text-white"
            } ${
              !isAuthenticated || isEditMode
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }`}
            title={
              !isAuthenticated
                ? "Log in to favorite this guide"
                : isEditMode
                  ? "Cannot favorite while editing"
                  : isFavorited
                    ? "Remove from favorites"
                    : "Add to favorites"
            }
          >
            <div className="flex items-center gap-2">
              <Star
                className={`w-4 h-4 ${isFavorited ? "fill-yellow-400" : "text-yellow-400"}`}
              />
              <span className="text-sm font-medium text-yellow-400">
                Favorite
              </span>
            </div>
            <span
              className={`font-semibold ${isFavorited ? "text-yellow-400" : "text-yellow-400"}`}
            >
              {favorites}
            </span>
          </button>

          <button
            onClick={
              !isOwner && isAuthenticated && !isEditMode
                ? onLikeToggle
                : undefined
            }
            disabled={!isAuthenticated || isOwner || isEditMode}
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-colors ${
              isLiked
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-slate-800/50 hover:bg-slate-700/50 text-white"
            } ${
              !isAuthenticated || isOwner || isEditMode
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            title={
              !isAuthenticated
                ? "Log in to like this guide"
                : isOwner
                  ? "You cannot like your own guide"
                  : isEditMode
                    ? "Cannot like while editing"
                    : isLiked
                      ? "Unlike this guide"
                      : "Like this guide"
            }
          >
            <div className="flex items-center gap-2">
              <ThumbsUp
                className={`w-4 h-4 ${isLiked ? "fill-green-400" : "text-green-400"}`}
              />
              <span className="text-sm font-medium text-green-400">Like</span>
            </div>
            <span
              className={`font-semibold ${isLiked ? "text-green-400" : "text-green-400"}`}
            >
              {likes}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
