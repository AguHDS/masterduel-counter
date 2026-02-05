import { useAuth } from "../features/auth";
import { LogOut, LogIn, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from '../assets/NavbarLogo.webp';

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };


  return (
    <header className="sticky top-0 z-50 shadow-lg bg-[#18121a]/90 border-b-4 border-[#c2901c]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" aria-label="Masterduel Counter Home">
            <img src={logoImg} alt="Masterduel Counter logo" className="h-10 w-auto" />
          </Link>

          <div className="flex items-center space-x-4" role="navigation" aria-label="User navigation">
            {!isLoading && isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-300">
                  Welcome, <span className="font-semibold text-blue-400">{user.name}</span>
                </span>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="View my profile and instances"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="Logout from your account"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  to="/signin"
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="Sign in to your account"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="Create a new account"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Up</span>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
};

