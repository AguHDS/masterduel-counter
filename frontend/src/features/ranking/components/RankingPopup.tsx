import React, { useRef, useEffect } from "react";
import { Crown } from "lucide-react";
import type { RankingUser } from "../types/ranking.types";
import { Avatar } from "@/shared/components/DefaultAvatar";

interface RankingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  users: RankingUser[];
  onUserClick: (username: string, userId: string) => void;
  onViewFullRanking: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  isLoading?: boolean;
  alignRight?: boolean;
}

export const RankingPopup: React.FC<RankingPopupProps> = ({
  isOpen,
  onClose,
  users,
  onUserClick,
  onViewFullRanking,
  triggerRef,
  isLoading = false,
  alignRight = false,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        triggerRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

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
    <div
      ref={popupRef}
      className={`absolute mt-2 w-80 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl overflow-hidden z-50 ${
        alignRight ? "right-0" : "left-0"
      }`}
      style={{ top: "100%" }}
    >
      <div className="p-3 border-b border-[#c2901c]/30">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-[#c2901c]" />
          <h3 className="text-white font-semibold">Top 50 Users</h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-cardpair">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-sm">Loading ranking...</div>
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-400 text-sm">No users in ranking yet.</div>
          </div>
        )}

        {!isLoading &&
          users.map((user) => {
            const styles = getRankStyles(user.rank);

            return (
              <div
                key={user.userId}
                onClick={() => onUserClick(user.username, user.userId)}
                className={`p-3 border-b border-[#c2901c]/10 hover:bg-[#2a2430] transition-colors cursor-pointer ${styles.bg}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 text-center font-bold ${styles.text}`}>
                    #{user.rank}
                  </div>

                  <Avatar
                    username={user.username}
                    profilePictureUrl={user.profilePictureUrl}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white hover:text-[#c2901c] transition-colors truncate">
                        {user.username}
                      </span>
                      {user.rank <= 3 && (
                        <Crown
                          className={`w-3 h-3 flex-shrink-0 ${styles.icon}`}
                        />
                      )}
                    </div>
                    {user.totalLikes > 0 && (
                      <div className="text-xs text-green-500">
                        {user.totalLikes.toLocaleString()} Likes
                      </div>
                    )}
                  </div>

                  {user.rank <= 3 && (
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-full ${styles.bg} ${styles.border} border ${styles.text} flex-shrink-0`}
                    >
                      Top {user.rank}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className="p-2 border-t border-[#c2901c]/30 bg-[#151017]">
        <button
          onClick={onViewFullRanking}
          className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] transition-colors py-1"
        >
          View Full Ranking →
        </button>
      </div>
    </div>
  );
};