import { useState } from "react";
import { Trash2, Ban, Edit2, Save, X, Package } from "lucide-react";
import { adminApi } from "../api";
import { useUserInstances } from "../hooks/useAdminData";
import type { Profile, Publication } from "../types/adminPanelTypes";

interface ManageAccountsTabProps {
  users: Profile[];
  onRefresh: () => void;
}

export const ManageAccountsTab = ({
  users,
  onRefresh,
}: ManageAccountsTabProps) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleEdit = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "" });
  };

  const handleSaveEdit = async (userId: string) => {
    setLoading(true);
    try {
      // Usamos changeUserCredentials en lugar de updateUser
      await adminApi.changeUserCredentials(userId, {
        username: editForm.name, // Nota: en backend es 'username', no 'name'
        email: editForm.email,
      });
      setEditingUser(null);
      onRefresh();
    } catch (error) {
      alert("Failed to update user");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) {
      return;
    }
    setLoading(true);
    try {
      await adminApi.banUser(userId);
      onRefresh();
    } catch (error) {
      alert("Failed to ban user");
      console.error("Ban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) {
      return;
    }
    setLoading(true);
    try {
      await adminApi.unbanUser(userId);
      onRefresh();
    } catch (error) {
      alert("Failed to unban user");
      console.error("Unban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await adminApi.deleteUser(userId);
      onRefresh();
    } catch (error) {
      alert("Failed to delete user");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInstances = (userId: string) => {
    setSelectedUserId(userId === selectedUserId ? null : userId);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-800/30 bg-blue-950/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="border-b border-blue-900/20 hover:bg-blue-950/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="bg-slate-800/50 border border-blue-700/50 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Username"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {user.name || "No name"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user.id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="bg-slate-800/50 border border-blue-700/50 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-blue-300">{user.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_banned
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                      >
                        {user.is_banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingUser === user.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              disabled={loading}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                              title="Save changes"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewInstances(user.id)}
                              disabled={loading}
                              className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors disabled:opacity-50"
                              title="View instances"
                            >
                              <Package size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              disabled={loading}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
                              title="Edit user"
                            >
                              <Edit2 size={18} />
                            </button>
                            {user.is_banned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                disabled={loading}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                                title="Unban user"
                              >
                                <Ban size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user.id)}
                                disabled={loading}
                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded transition-colors disabled:opacity-50"
                                title="Ban user"
                              >
                                <Ban size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={loading}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {selectedUserId === user.id && (
                    <tr className="bg-blue-950/20">
                      <td colSpan={5} className="px-6 py-4">
                        <UserInstancesSection userId={user.id} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-blue-300">No users found</div>
      )}
    </div>
  );
};

// Componente interno para mostrar instancias del usuario
const UserInstancesSection = ({ userId }: { userId: string }) => {
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
    <div className="mt-4 p-4 bg-slate-800/30 rounded border border-blue-800/30">
      <h3 className="text-lg font-semibold text-blue-300 mb-3">
        User Instances ({instances?.length || 0})
      </h3>
      {instances && instances.length > 0 ? (
        <div className="space-y-3">
          {instances.map((instance: Publication) => (
            <div
              key={instance.id}
              className="p-3 bg-slate-900/50 rounded border border-blue-900/30"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">{instance.title}</h4>
                  <p className="text-sm text-blue-300 mt-1 line-clamp-2">
                    {instance.content}
                  </p>
                  <p className="text-xs text-blue-400 mt-2">
                    Created:{" "}
                    {new Date(instance.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this instance?")
                    ) {
                      // Aquí podrías añadir la lógica para eliminar la instancia
                      alert("Delete instance functionality to be implemented");
                    }
                  }}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                  title="Delete instance"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-blue-400 text-center py-4">
          No instances found for this user
        </p>
      )}
    </div>
  );
};
