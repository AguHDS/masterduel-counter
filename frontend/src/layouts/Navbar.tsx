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
              className="h-10 w-auto max-[680px]:h-9 max-[524px]:h-6 max-[430px]:h-4 max-[372px]:opacity-0"
            />
          </Link>

          {!isLoading && isAuthenticated && user && (
            <span className="hidden md:block text-sm relative right-10 text-gray-300">
              Welcome,{" "}
              <span className="font-semibold text-blue-400">
                {user.name}
              </span>
            </span>
          )}
        </div>
      </nav>

      {/* CONTENEDOR DERECHO — MISMA POSICIÓN QUE SIEMPRE */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 flex-nowrap">
        {!isLoading && isAuthenticated && user && (
          <div className="flex items-center gap-5 mr-2 flex-nowrap">
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center gap-1 text-blue-500 text-sm font-medium shrink-0"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline hover:underline underline-offset-4">
                Profile
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-500 text-sm font-medium shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline hover:underline underline-offset-4">
                Logout
              </span>
            </button>
          </div>
        )}

        {!isLoading && !isAuthenticated && (
          <div className="flex items-center gap-5 mr-2 flex-nowrap">
            <Link
              to="/signin"
              className="flex items-center gap-1 text-blue-500 text-sm font-medium shrink-0"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline hover:underline underline-offset-4">
                Sign In
              </span>
            </Link>

            <Link
              to="/signup"
              className="flex items-center gap-1 text-green-500 text-sm font-medium shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline hover:underline underline-offset-4">
                Sign Up
              </span>
            </Link>
          </div>
        )}

        <a
          href="https://discord.gg/masterduelcounter"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord community"
          className="hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="relative left-3">
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
