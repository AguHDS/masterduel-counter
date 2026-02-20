import { useAuth } from "../features/auth";
import { LogOut, LogIn, UserPlus, User, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "../assets/NavbarLogo.webp";
import discordContainerIcon from "../assets/discord_container.webp";
import discordSvgIcon from "../assets/discord-square-icon.webp";
import { NotificationBell, NotificationPopup } from "../features/notifications";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="relative top-0 z-50 bg-[#18121a]/90 border-b-4 border-[#c2901c] shadow-[0_10px_50px_-5px_rgba(0,0,0,0.7)]">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between pr-[80px]">
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
          </Link>
        </div>
      </nav>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4 flex-nowrap">
        {!isLoading && isAuthenticated && user ? (
          <div className="flex items-center flex-nowrap">
            <div className="relative">
              <NotificationBell />
              <NotificationPopup />
            </div>

            <span className="hidden lg:block text-sm text-gray-300 mr-4">
              Welcome,{" "}
              <span className="font-semibold text-blue-400">{user.name}</span>
            </span>

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
          </div>
        ) : !isLoading ? (
          <div className="flex items-center gap-6 flex-nowrap">
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
        ) : null}

        <a
          href="https://discord.gg/masterduelcounter"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord community"
          className="hover:opacity-90 transition-opacity shrink-0 "
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
      </div>
    </header>
  );
};
