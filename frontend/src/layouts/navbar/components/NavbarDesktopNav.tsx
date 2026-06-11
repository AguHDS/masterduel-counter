import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Crown, MailWarning, LogIn, UserPlus, Shield } from "lucide-react";
import { GuideRequestNavbarPopup } from "@/features/guide-request";
import { NotificationBell, NotificationPopup } from "@/features/notifications";
import { RankingPopup } from "@/features/ranking/components/RankingPopup";
import { UserDropdown } from "../../UserDropdown";
import discordContainerIcon from "../../../assets/discord_container.webp";
import discordSvgIcon from "../../../assets/discord-square-icon.webp";
import type { User } from "@/features/auth/context/AuthContext";
import type { RankingUser } from "@/features/ranking/types/ranking.types";

interface RankingProps {
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  users: RankingUser[];
  isLoading: boolean;
  onUserClick: (username: string, userId: string) => void;
  onViewFull: () => void;
}

interface RequestsProps {
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  showBadge: boolean;
  openCount: number;
  showHint: boolean;
  hintExiting: boolean;
  onOpenFullModal: (requestId?: number) => void;
  onOpenCreate: () => void;
}

interface NavbarDesktopNavProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  ranking: RankingProps;
  requests: RequestsProps;
  onClosePopovers: () => void;
}

/** Navbar content for desktop view (lg and above) */
export const NavbarDesktopNav: React.FC<NavbarDesktopNavProps> = ({
  isLoading,
  isAuthenticated,
  user,
  isAdmin,
  ranking,
  requests,
  onClosePopovers,
}) => {
  const rankingButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="hidden min-[1100px]:flex items-center flex-nowrap absolute right-8 top-1/2 -translate-y-1/2 divide-x divide-[#c2901c]/20">
      <div className="relative flex items-center px-4">
        <Link
          to="/cards"
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors group"
          aria-label="View cards"
        >
          <span className="text-xs font-medium text-[#c2901c] group-hover:text-[#e9b53c]">
            CARDS
          </span>
        </Link>
      </div>

      <div className="relative flex items-center px-4">
        <button
          data-navbar-requests-trigger
          onMouseDown={requests.onToggle}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors group relative"
          aria-label="Guide Requests"
        >
          <span className="relative shrink-0">
            <MailWarning className="w-[19px] h-[19px] text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
            {requests.showBadge && (
              <span className="absolute -top-2 right-3 min-w-[16px] h-[16px] px-0.5 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none ring-2 ring-[#0d0f1a]">
                {requests.openCount}
              </span>
            )}
          </span>
          <span className="text-xs font-medium text-[#c2901c] group-hover:text-[#e9b53c] transition-colors">
            Guide Requests
          </span>
        </button>

        {requests.showHint && (
          <div
            className={`${requests.hintExiting ? "hint-float-out" : "hint-float-in"} absolute top-full left-1/2 mt-3 z-[400] pointer-events-none`}
            style={{ transform: "translateX(-50%)" }}
          >
            <div
              className="w-2.5 h-2.5 bg-[#1e1825] border-l border-t border-[#c2901c]/50 rotate-45 mx-auto"
              style={{ marginBottom: "-5px", position: "relative", zIndex: 1 }}
            />
            <div className="bg-[#1e1825] border border-[#c2901c]/50 rounded-lg px-3.5 py-2.5 shadow-xl shadow-black/50 whitespace-nowrap">
              <p className="text-[#e9c87a] text-xs font-semibold leading-snug">
                Can't find a guide? Request it to the community!
              </p>
            </div>
          </div>
        )}

        <GuideRequestNavbarPopup
          isOpen={requests.isOpen}
          onClose={requests.onClose}
          onOpenFullModal={requests.onOpenFullModal}
          onOpenCreate={requests.onOpenCreate}
        />
      </div>

      <div className="relative flex items-center px-4">
        <button
          ref={rankingButtonRef}
          onMouseDown={ranking.onToggle}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors group"
          aria-label="Open ranking"
        >
          <Crown className="w-5 h-5 text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
          <span className="text-xs font-medium text-[#c2901c] group-hover:text-[#e9b53c] transition-colors">
            Ranking
          </span>
        </button>
        <RankingPopup
          isOpen={ranking.isOpen}
          onClose={ranking.onClose}
          users={ranking.users}
          onUserClick={ranking.onUserClick}
          onViewFullRanking={ranking.onViewFull}
          triggerRef={rankingButtonRef}
          isLoading={ranking.isLoading}
        />
      </div>

      {!isLoading && isAuthenticated && user ? (
        <>
          <div className="relative flex items-center px-4 py-[2px]">
            <NotificationBell />
            <NotificationPopup />
          </div>

          <div className="flex items-center gap-4 px-4">
            <UserDropdown onOpen={onClosePopovers} />
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-yellow-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity group"
                aria-label="Admin Panel"
              >
                <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline hover:underline underline-offset-4">
                  Admin Panel
                </span>
              </Link>
            )}
          </div>
        </>
      ) : !isLoading ? (
        <>
          <div className="flex items-center gap-4 px-4">
            <Link
              to="/signin"
              className="flex items-center gap-1 text-blue-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden xl:inline hover:underline underline-offset-4">
                Sign In
              </span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-1 text-green-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden xl:inline hover:underline underline-offset-4">
                Sign Up
              </span>
            </Link>
          </div>
        </>
      ) : null}

      <div className="flex items-center pl-1 border-none">
        <a
          href="https://discord.gg/wzkGb4Zgnw"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord community"
          className="hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="relative">
            <img
              src={discordContainerIcon}
              alt="Discord background"
              className="h-8 sm:h-9 md:h-10 w-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-[0.2rem]">
              <img src={discordSvgIcon} alt="Discord logo" className="w-3 sm:w-4 md:w-5" />
              <span className="hidden xl:inline text-[#c2901c] font-semibold text-xs whitespace-nowrap">
                Join Discord
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
