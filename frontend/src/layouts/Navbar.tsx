import { useAuth } from "../features/auth";
import {
  LogOut,
  LogIn,
  UserPlus,
  User,
  Shield,
  Menu,
  X,
  Crown,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "../assets/NavbarLogo.webp";
import discordContainerIcon from "../assets/discord_container.webp";
import discordSvgIcon from "../assets/discord-square-icon.webp";
import { NotificationBell, NotificationPopup } from "../features/notifications";
import { RankingPopup } from "../features/ranking/components/RankingPopup";
import { RankingModal } from "../features/ranking/components/RankingModal";
import { useRanking } from "../features/ranking/hooks/useRanking";
import { UserDropdown } from "./UserDropdown";
import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/shared/components/DefaultAvatar";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [showBetaTooltip, setShowBetaTooltip] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isMobileRankingOpen, setIsMobileRankingOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const rankingButtonRef = useRef<HTMLButtonElement>(null);

  const { data: rankingData, isLoading: isLoadingRanking } = useRanking(1, 50);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const isAdmin = user?.role === "admin";

  // Detect tablet view between 640px and 1024px
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletView(width >= 640 && width < 1024);
      
      if (width >= 1024) {
        setIsMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleUserClick = (_username: string, userId: string) => {
    window.location.href = `/profile/${userId}`;
    setIsRankingOpen(false);
    setIsMobileRankingOpen(false);
    setIsRankingModalOpen(false);
    setIsMenuOpen(false);
  };

  const handleViewFullRanking = () => {
    setIsRankingOpen(false);
    setIsMobileRankingOpen(false);
    setIsRankingModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleToggleRanking = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRankingOpen((prev) => !prev);
  };

  const handleToggleMobileRanking = () => {
    setIsMobileRankingOpen((prev) => !prev);
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-500/20 to-amber-600/20",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-purple-700/40 to-blue-500/20",
          text: "text-gray-300",
          icon: "text-gray-400",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-yellow-700/20 to-amber-800/50",
          text: "text-amber-600",
          icon: "text-amber-700",
        };
      default:
        return {
          bg: "bg-blue-950/30",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
    }
  };

  return (
    <header className="relative top-0 z-[350] bg-[#18121a]/90 border-b-4 border-[#c2901c] shadow-[0_10px_50px_-5px_rgba(0,0,0,0.7)]">
      <nav
        className="px-4 sm:px-6 lg:px-8 py-4"
        aria-label="Main navigation"
      >
        <div className="absolute ml-1 left-0 top-1/2 -translate-y-1/2 pl-4 sm:pl-6 lg:pl-8">
          <Link
            to="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Masterduel Counter Home"
          >
            <img
              src={logoImg}
              alt="Masterduel Counter logo"
              className="h-8 sm:h-9 md:h-10 w-auto"
            />

            <div
              className="relative block"
              onMouseEnter={() => setShowBetaTooltip(true)}
              onMouseLeave={() => setShowBetaTooltip(false)}
            >
              <span className="px-1.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold bg-gradient-to-r from-blue-600 to-purple-600/70 text-white rounded-full border border-white/20 tracking-wider whitespace-nowrap">
                OPEN BETA
              </span>

              {showBetaTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl whitespace-nowrap z-50 text-xs text-gray-200">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1f1a24] border-t border-l border-[#c2901c]/30 transform rotate-45"></div>
                  Website is currently in beta version. Expect possible bugs.
                  Please report any issues on our Discord!
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="invisible">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={logoImg}
                  alt=""
                  className="h-8 sm:h-9 md:h-10 w-auto opacity-0"
                />
                <span className="px-1.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] opacity-0">
                  OPEN BETA
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-nowrap absolute right-8 top-1/2 -translate-y-1/2 divide-x divide-[#c2901c]/20">
              <div className="relative flex items-center px-4">
                <Link
                  to="/cards"
                  className="flex items-center space-x-1 px-2 py-1.5  rounded-lg transition-colors group"
                  aria-label="View cards"
                >
                  <span className="text-xs font-medium text-[#c2901c] group-hover:text-[#e9b53c]">
                    CARDS
                  </span>
                </Link>
              </div>
              
              <div className="relative flex items-center px-4">
                <button
                  ref={rankingButtonRef}
                  onClick={handleToggleRanking}
                  className="flex items-center space-x-1 px-2 py-1.5  rounded-lg transition-colors group"
                  aria-label="Open ranking"
                >
                  <Crown className="w-5 h-5 text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
                  <span className="text-xs font-medium text-[#c2901c] group-hover:text-[#e9b53c] transition-colors">
                    Ranking
                  </span>
                </button>

                <RankingPopup
                  isOpen={isRankingOpen}
                  onClose={() => setIsRankingOpen(false)}
                  users={rankingData?.ranking ?? []}
                  onUserClick={handleUserClick}
                  onViewFullRanking={handleViewFullRanking}
                  triggerRef={rankingButtonRef}
                  isLoading={isLoadingRanking}
                />
              </div>

              {!isLoading && isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <div className="relative flex items-center px-4 py-[2px]">
                    <NotificationBell />
                    <NotificationPopup />
                  </div>

                  {/* Profile, Logout, Admin */}
                  <div className="flex items-center gap-4 px-4 ">
                    <UserDropdown />

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-1 text-yellow-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity group"
                        aria-label="Admin Panel"
                      >
                        <Shield className="h-4 w-4  group-hover:scale-110 transition-transform" />
                        <span className="hidden xl:inline hover:underline underline-offset-4">
                          Admin Panel
                        </span>
                      </Link>
                    )}
                  </div>
                </>
              ) : !isLoading ? (
                <>
                  {/* Auth links */}
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

              {/* Discord */}
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
                      <img
                        src={discordSvgIcon}
                        alt="Discord logo"
                        className="w-3 sm:w-4 md:w-5"
                      />
                      <span className="hidden xl:inline text-[#c2901c] font-semibold text-xs whitespace-nowrap">
                        Join Discord
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden sm:flex lg:hidden items-center gap-3 absolute right-8 top-1/2 -translate-y-1/2">
              <Link
                to="/cards"
                className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors group relative"
                aria-label="View cards"
              >
                <Layers className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
              </Link>

              <button
                ref={rankingButtonRef}
                onClick={handleToggleRanking}
                className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors group relative"
                aria-label="Open ranking"
              >
                <Crown className="w-5 h-5 text-[#c2901c] group-hover:text-[#e9b53c] transition-colors" />
                {rankingData && rankingData.ranking.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c2901c] text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {rankingData.ranking.length}
                  </span>
                )}
              </button>

              <RankingPopup
                isOpen={isRankingOpen}
                onClose={() => setIsRankingOpen(false)}
                users={rankingData?.ranking ?? []}
                onUserClick={handleUserClick}
                onViewFullRanking={handleViewFullRanking}
                triggerRef={rankingButtonRef}
                isLoading={isLoadingRanking}
                alignRight={isTabletView}
              />

              {!isLoading && isAuthenticated && user ? (
                <>
                  <NotificationBell />
                  <NotificationPopup />

                  <UserDropdown />

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

              {/* Discord icon without text */}
              <a
                href="https://discord.gg/wzkGb4Zgnw"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[#c2901c]/10 rounded-lg transition-colors"
              >
                <img
                  src={discordSvgIcon}
                  alt="Discord logo"
                  className="w-5 h-5"
                />
              </a>
            </div>

            {/* Mobile menu button  */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-[#c2901c] hover:text-[#d4a534] transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#1f1a24] border-b border-[#c2901c]/30 shadow-xl py-4 px-4 z-50">
          <div className="flex flex-col space-y-3">
            {!isLoading && isAuthenticated && user && (
              <div className="pb-3 mb-3 border-b border-[#c2901c]/30">
                <div className="text-sm text-gray-300">
                  Welcome,{" "}
                  <span className="font-semibold text-blue-400">
                    {user.name}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Link
                to="/cards"
                onClick={handleLinkClick}
                className="flex items-center gap-2 text-cyan-500 text-sm font-medium hover:opacity-80 transition-opacity py-2 w-full text-left"
              >
                <Layers className="h-4 w-4" />
                <span>CARDS</span>
              </Link>

              <button
                onClick={handleToggleMobileRanking}
                className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 w-full text-left"
              >
                <Crown className="h-4 w-4" />
                <span>
                  Ranking
                  {rankingData &&
                    rankingData.ranking.length > 0 &&
                    ` (${rankingData.ranking.length})`}
                </span>
              </button>

              {isMobileRankingOpen && (
                <div className="ml-6 bg-[#2a2430] rounded-lg border border-[#c2901c]/30 p-2 max-h-64 overflow-y-auto scrollbar-cardpair">
                  {isLoadingRanking ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      Loading ranking...
                    </div>
                  ) : rankingData && rankingData.ranking.length > 0 ? (
                    <>
                      {rankingData.ranking.map((user) => {
                        const styles = getRankStyles(user.rank);
                        return (
                          <div
                            key={user.userId}
                            onClick={() =>
                              handleUserClick(user.username, user.userId)
                            }
                            className={`flex items-center gap-2 p-2 hover:bg-[#3a2f40] rounded-lg transition-colors cursor-pointer ${styles.bg}`}
                          >
                            <div
                              className={`w-8 text-center font-bold text-xs ${styles.text}`}
                            >
                              #{user.rank}
                            </div>
                            <Avatar
                              username={user.username}
                              profilePictureUrl={user.profilePictureUrl}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-white text-sm truncate block">
                                {user.username}
                              </span>
                              <div className="text-xs text-green-500">
                                {user.totalLikes} likes
                              </div>
                            </div>
                            {user.rank <= 3 && (
                              <Crown
                                className={`w-3 h-3 flex-shrink-0 ${styles.icon}`}
                              />
                            )}
                          </div>
                        );
                      })}
                      <button
                        onClick={handleViewFullRanking}
                        className="w-full text-center text-sm text-[#c2901c] hover:text-[#d4a534] transition-colors py-2 mt-2 border-t border-[#c2901c]/30"
                      >
                        View Full Ranking →
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No users in ranking yet
                    </div>
                  )}
                </div>
              )}

              {!isLoading && isAuthenticated && user ? (
                <>
                  <div className="relative">
                    <NotificationBell isMobile={true} />
                    <NotificationPopup isMobile={true} />
                  </div>

                  <Link
                    to={`/profile/${user.id}`}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium hover:opacity-80 transition-opacity py-2 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleLinkClick}
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
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    to="/signup"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-green-500 text-sm font-medium hover:opacity-80 transition-opacity py-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              ) : null}

              {/* Discord link for mobile */}
              <a
                href="https://discord.gg/wzkGb4Zgnw"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 border-t border-[#c2901c]/30 pt-4 mt-2"
              >
                <img
                  src={discordSvgIcon}
                  alt="Discord logo"
                  className="w-5 h-5"
                />
                <span>Join Discord</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Modal */}
      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        onUserClick={handleUserClick}
      />
    </header>
  );
};