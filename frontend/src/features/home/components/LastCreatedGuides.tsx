import { Eye, Heart, Clock, User } from "lucide-react";
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

const getDefaultAvatar = (userName: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
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
          <h3 className="text-2xl font-bold text-white">Lastest Counter Guides</h3>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-comments">
          {!guides || guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-300">
              <p className="text-center">No guides created yet</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to create one!</p>
            </div>
          ) : (
            guides.map((guide) => {
              const avatarUrl = guide.userProfilePictureUrl || getDefaultAvatar(guide.userName);
              const timeAgo = getTimeAgo(guide.createdAt);
              
              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide.archetypeId, guide.id)}
                  className="p-4 rounded-lg bg-black/40 border border-blue-500/30 hover:border-blue-400/50 hover:bg-black/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={guide.userName}
                        className="w-10 h-10 rounded-full border-2 border-blue-400/50 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultAvatar(guide.userName);
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{guide.userName}</p>
                      <p className="text-blue-300 text-sm line-clamp-2">{guide.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{guide.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-pink-400">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{guide.likes.toLocaleString()}</span>
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
