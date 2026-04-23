import React from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Inbox,
  Layers,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { NotificationBell, NotificationPopup } from "@/features/notifications";
import { Avatar } from "@/shared/components/DefaultAvatar";
import { buildGuidePath, buildProfilePath } from "@/lib/config/urlHelpers";
import discordSvgIcon from "../../../assets/discord-square-icon.webp";
import type { User as AuthUser } from "@/features/auth/context/AuthContext";
import type { RankingUser, RankingGuide } from "@/features/ranking/types/ranking.types";

interface RankStyles {
  bg: string;
  text: string;
  icon: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
  // ranking
  rankingUsers: RankingUser[] | undefined;
  rankingGuides: RankingGuide[] | undefined;
  isLoadingRanking: boolean;
  isLoadingGuideRanking: boolean;
  isMobileRankingOpen: boolean;
  mobileRankingTab: "guides" | "users";
  onToggleMobileRanking: () => void;
  onSetMobileRankingTab: (tab: "guides" | "users") => void;
  onUserClick: (username: string, userId: string) => void;
  onViewFullRanking: () => void;
  getRankStyles: (rank: number) => RankStyles;
  // requests
  isMobileRequestsOpen: boolean;
  onToggleMobileRequests: () => void;
  onOpenCreate: () => void;
  onOpenFullModal: () => void;
}

