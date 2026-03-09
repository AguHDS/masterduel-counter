import { Eye, Clock, ThumbsUp, Star } from "lucide-react";
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

export const LastCreatedGuides = () => {
  const navigate = useNavigate();
  const { data: guides, isLoading, error } = useLatestCreatedGuides(5);

  if (isLoading) {
    return (
      <div className="relative flex flex-col h-full">
        <div
          className="absolute inset-0 rounded-[26px] opacity-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(99, 102, 241, 0.3) 100%)",
          }}
        />
        <div className="relative z-10 p-6 flex flex-col h-full items-center justify-center">
          <div className="text-blue-300 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex flex-col h-full">
        <div
          className="absolute inset-0 rounded-[26px] opacity-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(99, 102, 241, 0.3) 100%)",
          }}
        />
        <div className="relative z-10 p-6 flex flex-col h-full items-center justify-center">
          <div className="text-red-400 text-center">Failed to load guides</div>
        </div>
      </div>
    );
  }

  const handleGuideClick = (archetypeId: number, instanceId: number) => {
    navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
  };

  return (
    <div className="relative flex flex-col h-full">
      <div
        className="absolute inset-0 rounded-[26px] opacity-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(99, 102, 241, 0.3) 100%)",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg">
            <Clock className="w-6 h-6 text-blue-300" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Latest Counter Guides
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-comments">
          {!guides || guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-300">
              <p className="text-center">No guides created yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Be the first to create one!
              </p>
            </div>
          ) : (
            guides.map((guide) => {
              const timeAgo = getTimeAgo(guide.createdAt);

              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide.archetypeId, guide.id)}
                  className="p-4 rounded-lg bg-black/40 border border-blue-500/30 hover:border-blue-400/50 hover:bg-black/60 transition-all cursor-pointer mb-3 last:mb-0"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex-shrink-0">
                      {guide.headerCardImageUrl ? (
                        <img
                          src={guide.headerCardImageUrl}
                          alt={guide.headerCardName || "Header card"}
                          className="w-12 h-12 rounded-lg border-2 border-blue-400/50 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="w-12 h-12 rounded-lg border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                ${guide.archetypeName?.charAt(0) || "?"}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {guide.archetypeName?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold truncate">
                          {guide.userName}
                        </p>
                        <span className="text-xs text-gray-500">•</span>
                        <p className="text-blue-400 text-sm truncate">
                          {guide.archetypeName}
                        </p>
                      </div>
                      <p className="text-blue-300 text-md line-clamp-2">
                        {guide.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {timeAgo}
                    </span>
                  </div>

                  <div className="flex justify-end items-center ml-16 gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">
                        {guide.views.toLocaleString()}
                      </span>
                    </div>
                    {/* Favoritos - agregado entre el ojo y el thumbs up */}
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="font-medium">
                        {guide.favorites?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-500">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">
                        {guide.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
