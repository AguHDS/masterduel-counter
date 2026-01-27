import { useAuth } from "../features/AdminAuth";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const { isAuthenticated, admin, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-slate-900 border-b border-blue-800 sticky top-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md"></div>
            <h1 className="text-2xl font-bold text-white">Masterduel Counter</h1>
          </Link>

          {!isLoading && isAuthenticated && admin && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Logged as Admin: <span className="font-semibold text-green-400">{admin.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

