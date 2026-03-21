import { Shield, Eye, ThumbsUp, Star } from "lucide-react";
import { useLatestCreatedGuides } from "../hooks/useLatestCreatedGuides";
import { useNavigate } from "react-router-dom";

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

export const CounterGuides = () => {
  const navigate = useNavigate();
  const { data: guides, isLoading, error } = useLatestCreatedGuides(5);

  const handleGuideClick = (archetypeId: number, instanceId: number) => {
    navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
  };

  const handleViewAll = () => {
    navigate("/counter-guides");
  };

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
      <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden">
        <div>
          <div className="flex items-center gap-4">
            <Shield className="w-7 h-7 text-orange-500" />
            <h2 className="text-3xl relative bottom-[2px] font-bold text-yellow-100">
              Counter Guides
            </h2>
          </div>

          <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
            How to counter with handtraps 
          </p>
        </div>

        <div className="mb-12 relative top-5">
          <h3 className="text-orange-300 text-2xl">Latest Counter Guides</h3>
        </div>

        <div className="flex-1 relative bottom-6 min-h-0 overflow-y-auto scrollbar-counterguides">
          {!guides || guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-orange-300">
              <p className="text-center text-sm">No guides created yet</p>
              <p className="text-xs text-gray-400 mt-2">
                Be the first to create one!
              </p>
            </div>
          ) : (
            guides.slice(0, 5).map((guide) => {
              const timeAgo = getTimeAgo(guide.createdAt);

              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide.archetypeId, guide.id)}
                  className="flex items-start relative top-3 gap-3 p-1 bg-black/40 border border-red-500/30 hover:border-amber-500/60 hover:bg-black/60 transition-all cursor-pointer min-w-0"
                >
                  <div className="flex-shrink-0">
                    {guide.headerCardImageUrl ? (
                      <img
                        src={guide.headerCardImageUrl}
                        alt={guide.headerCardName || "Header card"}
                        className="w-24 h-24 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".fallback-image")
                          ) {
                            const fallbackDiv = document.createElement("div");
                            fallbackDiv.className =
                              "fallback-image w-20 h-24 rounded-lg border-2 border-orange-400/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl";
                            fallbackDiv.textContent =
                              guide.archetypeName?.charAt(0) || "?";
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-lg border-2 border-orange-400/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                        {guide.archetypeName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-md truncate">
                        {guide.userName}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-orange-400 text-sm truncate">
                        {guide.archetypeName}
                      </p>
                    </div>

                    <h4 className="text-yellow-200 font-semibold text-md mb-1 line-clamp-2">
                      {guide.title}
                    </h4>

                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-purple-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {guide.views.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {guide.favorites?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {guide.likes.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          onClick={handleViewAll}
          className="relative top-3 m-auto flex items-center justify-center px-3 py-1.5 text-orange-400/90 hover:text-orange-300 active:text-orange-600/90 text-[20px] cursor-pointer transition-all duration-150 border border-orange-500/30 hover:border-orange-400/60 active:border-orange-700/50 rounded-lg bg-transparent hover:bg-orange-500/5 active:bg-orange-700/20 backdrop-blur-sm"
        >
          <span>View All Counter Guides</span>
        </div>
      </div>
    </div>
  );
};
