import { Shield, Eye, ThumbsUp, Star } from "lucide-react";
import { useLatestCreatedGuides } from "../hooks/useLatestCreatedGuides";
import { Link } from "react-router-dom";
import { buildGuidePath } from "@/lib/config/urlHelpers";

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
            <h2 className="text-2xl relative bottom-[2px] font-bold text-yellow-100">
              Counter Guides
            </h2>
          </div>

          <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
            How to counter with handtraps
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-orange-300 text-2xl">Latest Counter Guides</h3>
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
                  className="flex items-start gap-2 p-2 bg-black border border-[#30303b] hover:border-slate-600 transition-all cursor-pointer min-w-0 relative"
                >
                  <div className="flex-shrink-0 p-1">
                    {guide.headerCardImageUrl ? (
                      <img
                        src={guide.headerCardImageUrl}
                        alt={guide.headerCardName || "Header card"}
                        className="w-[74px] h-[74px] object-cover border-2 border-[#30303b]"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".fallback-image")
                          ) {
                            const fallbackDiv = document.createElement("div");
                            fallbackDiv.className =
                              "fallback-image w-20 h-20 rounded-md border-2 border-amber-500/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl";
                            fallbackDiv.textContent =
                              guide.archetypeName?.charAt(0) || "?";
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-md border-2 border-amber-500/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
                        {guide.archetypeName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-24">
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
                  </div>

                  {/* Stats in top right corner */}
                  <div className="absolute top-2 right-2 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {(guide.views ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {(guide.favorites ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {(guide.likes ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Time ago in bottom right corner */}
                  <div className="absolute bottom-2 right-2">
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
          to="/guides?type=counter"
          className="relative mt-4 m-auto flex items-center text-[21px] justify-center px-3 py-1.5 text-orange-400 hover:text-orange-300 active:text-orange-600/90 cursor-pointer transition-all duration-150 border border-orange-500/45 hover:border-orange-400/60 active:border-orange-700/50 rounded-lg hover:bg-orange-500/20 active:bg-orange-700/20"
        >
          <span>View All Counter Guides</span>
        </Link>
      </div>
    </div>
  );
};
