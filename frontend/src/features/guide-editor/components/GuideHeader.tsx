import {
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  PackagePlus,
  PackageXIcon,
} from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { useState, useRef, useEffect } from "react";
import { GuideHeaderStats } from "./GuideHeaderStats";
import { TrendingBadge } from "./TrendingBadge";
import { useGuideBestTrending } from "@/features/ranking/hooks/useRanking";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlCropped: string;
}

interface GuideHeaderProps {
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
  guideId?: number;
}
/**
 * Header component displaying guide metadata and edit controls
 */
export const GuideHeader = ({
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
  guideId,
}: GuideHeaderProps) => {
  const isOwner = !!(
    currentUserId &&
    userId &&
    currentUserId.toString() === userId.toString()
  );

  // Fetch best trending achievement for this guide
  const { data: bestTrendingData } = useGuideBestTrending(guideId || 0);
  const bestTrending = bestTrendingData?.bestTrending;

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
      {/* Archetype name above header card on sm-lg screens */}
      <div className="max-[639px]:block sm:block lg:hidden w-full text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {archetypeName}
        </h2>
        <div className="flex w-full justify-center my-2">
          <div className="w-48 h-[2px]" style={{
            background: guideType === "COUNTER"
              ? "linear-gradient(90deg, rgb(241 131 57) 20%, rgb(255 235 0) 100%)"
              : "linear-gradient(90deg, rgb(59 130 246) 20%, rgb(147 51 234) 100%)",
          }} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-96 max-[950px]:gap-52 max-[750px]:gap-32 w-full lg:w-auto sm:items-center sm:justify-center">
        <div className="flex-shrink-0 mb-5 max-[639px]:w-full w-auto lg:w-auto flex flex-col items-center gap-4 max-[639px]:gap-2">
        {headerCard ? (
          <div className="relative lg:top-8 w-48 sm:w-56 lg:w-64 h-auto">
            <CardTooltip
              imageUrl={headerCard.imageUrl}
              cardName={headerCard.name}
              cardId={headerCard.id}
            >
              <img
                src={getOptimizedCardImageUrl(headerCard.imageUrlCropped, {
                  size: "thumbnail",
                  width: 300,
                  height: 300,
                })}
                alt={headerCard.name}
                className="w-full border-2 relative bottom-7 max-[639px]:bottom-0 sm:bottom-0 lg:bottom-7 border-amber-500/90 rounded-[3px] h-auto object-contain cursor-pointer"
                loading="lazy"
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

        {!isCreatingNew && (
          <div className="max-[639px]:hidden sm:block lg:hidden flex-shrink-0 sm:w-56 relative sm:bottom-9">
            <GuideHeaderStats
              formattedCreatedDate={formattedCreatedDate}
              userName={userName}
              userId={userId}
              userProfilePictureUrl={userProfilePictureUrl}
              views={views}
              favorites={favorites}
              likes={likes}
              isFavorited={isFavorited}
              isLiked={isLiked}
              isAuthenticated={isAuthenticated}
              isEditMode={isEditMode}
              isOwner={isOwner}
              onFavoriteToggle={onFavoriteToggle}
              onLikeToggle={onLikeToggle}
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 w-full lg:relative lg:bottom-12">
        <div className="w-full flex flex-col items-start mb-2 max-[639px]:hidden sm:hidden lg:block">
          <div className="w-full relative mb-3">
            {!isEditMode && bestTrending && (
              <div className="absolute left-1/2 max-[436px]:ml-10 -translate-x-1/2 top-7 -translate-y-1/2">
                <TrendingBadge bestTrending={bestTrending} />
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {archetypeName}
            </h2>
          </div>

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
        <div className="hidden max-[639px]:block lg:block flex-shrink-0 w-56 mx-auto lg:mx-0 lg:relative lg:bottom-11">
          <GuideHeaderStats
            formattedCreatedDate={formattedCreatedDate}
            userName={userName}
            userId={userId}
            userProfilePictureUrl={userProfilePictureUrl}
            views={views}
            favorites={favorites}
            likes={likes}
            isFavorited={isFavorited}
            isLiked={isLiked}
            isAuthenticated={isAuthenticated}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onFavoriteToggle={onFavoriteToggle}
            onLikeToggle={onLikeToggle}
          />
        </div>
      )}
    </div>
  );
};
