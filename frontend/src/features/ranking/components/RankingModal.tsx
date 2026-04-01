import React, { useState } from "react";
import { X, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRanking } from "../hooks/useRanking";
import { Avatar } from "@/shared/components/DefaultAvatar";

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserClick: (username: string, userId: string) => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  onUserClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  const { data, isLoading, error } = useRanking(currentPage, limit);

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-500/20 to-amber-600/20",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-purple-700/40 to-blue-500/20",
          border: "border-gray-400/30",
          text: "text-gray-300",
          icon: "text-gray-400",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-yellow-700/20 to-amber-800/50",
          border: "border-amber-700/30",
          text: "text-amber-600",
          icon: "text-amber-700",
        };
      default:
        return {
          bg: "bg-blue-950/30",
          border: "border-blue-800/30",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[#c2901c]/30 bg-[#1f1a24]">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-[#c2901c]" />
            <h2 className="text-xl font-bold text-white">User Ranking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-cardpair">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-white">Loading ranking...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-500">
                Error loading ranking. Please try again.
              </div>
            </div>
          )}

          {data && data.ranking.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-400">No users in ranking yet.</div>
            </div>
          )}

          {data && data.ranking.length > 0 && (
            <div className="divide-y divide-[#c2901c]/10">
              {data.ranking.map((user) => {
                const styles = getRankStyles(user.rank);

                return (
                  <div
                    key={user.userId}
                    onClick={() => onUserClick(user.username, user.userId)}
                    className={`p-4 hover:bg-[#2a2430] transition-colors cursor-pointer ${styles.bg}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 text-center font-bold ${styles.text}`}
                      >
                        #{user.rank}
                      </div>

                      <Avatar
                        username={user.username}
                        profilePictureUrl={user.profilePictureUrl}
                        size="lg"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white hover:text-[#c2901c] transition-colors truncate">
                            {user.username}
                          </span>
                          {user.rank <= 3 && (
                            <Crown
                              className={`w-4 h-4 flex-shrink-0 ${styles.icon}`}
                            />
                          )}
                        </div>
                        <div className="text-sm text-green-500">
                          {user.totalLikes.toLocaleString()} Likes
                        </div>
                      </div>

                      {user.rank <= 3 && (
                        <div
                          className={`text-xs font-bold px-3 py-1 rounded-full ${styles.bg} ${styles.border} border ${styles.text} flex-shrink-0`}
                        >
                          Top {user.rank}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="sticky bottom-0 flex items-center justify-between p-4 border-t border-[#c2901c]/30 bg-[#1f1a24]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 px-3 py-2 bg-[#c2901c]/10 hover:bg-[#c2901c]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-white text-sm">
              Page {data.pagination.page} of {data.pagination.totalPages} (
              {data.pagination.total} users)
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(data.pagination.totalPages, prev + 1)
                )
              }
              disabled={currentPage === data.pagination.totalPages}
              className="flex items-center space-x-1 px-3 py-2 bg-[#c2901c]/10 hover:bg-[#c2901c]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};