import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Crown, Inbox, Layers, LogIn, UserPlus, Shield } from "lucide-react";
import { GuideRequestNavbarPopup } from "@/features/guide-request";
import { NotificationBell, NotificationPopup } from "@/features/notifications";
import { RankingPopup } from "@/features/ranking/components/RankingPopup";
import { UserDropdown } from "../../UserDropdown";
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
  alignRight: boolean;
}

interface RequestsProps {
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  showBadge: boolean;
  openCount: number;
  onOpenFullModal: () => void;
  onOpenCreate: () => void;
}

interface NavbarTabletNavProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  ranking: RankingProps;
  requests: RequestsProps;
  onClosePopovers: () => void;
}

export const NavbarTabletNav: React.FC<NavbarTabletNavProps> = ({
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
    <div className="hidden sm:flex lg:hidden items-center gap-3 absolute right-8 top-1/2 -translate-y-1/2">
      <Link
        to="/cards"
        className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors group relative"
        aria-label="View cards"
      >
        <Layers className="w-5 h-5 text-[#c2901c]" />
      </Link>

      {/* Ranking */}
      <button
        ref={rankingButtonRef}
        onMouseDown={ranking.onToggle}
        className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors group relative"
        aria-label="Open ranking"
      >
        <Crown className="w-5 h-5 text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
        {ranking.users.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#c2901c] text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
            {ranking.users.length}
          </span>
        )}
      </button>
      <RankingPopup
        isOpen={ranking.isOpen}
        onClose={ranking.onClose}
        users={ranking.users}
        onUserClick={ranking.onUserClick}
        onViewFullRanking={ranking.onViewFull}
        triggerRef={rankingButtonRef}
        isLoading={ranking.isLoading}
        alignRight={ranking.alignRight}
      />

      {/* Guide Requests */}
      <div className="relative">
        <button
          data-navbar-requests-trigger
          onMouseDown={requests.onToggle}
          className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors group relative"
          aria-label="Guide Requests"
        >
          <span className="relative">
            <Inbox className="w-5 h-5 text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
            {requests.showBadge && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-0.5 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none ring-2 ring-[#0d0f1a]">
                {requests.openCount}
              </span>
            )}
          </span>
        </button>
        <GuideRequestNavbarPopup
          isOpen={requests.isOpen}
          onClose={requests.onClose}
          onOpenFullModal={requests.onOpenFullModal}
          onOpenCreate={requests.onOpenCreate}
        />
      </div>

      {!isLoading && isAuthenticated && user ? (
        <>
          <NotificationBell />
          <NotificationPopup />
          <UserDropdown onOpen={onClosePopovers} />
          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
            >
              <Shield className="w-5 h-5 text-yellow-500" />
            </Link>
          )}
        </>
      ) : !isLoading ? (
        <>
          <Link
            to="/signin"
            className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5 text-blue-500" />
          </Link>
          <Link
            to="/signup"
            className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5 text-green-500" />
          </Link>
        </>
      ) : null}

      {/* Discord */}
      <a
        href="https://discord.gg/wzkGb4Zgnw"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
      >
        <img src={discordSvgIcon} alt="Discord logo" className="w-5 h-5" />
      </a>
    </div>
  );
};
