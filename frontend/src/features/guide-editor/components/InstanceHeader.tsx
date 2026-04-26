import {
  Plus,
  Eye,
  Star,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Package,
  PackagePlus,
  PackageXIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { buildProfilePath } from "@/lib/config/urlHelpers";
import { useState, useRef, useEffect } from "react";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface InstanceHeaderProps {
  archetypeName: string;
  title: string;
  generalTip: string;
  headerCard: HeaderCard | null;
  isEditMode: boolean;
  onTitleChange: (value: string) => void;
  onGeneralTipChange: (value: string) => void;
  onSelectHeaderCard: (e?: React.MouseEvent<HTMLButtonElement>) => void;
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
  guideType?: "COUNTER" | "DECK";
  hasRecommendedDeck?: boolean;
  hasHandtraps?: boolean;
  hasBoardBreakers?: boolean;
  createdAt?: string;
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
  guideType = "COUNTER",
  isCreatingNew = false,
  onFavoriteToggle,
  onLikeToggle,
  isFavorited = false,
  isLiked = false,
  isAuthenticated = false,
  currentUserId,
  hasRecommendedDeck = false,
  hasHandtraps = false,
  hasBoardBreakers = false,
  createdAt,
}: InstanceHeaderProps) => {
  const isOwner = !!(
    currentUserId &&
    userId &&
    currentUserId.toString() === userId.toString()
  );

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [needsReadMore, setNeedsReadMore] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditMode && descriptionRef.current) {
      const element = descriptionRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxLines = 6;
      const maxHeight = lineHeight * maxLines;

      setNeedsReadMore(element.scrollHeight > maxHeight);
    }
  }, [generalTip, isEditMode]);

  const scrollToRecommendedDeck = () => {
    const deckSection = document.getElementById("recommended-deck-section");
    if (deckSection) {
      deckSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formattedCreatedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : null;

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mb-8 w-full">
      <div className="flex-shrink-0 mb-5 w-full lg:w-auto flex flex-col items-center gap-4">
        {headerCard ? (
          <div className="relative lg:top-8 w-48 sm:w-56 lg:w-64 h-auto">
            <CardTooltip
              imageUrl={headerCard.imageUrl}
              cardName={headerCard.name}
              cardId={headerCard.id}
            >
              <img
                src={headerCard.imageUrlCropped}
                alt={headerCard.name}
                className="w-full border-2 relative bottom-7 border-amber-500/90 rounded-[3px] h-auto object-contain cursor-pointer"
              />
            </CardTooltip>
            {isEditMode && (
              <button
                onClick={(e) => onSelectHeaderCard(e)}
                className="absolute m-auto inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Header Card"
              >
                <Plus className="w-12 h-12 text-white" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => isEditMode && onSelectHeaderCard(e)}
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

        {!isEditMode && guideType === "DECK" && hasRecommendedDeck && (
          <button
            onClick={scrollToRecommendedDeck}
            className="z-50 flex justify-center m-auto items-center gap-2 px-3 py-1.5 text-amber-500/90 font-medium hover:underline underline-offset-4"
          >
            <Package className="w-5 h-5" />
            <span>Show Deck</span>
          </button>
        )}

        {!isEditMode &&
          guideType === "COUNTER" &&
          (hasHandtraps || hasBoardBreakers) && (
            <div className="z-50 w-full flex items-center justify-center gap-2 text-amber-500/90 font-medium text-center">
              {hasHandtraps && (
                <>
                  <PackagePlus className="w-5 h-5 " />
                  <button
                    onClick={() => scrollToSection("handtraps-section")}
                    className="hover:underline underline-offset-4"
                  >
                    Handtraps
                  </button>
                </>
              )}

              {hasHandtraps && hasBoardBreakers && (
                <span className="text-amber-500/70">|</span>
              )}

              {hasBoardBreakers && (
                <>
                <PackageXIcon className="w-5 h-5" />
                  <button
                    onClick={() => scrollToSection("board-breakers-section")}
                    className="hover:underline underline-offset-4"
                  >
                    Board Breakers
                  </button>
                </>
              )}
            </div>
          )}
      </div>

      <div className="flex-1 min-w-0 w-full lg:relative lg:bottom-12">
        <div className="w-full flex flex-col items-start mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {archetypeName}
          </h2>
          <div className="flex w-full my-2">
            <div
              className="w-full h-[2px]"
              style={{
                background:
                  guideType === "COUNTER"
                    ? "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)"
                    : "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)",
              }}
            />
          </div>
        </div>

        <div className="w-full">
          <label className="text-blue-400 text-lg sm:text-xl font-semibold block">
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
              className="w-full px-4 py-2 bg-slate-800/40 text-white text-lg sm:text-xl font-normal rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 shadow-sm"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
            />
          ) : (
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white max-w-full break-words overflow-wrap-anywhere"
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                wordWrap: "break-word",
              }}
            >
              {title}
            </h1>
          )}
        </div>

        <div className="w-full mt-2">
          <label className="text-blue-400 text-lg sm:text-xl font-semibold mb-2 block">
            Description
          </label>
          {isEditMode ? (
            <textarea
              value={generalTip}
              onChange={(e) => onGeneralTipChange(e.target.value)}
              maxLength={3000}
              placeholder="Add optional description for this guide (Max. 3000 characters)"
              className="w-full px-4 py-3 bg-slate-800/40 text-white text-base rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 resize-none shadow-sm min-h-[120px] scrollbar-homeAllPages"
              rows={5}
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
            />
          ) : (
            <div className="w-full">
              <div
                className={`py-4 border-l-2 border-r-2 border-blue-700/30 bg-slate-900/30 px-4 rounded overflow-hidden transition-all duration-300 ${
                  isDescriptionExpanded || !needsReadMore ? "" : "max-h-[180px]"
                }`}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  wordWrap: "break-word",
                }}
              >
                <p
                  ref={descriptionRef}
                  className={`text-slate-300 text-base leading-relaxed break-words overflow-wrap-anywhere ${
                    !isDescriptionExpanded && needsReadMore
                      ? "line-clamp-6"
                      : ""
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {generalTip || "No description"}
                </p>
              </div>
              {needsReadMore && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="mt-2 flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Read less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Read more</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isCreatingNew && (
        <div className="flex-shrink-0 w-full lg:w-56 lg:relative lg:bottom-11">
          {formattedCreatedDate && (
            <div className="text-slate-500 text-xs mb-1 text-center flex justify-end">
              {formattedCreatedDate}
            </div>
          )}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
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
                onClick={
                  isAuthenticated && !isEditMode ? onFavoriteToggle : undefined
                }
                disabled={!isAuthenticated || isEditMode}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-colors ${
                  isFavorited
                    ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-white"
                } ${!isAuthenticated || isEditMode ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
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
                } ${!isAuthenticated || isOwner || isEditMode ? "cursor-not-allowed" : "cursor-pointer"}`}
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
