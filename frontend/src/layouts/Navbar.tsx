import { useAuth } from "../features/auth";
import { LogOut, LogIn, UserPlus, User, Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "../assets/NavbarLogo.webp";
import discordContainerIcon from "../assets/discord_container.webp";
import discordSvgIcon from "../assets/discord-square-icon.webp";
import { NotificationBell, NotificationPopup } from "../features/notifications";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [showBetaTooltip, setShowBetaTooltip] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const isAdmin = user?.role === "admin";

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMenuOpen(false); // Close menu when switching to desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="relative top-0 z-50 bg-[#18121a]/90 border-b-4 border-[#c2901c] shadow-[0_10px_50px_-5px_rgba(0,0,0,0.7)]">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Masterduel Counter Home"
          >
            <img
              src={logoImg}
              alt="Masterduel Counter logo"
              className="h-10 w-auto max-[680px]:h-9 max-[524px]:h-6 max-[430px]:h-4"
            />

            <div
              className="relative"
              onMouseEnter={() => setShowBetaTooltip(true)}
              onMouseLeave={() => setShowBetaTooltip(false)}
            >
              <span className="px-1.5 py-0.5 text-[0.65rem] font-bold bg-gradient-to-r from-blue-600 to-purple-600/70 text-white rounded-full border border-white/20 tracking-wider">
                BETA
              </span>

              {showBetaTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl whitespace-nowrap z-50 text-xs text-gray-200">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1f1a24] border-t border-l border-[#c2901c]/30 transform rotate-45"></div>
                  Website is currently in beta version
                </div>
              )}
            </div>
          </Link>

          {/* Right elements (desktop) */}
          <div className="hidden sm:flex items-center gap-4 flex-nowrap absolute right-8 top-1/2 -translate-y-1/2">
            {!isLoading && isAuthenticated && user ? (
              <>
                <span className="hidden lg:block text-sm text-gray-300 mr-4">
                  Welcome,{" "}
                  <span className="font-semibold text-blue-400">
                    {user.name}
                  </span>
                </span>
                
                <div className="relative mr-1">
                  <NotificationBell />
                  <NotificationPopup />
                </div>

                <div
                  className={`flex items-center flex-nowrap ${
                    isAdmin ? "gap-3" : "gap-4"
                  }`}
                >
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-1 text-blue-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline hover:underline underline-offset-4">
                      Profile
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline hover:underline underline-offset-4">
                      Logout
                    </span>
                  </button>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-yellow-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity group"
                      aria-label="Admin Panel"
                    >
                      <Shield className="h-4 w-4 relative left-3 group-hover:scale-110 transition-transform" />
                      <span className="hidden relative left-3 lg:inline hover:underline underline-offset-4">
                        Admin Panel
                      </span>
                    </Link>
                  )}
                </div>

                <a
                  href="https://discord.gg/masterduelcounter"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Discord community"
                  className="hover:opacity-90 transition-opacity shrink-0"
                >
                  <div className="relative">
                    <img
                      src={discordContainerIcon}
                      alt="Discord background"
                      className="h-[36px] sm:h-[40px] w-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-[0.2rem]">
                      <img
                        src={discordSvgIcon}
                        alt="Discord logo"
                        className="w-4 sm:w-5"
                      />
                      <span className="hidden sm:inline text-[#c2901c] font-semibold text-xs whitespace-nowrap">
                        Join Discord
                      </span>
                    </div>
                  </div>
                </a>
              </>
            ) : !isLoading ? (
              <>
                <div className="flex items-center gap-5 flex-nowrap mr-3">
                  <Link
                    to="/signin"
                    className="flex items-center gap-1 text-blue-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden md:inline hover:underline underline-offset-4">
                      Sign In
                    </span>
                  </Link>

                  <Link
                    to="/signup"
                    className="flex items-center gap-1 text-green-500 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden md:inline hover:underline underline-offset-4">
                      Sign Up
                    </span>
                  </Link>
                </div>

                <a
                  href="https://discord.gg/masterduelcounter"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Discord community"
                  className="hover:opacity-90 transition-opacity shrink-0"
                >
                  <div className="relative">
                    <img
                      src={discordContainerIcon}
                      alt="Discord background"
                      className="h-[36px] sm:h-[40px] w-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-[0.2rem]">
                      <img
                        src={discordSvgIcon}
                        alt="Discord logo"
                        className="w-4 sm:w-5"
                      />
                      <span className="hidden sm:inline text-[#c2901c] font-semibold text-xs whitespace-nowrap">
                        Join Discord
                      </span>
                    </div>
                  </div>
                </a>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
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
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#1f1a24] border-b border-[#c2901c]/30 shadow-xl py-4 px-4 z-50">
          <div className="flex flex-col space-y-4">
            {!isLoading && isAuthenticated && user ? (
              <>
                {/* Welcome message for mobile */}
                <div className="text-sm text-gray-300 pb-2 border-b border-[#c2901c]/30">
                  Welcome,{" "}
                  <span className="font-semibold text-blue-400">
                    {user.name}
                  </span>
                </div>

                {/* Notifications for mobile */}
                <div className="relative">
                  <NotificationBell />
                  <NotificationPopup />
                </div>

                {/* Mobile menu items */}
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

                {/* Discord link for mobile */}
                <a
                  href="https://discord.gg/masterduelcounter"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 border-t border-[#c2901c]/30 pt-4"
                >
                  <img
                    src={discordSvgIcon}
                    alt="Discord logo"
                    className="w-5 h-5"
                  />
                  <span>Join Discord</span>
                </a>
              </>
            ) : !isLoading ? (
              <>
                {/* Auth links for mobile */}
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

                {/* Discord link for mobile */}
                <a
                  href="https://discord.gg/masterduelcounter"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-[#c2901c] text-sm font-medium hover:opacity-80 transition-opacity py-2 border-t border-[#c2901c]/30 pt-4"
                >
                  <img
                    src={discordSvgIcon}
                    alt="Discord logo"
                    className="w-5 h-5"
                  />
                  <span>Join Discord</span>
                </a>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
