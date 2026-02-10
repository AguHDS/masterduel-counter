import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAdminUser, useSearchUsers } from "../hooks/useAdminData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SearchBar } from "./SearchBar";
import { UserDetailsCard } from "./UserDetailsCard";
import { UserInstancesSection } from "./UserInstancesSection";
import type { SearchUserResult } from "../types/adminPanelTypes";

export const ManageAccountsTab = () => {
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchError, setSearchError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchErrorData,
  } = useSearchUsers(searchInput, isSearching);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useAdminUser(selectedUserId);
  // State to show instances section for the selected user
  const [selectedUserIdForInstances, setSelectedUserIdForInstances] = useState<
    string | null
  >(null);

  // Reset selected user and instances section when user changes
  useEffect(() => {
    if (user) {
      setSelectedUserIdForInstances(null);
    }
  }, [user]);

  // Effect to handle search results
  useEffect(() => {
    if (searchData && isSearching) {
      setSearchResults(searchData.users);
      setIsSearching(false);
    }
  }, [searchData, isSearching]);

  // Effect to handle search errors
  useEffect(() => {
    if (searchErrorData) {
      setSearchError("Error searching users");
      setIsSearching(false);
    }
  }, [searchErrorData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchError("Please enter a username or email to search");
      return;
    }
    setIsSearching(true);
    setSearchError("");
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSearchResults([]);
    setSearchInput("");
  };

  const handleViewInstances = () => {
    if (!user) return;
    setSelectedUserIdForInstances(
      user.id === selectedUserIdForInstances ? null : user.id,
    );
  };

  // Handler para cuando se elimina un usuario
  const handleUserDeleted = () => {
    // Limpiar el usuario seleccionado
    setSelectedUserId("");
    setSelectedUserIdForInstances(null);
    // Limpiar resultados de búsqueda
    setSearchResults([]);
    setSearchInput("");
  };

  const isCurrentUser = user?.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Search Bar Component */}
      <SearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        searchError={searchError}
        setSearchError={setSearchError}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        searchLoading={searchLoading}
        loading={userLoading}
        onSearch={handleSearch}
        onSelectUser={handleSelectUser}
      />

      {/* User Loading State */}
      {userLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      )}

      {/* User Details Section */}
      {user && (
        <div className="space-y-6">
          <UserDetailsCard
            user={user}
            currentUser={currentUser}
            onRefetchUser={refetchUser}
            onViewInstances={handleViewInstances}
            isCurrentUser={isCurrentUser}
            onUserDeleted={handleUserDeleted}
          />

          {/* Instances Section */}
          {selectedUserIdForInstances === user.id && (
            <UserInstancesSection userId={user.id} />
          )}
        </div>
      )}

      {/* Empty State */}
      {!user && !userLoading && !searchInput && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4">
            <AlertCircle className="text-blue-400" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Search user</h3>
          <p className="text-blue-300 max-w-md mx-auto">
            Enter a username or email above to search for a user and manage
            their account.
          </p>
        </div>
      )}
    </div>
  );
};
