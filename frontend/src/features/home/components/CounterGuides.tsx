import { Shield, ArrowRight } from "lucide-react";
import { useLatestCreatedGuides } from "../hooks/useLatestCreatedGuides";
import { useNavigate } from "react-router-dom";
import backgroundImage from "@/assets/home-rework/background_container_red.webp";

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const CounterGuides = () => {
  const navigate = useNavigate();
  const { data: guides, isLoading, error } = useLatestCreatedGuides(3);

  const handleGuideClick = (archetypeId: number, instanceId: number) => {
    navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
  };

  const handleViewAll = () => {
    navigate("/counter-guides");
  };

  return (
    <div className="relative w-full flex flex-col h-full  overflow-hidden border border-orange-500/30">
      {/* background único */}
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden">
        {/* loading */}
        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-orange-300 text-lg">Loading...</div>
          </div>
        )}

        {/* error */}
        {error && !isLoading && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-red-400 text-center">
              Failed to load guides
            </div>
          </div>
        )}

        {/* contenido */}
        {!isLoading && !error && (
          <>
            <div className="mb-2">
              <div className="flex items-center gap-4">
                <Shield className="w-7 h-7 text-orange-400" />
                <h2 className="text-3xl relative bottom-[2px] font-bold text-yellow-100">
                  Counter Guides
                </h2>
              </div>

              <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
                Learn how to beat the meta.
              </p>
            </div>

            <div className="mb-20 relative top-14">
              <h3 className="text-orange-300 text-2xl">
                Latest Counter Guides
              </h3>
            </div>

            <div className="flex-1 min-h-0 mb-2 space-y-1">
              {!guides || guides.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-orange-300">
                  <p className="text-center text-sm">No guides created yet</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Be the first to create one!
                  </p>
                </div>
              ) : (
                guides.slice(0, 3).map((guide) => {
                  const timeAgo = getTimeAgo(guide.createdAt);

                  return (
                    <div
                      key={guide.id}
                      onClick={() =>
                        handleGuideClick(guide.archetypeId, guide.id)
                      }
                      className="flex items-start gap-3 p-2 rounded-lg bg-black/40 border border-red-500/20 hover:border-orange-400/50 hover:bg-black/60 transition-all cursor-pointer min-w-0"
                    >
                      <div className="flex-shrink-0">
                        {guide.headerCardImageUrl ? (
                          <img
                            src={guide.headerCardImageUrl}
                            alt=""
                            className="w-20 h-24 rounded-lg border-2 border-orange-400/50 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-[70px] rounded-lg border-2 border-orange-400/50 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                            {guide.archetypeName?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-yellow-200 font-semibold text-md mb-1 line-clamp-1">
                          {guide.title}
                        </h4>

                        <p className="text-sm text-gray-400">
                          by {guide.userName}
                        </p>

                        <div className="flex justify-end mt-2">
                          <span className="text-xs text-gray-500">
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
              className="relative top-1 flex items-center justify-center gap-2 text-orange-400 hover:text-orange-300 text-[20px] cursor-pointer transition-colors"
            >
              View All Counter Guides
              <ArrowRight className="w-5 h-5" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