/** Navbar content for mobile view (sm and below) */
export const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({
  isOpen,
  isLoading,
  isAuthenticated,
  user,
  isAdmin,
  onClose,
  onLogout,
  rankingUsers,
  rankingGuides,
  isLoadingRanking,
  isLoadingGuideRanking,
  isMobileRankingOpen,
  mobileRankingTab,
  onToggleMobileRanking,
  onSetMobileRankingTab,
  onUserClick,
  onViewFullRanking,
  getRankStyles,
  isMobileRequestsOpen,
  onToggleMobileRequests,
  onOpenCreate,
  onOpenFullModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden absolute top-full left-0 right-0 bg-[#1f1a24] border-b border-[#c2901c]/30 shadow-xl py-4 px-4 z-50">
      <div className="flex flex-col space-y-3">
        {!isLoading && isAuthenticated && user && (
          <div className="pb-3 mb-3 border-b border-[#c2901c]/30">
            <div className="text-sm text-gray-300">
              Welcome,{" "}
              <span className="font-semibold text-blue-400">{user.name}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Link
            to="/cards"
            onClick={onClose}
            className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 py-2 w-full text-left"
          >
            <Layers className="h-4 w-4" />
            <span>CARDS</span>
          </Link>

          {/* Ranking */}
          <button
            onClick={onToggleMobileRanking}
            className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 w-full text-left"
          >
            <Crown className="h-4 w-4" />
            <span>
              Ranking
              {rankingUsers && rankingUsers.length > 0 && ` (${rankingUsers.length})`}
            </span>
          </button>

          {isMobileRankingOpen && (
            <div className="ml-2 bg-[#2a2430] rounded-lg border border-[#c2901c]/30 overflow-hidden">
              <div className="flex border-b border-[#c2901c]/20">
                {(["guides", "users"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onSetMobileRankingTab(tab)}
                    className={`flex-1 py-2 text-[11px] font-bold tracking-widest transition-all ${
                      mobileRankingTab === tab
                        ? "bg-[#c2901c] text-black"
                        : "text-[#c2901c]/60 hover:text-[#c2901c]"
                    }`}
                  >
                    {tab === "guides" ? "GUIDES" : "USERS"}
                  </button>
                ))}
              </div>

              <div className="max-h-72 overflow-y-auto scrollbar-cardpair p-2">
                {/* Users tab */}
                {mobileRankingTab === "users" &&
                  (isLoadingRanking ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      Loading...
                    </div>
                  ) : rankingUsers && rankingUsers.length > 0 ? (
                    rankingUsers.map((rankUser) => {
                      const styles = getRankStyles(rankUser.rank);
                      return (
                        <a
                          key={rankUser.userId}
                          href={buildProfilePath({
                            userName: rankUser.username,
                            userId: rankUser.userId,
                          })}
                          onClick={(e) => {
                            e.preventDefault();
                            onUserClick(rankUser.username, rankUser.userId);
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer no-underline ${styles.bg}`}
                        >
                          <div className={`w-6 text-center font-bold text-xs ${styles.text}`}>
                            #{rankUser.rank}
                          </div>
                          <Avatar
                            username={rankUser.username}
                            profilePictureUrl={rankUser.profilePictureUrl}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-sm truncate block">
                              {rankUser.username}
                            </span>
                            <span className="text-xs text-emerald-400">
                              {rankUser.totalLikes} Likes
                            </span>
                          </div>
                          {rankUser.rank <= 3 && (
                            <Crown className={`w-3 h-3 flex-shrink-0 ${styles.icon}`} />
                          )}
                        </a>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No users yet
                    </div>
                  ))}

                {/* Guides tab */}
                {mobileRankingTab === "guides" &&
                  (isLoadingGuideRanking ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      Loading...
                    </div>
                  ) : rankingGuides && rankingGuides.length > 0 ? (
                    rankingGuides.map((guide) => {
                      const isCounter = guide.guideType === "COUNTER";
                      return (
                        <a
                          key={guide.id}
                          href={buildGuidePath({
                            guideId: guide.id,
                            archetypeName: guide.archetypeName,
                            userName: guide.authorName,
                            guideType: guide.guideType,
                          })}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = buildGuidePath({
                              guideId: guide.id,
                              archetypeName: guide.archetypeName,
                              userName: guide.authorName,
                              guideType: guide.guideType,
                            });
                            onClose();
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer no-underline"
                        >
                          <div
                            className={`w-6 text-center font-bold text-xs ${
                              guide.rank === 1
                                ? "text-yellow-400"
                                : guide.rank === 2
                                  ? "text-slate-300"
                                  : guide.rank === 3
                                    ? "text-amber-500"
                                    : "text-gray-500"
                            }`}
                          >
                            #{guide.rank}
                          </div>
                          <div className="w-9 h-9 flex-shrink-0 rounded overflow-hidden border border-[#c2901c]/20 bg-[#0d0b10]">
                            {guide.headerImageUrl ? (
                              <img
                                src={guide.headerImageUrl}
                                alt={guide.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-sm truncate block">
                              {guide.title}
                            </span>
                            <span className="text-xs text-gray-500 truncate block">
                              {guide.authorName} · {guide.archetypeName}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${isCounter ? "text-amber-500" : "text-blue-400"}`}
                            >
                              {isCounter ? "Counter Guide" : "Deck Guide"}
                            </span>
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No guides yet
                    </div>
                  ))}
              </div>

              <button
                onClick={onViewFullRanking}
                className="w-full text-center text-xs text-[#c2901c] hover:text-[#d4a534] transition-colors py-2 border-t border-[#c2901c]/30"
              >
                View Full Ranking →
              </button>
            </div>
          )}

          {/* Guide Requests */}
          <button
            onClick={onToggleMobileRequests}
            className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 w-full text-left"
          >
            <Inbox className="h-4 w-4" />
            <span>Guide Requests</span>
          </button>

          {isMobileRequestsOpen && (
            <div className="ml-2 bg-[#2a2430] rounded-lg border border-[#c2901c]/30 overflow-hidden">
              <button
                onClick={onOpenCreate}
                className="w-full text-left px-4 py-2.5 text-[#c2901c] text-xs font-medium hover:bg-[#c2901c]/10 border-b border-[#c2901c]/20 transition-colors"
              >
                + Request a Guide
              </button>
              <button
                onClick={onOpenFullModal}
                className="w-full text-left px-4 py-2.5 text-slate-300 text-xs hover:bg-[#c2901c]/10 transition-colors"
              >
                View all requests →
              </button>
            </div>
          )}

          {!isLoading && isAuthenticated && user ? (
            <>
              <div className="relative">
                <NotificationBell isMobile={true} />
                <NotificationPopup isMobile={true} />
              </div>

              <Link
                to={buildProfilePath({ userName: user.name, userId: user.id })}
                onClick={onClose}
                className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-500 text-sm font-medium hover:opacity-80 transition-opacity py-2 text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2 text-yellow-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          ) : !isLoading ? (
            <>
              <Link
                to="/signin"
                onClick={onClose}
                className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="flex items-center gap-2 text-green-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </>
          ) : null}

          {/* Discord */}
          <a
            href="https://discord.gg/wzkGb4Zgnw"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 border-t border-[#c2901c]/30 pt-4 mt-2"
          >
            <img src={discordSvgIcon} alt="Discord logo" className="w-5 h-5" />
            <span>Join Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
};
