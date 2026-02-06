import { useAuth } from "../features/auth";
import { LogOut, LogIn, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "../assets/NavbarLogo.webp";
import discordContainerIcon from "../assets/discord_container_navbar.webp";
import discordSvgIcon from "../assets/discord-square-icon.webp";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="relative top-0 z-50 shadow-lg bg-[#18121a]/90 border-b-4 border-[#c2901c]">
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
              className="h-10 w-auto"
            />
          </Link>

          <div
            className="flex items-center space-x-4"
            role="navigation"
            aria-label="User navigation"
          >
            {!isLoading && isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-300">
                  Welcome,{" "}
                  <span className="font-semibold text-blue-400">
                    {user.name}
                  </span>
                </span>

                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  to="/signin"
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      <a
        href="https://discord.gg/masterduelcounter"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Discord community"
        className="absolute right-10 top-1/2 -translate-y-1/2 hover:opacity-90 transition-opacity"
      >
        <div className="relative">
          <img
            src={discordContainerIcon}
            alt="Discord background"
            className="h-[40px] w-auto"
          />

          <div className="absolute inset-0 flex items-center justify-center gap-[0.1rem]">
            <img
              src={discordSvgIcon}
              alt="Discord logo"
              className="w-5"
            />
            <span className="text-[#c2901c] font-semibold text-xs whitespace-nowrap">
              Join Discord
            </span>
          </div>
        </div>
      </a>
    </header>
  );
};
