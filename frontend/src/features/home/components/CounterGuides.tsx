import { Shield, Eye, ThumbsUp, Star } from "lucide-react";
import { useLatestCreatedGuides } from "../hooks/useLatestCreatedGuides";
import { Link } from "react-router-dom";
import { buildGuidePath, buildArchetypePath } from "@/lib/config/urlHelpers";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { useTrendingGuideRanking } from "@/features/ranking/hooks/useRanking";
import { TrendingRankBadge } from "@/shared/components/TrendingRankBadge";

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const CounterGuides = () => {
  const {
    data: guides,
    isLoading,
    error,
  } = useLatestCreatedGuides(10, "COUNTER");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: trendingGuideData } = useTrendingGuideRanking(currentMonth, 1, 50);
  const trendingRankByGuideId = new Map(
    (trendingGuideData?.ranking ?? []).map((guide) => [guide.id, guide.rank]),
  );

  if (isLoading) {
    return (
      <div className="relative w-full flex flex-col h-full overflow-hidden">
        <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden items-center justify-center">
          <div className="text-orange-300 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full flex flex-col h-full overflow-hidden">
        <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden items-center justify-center">
          <div className="text-red-400 text-center">Failed to load guides</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-2 w-full flex flex-col h-full overflow-hidden">
      <div className="relative z-10 flex flex-col h-full p-4 overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Shield className="w-7 h-7 text-orange-500" />
            <h2 className="text-xl lg:text-2xl relative bottom-[2px] font-bold text-yellow-100">
              Counter Guides
            </h2>
          </div>

          <p className="text-gray-300 text-lg lg:text-xl mb-1 relative top-1 left-11">
            How to counter with handtraps
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-orange-300 text-xl lg:text-2xl">Latest Counter Guides</h3>
        </div>

        <div className="flex-1 min-h-[320px] overflow-y-auto scrollbar-homeAllPages">
          {!guides || guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-orange-300">
              <p className="text-center text-sm">No guides created yet</p>
              <p className="text-xs text-gray-400 mt-2">
                Be the first to create one!
              </p>
            </div>
          ) : (
            guides.slice(0, 10).map((guide) => {
              const timeAgo = formatDate(guide.updatedAt);
              const trendingRank = trendingRankByGuideId.get(guide.id);

              return (
                <Link
                  key={guide.id}
                  to={buildGuidePath({
                    guideId: guide.id,
                    archetypeId: guide.archetypeId,
                    archetypeName: guide.archetypeName,
                    userName: guide.userName,
                    guideType: guide.guideType,
                  })}
                  className="flex max-[450px]:items-center items-start gap-2 p-2 bg-black border border-[#30303b] hover:border-slate-600 transition-all cursor-pointer min-w-0 relative"
                >
                  <div className="flex-shrink-0 p-1">
                    {guide.headerCardImageUrl ? (
                      <img
                        src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { size: 'thumbnail' })}
                        alt={guide.headerCardName || "Header card"}
                        className="w-[74px] h-[74px] max-[450px]:w-[60px] max-[450px]:h-[60px] object-cover border-2 border-[#30303b]" loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".fallback-image")
                          ) {
                            const fallbackDiv = document.createElement("div");
                            fallbackDiv.                            className =
                              "fallback-image w-20 h-20 max-[450px]:w-[60px] max-[450px]:h-[60px] rounded-md border-2 border-amber-500/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl";
                            fallbackDiv.textContent =
                              guide.archetypeName?.charAt(0) || "?";
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 max-[450px]:w-[60px] max-[450px]:h-[60px] rounded-md border-2 border-amber-500/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
                        {guide.archetypeName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  {/* MOBIE <= 450px screens */}
                  <div className="hidden max-[450px]:flex flex-1 min-w-0 flex-col gap-1">
                    <h4 className="text-yellow-200 font-semibold text-sm leading-snug line-clamp-2">
                      {guide.title}
                    </h4>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-gray-300 text-xs">By {guide.userName}</span>
                      <span className="text-gray-500 text-[10px]">•</span>
                      <span className="text-orange-400 text-xs">{guide.archetypeName}</span>
                    </div>

                    {(guide.hasHandtraps || guide.hasBoardbreakers) && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {guide.hasHandtraps && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded-md text-[9px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            Handtraps
                          </span>
                        )}
                        {guide.hasBoardbreakers && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded-md text-[9px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                            Board Breakers
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-purple-400">
                        <Eye className="w-3 h-3" />
                        <span className="text-[10px] font-medium">
                          {(guide.views ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-[10px] font-medium">
                          {(guide.likes ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3" />
                        <span className="text-[10px] font-medium">
                          {(guide.favorites ?? 0).toLocaleString()}
                        </span>
                      </div>
                      {typeof trendingRank === "number" && (
                        <TrendingRankBadge rank={trendingRank} compact />
                      )}
                      <span className="text-[10px] text-gray-500 ml-auto">{timeAgo}</span>
                    </div>
                  </div>

                  {/* 451px to lg screens */}
                  <div className="hidden min-[451px]:flex lg:hidden flex-1 min-w-0 items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-yellow-200 font-semibold text-base sm:text-lg line-clamp-2">
                        {guide.title}
                      </h4>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5 max-w-[220px]">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-purple-400">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {(guide.views ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {(guide.likes ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {(guide.favorites ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs truncate max-w-[200px] text-right leading-relaxed">
                        {guide.userName}<span className="text-gray-500"> • </span>{guide.archetypeName}
                      </p>
                      {(guide.hasHandtraps || guide.hasBoardbreakers) && (
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {guide.hasHandtraps && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                              Handtraps
                            </span>
                          )}
                          {guide.hasBoardbreakers && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                              Board Breakers
                            </span>
                          )}
                        </div>
                      )}
                      {typeof trendingRank === "number" && (
                        <TrendingRankBadge rank={trendingRank} compact />
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
                    </div>
                  </div>

                  {/* DESKTOP LAYOUT lg+ screens */}
                  <div className="hidden lg:block flex-1 min-w-0 lg:pr-24">
                    <h4 className="text-yellow-200 font-semibold text-lg line-clamp-2">
                      {guide.title}
                    </h4>

                    <div className="flex items-center gap-2">
                      <p className="text-gray-300 text-sm font-medium truncate">
                        By {guide.userName}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-orange-400 text-sm truncate">
                        {guide.archetypeName}
                      </p>
                    </div>

                    {(guide.hasHandtraps || guide.hasBoardbreakers) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {guide.hasHandtraps && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            Handtraps
                          </span>
                        )}
                        {guide.hasBoardbreakers && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                            Board Breakers
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP absolute stats */}
                  <div className="hidden lg:flex absolute top-2 right-2 flex-col items-end gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-purple-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {(guide.views ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {(guide.likes ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {(guide.favorites ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {typeof trendingRank === "number" && (
                      <TrendingRankBadge rank={trendingRank} compact applyRelativePosition />
                    )}
                  </div>

                  {/* DESKTOP absolute date */}
                  <div className="hidden lg:block absolute bottom-2 right-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <Link
          to={buildArchetypePath({ guideType: "COUNTER" })}
          className="relative mt-4 m-auto flex items-center text-[21px] max-[650px]:text-sm justify-center px-3 max-[650px]:px-2.5 py-1.5 max-[650px]:py-1 text-orange-400 hover:text-orange-300 active:text-orange-600/90 cursor-pointer transition-all duration-150 border border-orange-500/45 hover:border-orange-400/60 active:border-orange-700/50 rounded-lg hover:bg-orange-500/20 active:bg-orange-700/20"
        >
          <span>View All Counter Guides</span>
        </Link>
      </div>
    </div>
  );
};
