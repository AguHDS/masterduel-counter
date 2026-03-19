import { Plus, Eye, Star, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
}

interface InstanceHeaderProps {
  archetypeName: string;
  title: string;
  generalTip: string;
  headerCard: HeaderCard | null;
  isEditMode: boolean;
  onTitleChange: (value: string) => void;
  onGeneralTipChange: (value: string) => void;
  onSelectHeaderCard: () => void;
  views?: number;
  favorites?: number;
  likes?: number;
  userName?: string;
  userId?: number | string;
  userProfilePictureUrl?: string;
  isCreatingNew?: boolean;
  onFavoriteToggle?: () => void;
  onLikeToggle?: () => void;
  isFavorited?: boolean;
  isLiked?: boolean;
  isAuthenticated?: boolean;
  currentUserId?: number | string | null;
}

export const InstanceHeader = ({
  archetypeName,
  title,
  generalTip,
  headerCard,
  isEditMode,
  onTitleChange,
  onGeneralTipChange,
  onSelectHeaderCard,
  views = 0,
  favorites = 0,
  likes = 0,
  userName,
  userId,
  userProfilePictureUrl,
  isCreatingNew = false,
  onFavoriteToggle,
  onLikeToggle,
  isFavorited = false,
  isLiked = false,
  isAuthenticated = false,
  currentUserId,
}: InstanceHeaderProps) => {
  const isOwner = !!(
    currentUserId &&
    userId &&
    currentUserId.toString() === userId.toString()
  );

  return (
    <div className="flex items-start gap-8 mb-8 w-full">
      <div className="flex-shrink-0">
        {headerCard ? (
          <div className="relative top-8 w-60 h-auto overflow-hidden">
            <CardTooltip
              imageUrl={headerCard.imageUrl}
              cardName={headerCard.name}
              cardId={headerCard.id}
            >
              <img
                src={headerCard.imageUrl}
                alt={headerCard.name}
                className="w-full h-auto object-cover cursor-pointer"
              />
            </CardTooltip>
            {isEditMode && (
              <button
                onClick={onSelectHeaderCard}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                title="Change Header Card"
              >
                <Plus className="w-12 h-12 text-white" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => isEditMode && onSelectHeaderCard()}
            disabled={!isEditMode}
            className={`bg-gradient-to-br from-blue-800 to-slate-800 w-48 h-64 rounded-lg flex items-center justify-center border-2 border-blue-500 ${
              isEditMode
                ? "cursor-pointer hover:border-purple-500 transition-colors"
                : "cursor-default"
            }`}
            title={isEditMode ? "Select Header Card" : ""}
          >
            <Plus
              className={`w-12 h-12 ${
                isEditMode ? "text-purple-400" : "text-blue-300"
              }`}
            />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0 relative bottom-12">
        <div className="w-full flex flex-col items-start mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {archetypeName}
          </h1>
          <div className="flex w-full my-2">
            <div
              className="w-full h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)",
              }}
            />
          </div>
        </div>

        <div className="w-full">
          <label className="text-blue-400 text-xl font-semibold block">
            Title
          </label>
          {isEditMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const sanitizedValue = e.target.value.replace(/\s+/g, " ");
                onTitleChange(sanitizedValue);
              }}
              maxLength={100}
              placeholder="Enter a title for your guide (Max. 100 characters)"
              className="w-full max-w-[88%] px-4 py-2 bg-slate-800/40 text-white text-xl font-normal rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 shadow-sm"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
            />
          ) : (
            <h2
              className="text-3xl font-semibold text-white max-w-4xl break-words overflow-wrap-anywhere"
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                wordWrap: "break-word",
              }}
            >
              {title}
            </h2>
          )}
        </div>

        <div className="w-full mt-2">
          <label className="text-blue-400 text-xl font-semibold mb-2 block">
            Description
          </label>
          {isEditMode ? (
            <textarea
              value={generalTip}
              onChange={(e) => onGeneralTipChange(e.target.value)}
              maxLength={3000}
              placeholder="Add optional description for this guide (Max. 3000 characters)"
              className="w-full px-4 py-3 max-w-[88%] bg-slate-800/40 text-white text-base rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 resize-none shadow-sm min-h-[120px]"
              rows={5}
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
            />
          ) : (
            <div
              className="py-4 border-l-2 max-w-[88%] min-h-[250px] border-r-2 border-blue-700/30 bg-slate-900/30 px-4 rounded overflow-hidden"
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                wordWrap: "break-word",
              }}
            >
              <p
                className="text-slate-300 text-base leading-relaxed break-words overflow-wrap-anywhere"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {generalTip || "No description"}
              </p>
            </div>
          )}
        </div>
      </div>

      {!isCreatingNew && !isEditMode && (
        <div className="flex-shrink-0 w-56 relative bottom-10">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="flex flex-col gap-2">
              {userName && userId && (
                <>
                  <div className="flex flex-col py-1">
                    <Link
                      to={`/profile/${userId}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      {userProfilePictureUrl ? (
                        <img
                          src={userProfilePictureUrl}
                          alt={`${userName}'s profile`}
                          className="w-16 h-16 object-cover border-2 border-blue-400/50"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl border-2 border-blue-400/50">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col relative bottom-3">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                          Made by
                        </span>
                        <span className="text-blue-400 hover:text-blue-300 font-semibold text-base transition-colors">
                          {userName}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-1"></div>
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
                onClick={isAuthenticated ? onFavoriteToggle : undefined}
                disabled={!isAuthenticated}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-colors ${
                  isFavorited
                    ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-white"
                } ${!isAuthenticated ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                title={
                  !isAuthenticated
                    ? "Log in to favorite this guide"
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
                onClick={!isOwner && isAuthenticated ? onLikeToggle : undefined}
                disabled={!isAuthenticated || isOwner}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-colors ${
                  isLiked
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-white"
                } ${!isAuthenticated ? "cursor-not-allowed opacity-70" : isOwner ? "cursor-not-allowed" : "cursor-pointer"}`}
                title={
                  !isAuthenticated
                    ? "Log in to like this guide"
                    : isOwner
                      ? "You cannot like your own guide"
                      : isLiked
                        ? "Unlike this guide"
                        : "Like this guide"
                }
              >
                <div className="flex items-center gap-2">
                  <ThumbsUp
                    className={`w-4 h-4 ${isLiked ? "fill-green-400" : "text-green-400"}`}
                  />
                  <span className="text-sm font-medium text-green-400">
                    Like
                  </span>
                </div>
                <span
                  className={`font-semibold ${isLiked ? "text-green-400" : "text-green-400"}`}
                >
                  {likes}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
