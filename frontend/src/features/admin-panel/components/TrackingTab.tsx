import { Users } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useTotalUsers, useAllUsers } from "../hooks/useAdminData";
import { UsersList } from "./UserList";

export const TrackingTab = () => {
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showUsersList, setShowUsersList] = useState(false);
  const { data: totalUsers, isLoading: totalUsersLoading } = useTotalUsers();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: usersLoading,
    refetch,
  } = useAllUsers(50, sortBy, sortOrder, debouncedSearch || undefined);

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) || [];
  }, [data]);

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    },
    [sortBy, sortOrder],
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setShowUsersList(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Refetch when sort or search changes
  useEffect(() => {
    if (showUsersList) {
      refetch();
    }
  }, [sortBy, sortOrder, debouncedSearch, refetch, showUsersList]);

  if (totalUsersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">User Tracking</h2>
        <p className="text-blue-300 text-sm">
          Monitor registered users and platform statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => setShowUsersList(!showUsersList)}
          className="bg-gradient-to-br from-blue-950/40 to-purple-950/20 border border-blue-500/30 rounded-lg p-6 shadow-lg cursor-pointer hover:border-blue-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
              Click to {showUsersList ? "hide" : "view"} list
            </span>
          </div>
          <h3 className="text-sm font-medium text-blue-300 mb-1">
            Total Registered Users
          </h3>
          <p className="text-4xl font-bold text-white">
            {totalUsers?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {showUsersList && (
        <div className="mt-8">
          <UsersList
            users={users}
            totalCount={totalUsers || 0}
            loadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isLoading={usersLoading}
            isFetchingNextPage={isFetchingNextPage}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};
