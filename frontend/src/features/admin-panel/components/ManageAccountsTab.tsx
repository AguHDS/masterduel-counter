import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Ban,
  Edit2,
  Save,
  X,
  Package,
  AlertCircle,
} from "lucide-react";
import { adminApi } from "../api/adminApi";
import {
  useUserInstances,
  useDeleteUserInstance,
  useAdminUser,
} from "../hooks/useAdminData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Publication } from "../types/adminPanelTypes";

interface ManageAccountsTabProps {
  onRefresh: () => void;
}

export const ManageAccountsTab = ({ onRefresh }: ManageAccountsTabProps) => {
  const { user: currentUser } = useAuth();

  // Estados para el search
  const [searchInput, setSearchInput] = useState("");
  const [searchUserId, setSearchUserId] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");

  // Estados para edición
  const [editingUser, setEditingUser] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Hook para obtener el usuario
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useAdminUser(searchUserId);

  const deleteUserInstanceMutation = useDeleteUserInstance();

  // Resetear estados cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setEditingUser(false);
      setEditForm({ name: user.name, email: user.email });
      setSelectedUserId(null);
      setSearchError("");
    }
  }, [user]);

  // Manejar búsqueda por Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchError("Please enter a username to search");
      return;
    }

    setSearchUserId(searchInput.trim());
    setSearchError("");
  };

  const handleEdit = () => {
    if (!user) return;

    // Verificar que el admin no pueda editar su propia cuenta
    if (user.id === currentUser?.id) {
      alert("You cannot edit your own account from the admin panel");
      return;
    }

    setEditingUser(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({ name: user.name, email: user.email });
    }
    setEditingUser(false);
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    // Prevenir que el admin edite su propia cuenta
    if (user.id === currentUser?.id) {
      alert("You cannot edit your own account from the admin panel");
      setEditingUser(false);
      return;
    }

    setLoading(true);
    try {
      await adminApi.changeUserCredentials(user.id, {
        username: editForm.name,
        email: editForm.email,
      });
      setEditingUser(false);
      refetchUser(); // Refetch para obtener datos actualizados
      onRefresh();
    } catch (error) {
      alert("Failed to update user");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!user) return;

    // Prevenir que el admin se bane a sí mismo
    if (user.id === currentUser?.id) {
      alert("You cannot ban yourself");
      return;
    }

    if (!confirm("Are you sure you want to ban this user?")) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.banUser(user.id);
      refetchUser();
      onRefresh();
    } catch (error) {
      alert("Failed to ban user");
      console.error("Ban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!user) return;

    if (!confirm("Are you sure you want to unban this user?")) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.unbanUser(user.id);
      refetchUser();
      onRefresh();
    } catch (error) {
      alert("Failed to unban user");
      console.error("Unban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    // Prevenir que el admin se elimine a sí mismo
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteUser(user.id);
      setSearchUserId("");
      setSearchInput("");
      setSearchError("User deleted successfully");
      onRefresh();
    } catch (error) {
      alert("Failed to delete user");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInstances = () => {
    if (!user) return;
    setSelectedUserId(user.id === selectedUserId ? null : user.id);
  };

  const handleDeleteInstance = async (instanceId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this instance?")) {
      return;
    }

    try {
      await deleteUserInstanceMutation.mutateAsync({
        userId: user.id,
        instanceId,
      });
    } catch (error) {
      alert("Failed to delete instance");
      console.error("Delete instance error:", error);
    }
  };

  const isCurrentUser = user?.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Search User by Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchError("");
                }}
                placeholder="Enter exact username..."
                className="flex-1 bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || userLoading}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
            <p className="text-xs text-blue-400 mt-2">
              Note: You must enter the exact username. No auto-suggestions.
            </p>
          </div>

          {searchError && (
            <div
              className={`p-3 rounded-lg ${searchError.includes("successfully") ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}
            >
              {searchError}
            </div>
          )}

          {userError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300">
                User not found. Please check the username and try again.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* User Details Section */}
      {userLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      )}

      {user && (
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                {isCurrentUser && (
                  <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30 mt-2">
                    Current Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_banned
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }`}
                >
                  {user.is_banned ? "Banned" : "Active"}
                </span>
                <span className="text-sm text-blue-300">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Username
                </label>
                {editingUser ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Username"
                  />
                ) : (
                  <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
                    <p className="text-white font-medium">
                      {user.name || "No name"}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Email
                </label>
                {editingUser ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Email"
                  />
                ) : (
                  <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
                    <p className="text-blue-300">{user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* User ID */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-300 mb-2">
                User ID
              </label>
              <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
                <code className="text-blue-300 font-mono text-sm">
                  {user.id}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-blue-900/30">
              {editingUser ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 text-gray-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleViewInstances}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Package size={18} />
                    View Instances
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={loading || isCurrentUser}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isCurrentUser
                        ? "bg-gray-600/20 border border-gray-500/50 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300"
                    } disabled:opacity-50`}
                  >
                    <Edit2 size={18} />
                    Edit User
                  </button>
                  {user.is_banned ? (
                    <button
                      onClick={handleUnbanUser}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Ban size={18} />
                      Unban User
                    </button>
                  ) : (
                    <button
                      onClick={handleBanUser}
                      disabled={loading || isCurrentUser}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isCurrentUser
                          ? "bg-gray-600/20 border border-gray-500/50 text-gray-400 cursor-not-allowed"
                          : "bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 text-yellow-300"
                      } disabled:opacity-50`}
                    >
                      <Ban size={18} />
                      Ban User
                    </button>
                  )}
                  <button
                    onClick={handleDeleteUser}
                    disabled={loading || isCurrentUser}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isCurrentUser
                        ? "bg-gray-600/20 border border-gray-500/50 text-gray-400 cursor-not-allowed"
                        : "bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300"
                    } disabled:opacity-50`}
                  >
                    <Trash2 size={18} />
                    Delete User
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Instances Section (condicional) */}
          {selectedUserId === user.id && (
            <div className="bg-slate-800/30 border border-blue-800/30 rounded-lg p-6">
              <UserInstancesSection
                userId={user.id}
                onDeleteInstance={handleDeleteInstance}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!user && !userLoading && !userError && !searchUserId && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4">
            <AlertCircle className="text-blue-400" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Search for a User
          </h3>
          <p className="text-blue-300 max-w-md mx-auto">
            Enter a username above to search for a user and manage their
            account.
          </p>
        </div>
      )}
    </div>
  );
};

// Componente interno para mostrar instancias del usuario
const UserInstancesSection = ({
  userId,
  onDeleteInstance,
}: {
  userId: string;
  onDeleteInstance: (instanceId: string) => void;
}) => {
  const { data: instances, isLoading, error } = useUserInstances(userId);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-300">
        Error loading instances
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-300 mb-3">
        User Instances ({instances?.length || 0})
      </h3>
      {instances && instances.length > 0 ? (
        <div className="space-y-3">
          {instances.map((instance: Publication) => (
            <div
              key={instance.id}
              className="p-4 bg-slate-900/50 rounded border border-blue-900/30 hover:border-blue-800/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-2">
                    {instance.title}
                  </h4>
                  <p className="text-sm text-blue-300 mb-3 line-clamp-3">
                    {instance.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-400">
                    <span>
                      Created:{" "}
                      {new Date(instance.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Updated:{" "}
                      {new Date(instance.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteInstance(instance.id)}
                  className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete instance"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-blue-400">No instances found for this user</p>
        </div>
      )}
    </div>
  );
};
