import { useNavigate } from "react-router-dom";
import { buildProfilePath } from "@/lib/config/urlHelpers";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Search
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import type { SearchUserResult } from "../types/adminPanelTypes";

interface UsersListProps {
  users: SearchUserResult[];
  totalCount: number;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: string;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const UsersList = ({
  users,
  totalCount,
  loadMore,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onSort,
  sortBy,
  sortOrder,
  onSearch,
  searchQuery,
}: UsersListProps) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string, userName?: string) => {
    navigate(buildProfilePath({ userName, userId }));
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "supporter":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Table Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-10 gap-4 p-4 text-sm font-medium text-gray-400 border-b border-slate-700">
          <button
            onClick={() => onSort("name")}
            className="col-span-3 flex items-center gap-2 hover:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            User {getSortIcon("name")}
          </button>
          <button
            onClick={() => onSort("email")}
            className="col-span-4 flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email {getSortIcon("email")}
          </button>
          <div className="col-span-1 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role
          </div>
          <button
            onClick={() => onSort("created_at")}
            className="col-span-2 flex items-center gap-2 hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Joined {getSortIcon("created_at")}
          </button>
        </div>

        {/* Virtualized List */}
        <div style={{ height: "600px" }}>
          <Virtuoso
            data={users}
            endReached={hasMore ? loadMore : undefined}
            overscan={200}
            components={{
              Footer: () => (
                <>
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  )}
                  {!hasMore && users.length > 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm border-t border-slate-700">
                      End of list • {totalCount.toLocaleString()} total users
                    </div>
                  )}
                </>
              ),
            }}
            itemContent={(_index, user) => (
              <div
                onClick={() => handleUserClick(user.id, user.username)}
                className="grid grid-cols-10 gap-4 p-4 text-sm text-gray-300 hover:bg-slate-700/50 transition-colors cursor-pointer border-b border-slate-700/50 last:border-0"
              >
                <div className="col-span-3 font-medium truncate" title={user.username}>
                  {user.username}
                </div>
                <div className="col-span-4 truncate" title={user.email}>
                  {user.email}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="col-span-2 text-gray-400">
                  {formatDate(user.created_at)}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};