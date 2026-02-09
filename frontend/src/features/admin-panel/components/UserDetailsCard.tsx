import { useState, useEffect } from "react";
import {
  Trash2,
  Ban,
  Edit2,
  Save,
  X,
  Package,
  User,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { adminApi } from "../api/adminApi";
import { BanInfoSection } from "./BanInfoSection";
import type { Profile } from "../types/adminPanelTypes";

interface UserDetailsCardProps {
  user: Profile;
  currentUser: any;
  onRefetchUser: () => void;
  onViewInstances: () => void;
  isCurrentUser: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UserDetailsCard = ({
  user,
  currentUser,
  onRefetchUser,
  onViewInstances,
  isCurrentUser,
}: UserDetailsCardProps) => {
  const [editingUser, setEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Sync edit form with user data when user changes
  useEffect(() => {
    setEditForm({
      username: user.username || "",
      email: user.email || "",
    });
    setEditingUser(false);
  }, [user]);

  const handleEdit = () => {
    if (user.id === currentUser?.id) {
      alert("You cannot edit your own account from the admin panel");
      return;
    }
    setEditingUser(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ username: user.username || "", email: user.email || "" });
    setEditingUser(false);
  };

  const handleSaveEdit = async () => {
    if (user.id === currentUser?.id) {
      alert("You cannot edit your own account from the admin panel");
      setEditingUser(false);
      return;
    }

    if (!editForm.username.trim() || !editForm.email.trim()) {
      alert("Username and email are required");
      return;
    }

    if (!EMAIL_REGEX.test(editForm.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await adminApi.changeUserCredentials(user.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
      });
      setEditingUser(false);
      onRefetchUser(); // Solo refresca el usuario actual
    } catch (error) {
      alert("Failed to update user");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
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
      onRefetchUser();
    } catch (error) {
      alert("Failed to ban user");
      console.error("Ban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!confirm("Are you sure you want to unban this user?")) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.unbanUser(user.id);
      onRefetchUser();
    } catch (error) {
      alert("Failed to unban user");
      console.error("Unban error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
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
    } catch (error) {
      alert("Failed to delete user");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, username: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, email: e.target.value }));
  };

  return (
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
            {user.is_banned ? "Banned" : "Not banned"}
          </span>
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Calendar size={14} />
            <span>
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-2">
            <div className="flex items-center gap-2">
              <User size={14} />
              Username
            </div>
          </label>
          {editingUser ? (
            <input
              type="text"
              value={editForm.username}
              onChange={handleUsernameChange}
              className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder={user.username || "Username"}
            />
          ) : (
            <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
              <p className="text-white font-medium">{user.username}</p>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-2">
            <div className="flex items-center gap-2">
              <Mail size={14} />
              Email
            </div>
          </label>
          {editingUser ? (
            <input
              type="email"
              value={editForm.email}
              onChange={handleEmailChange}
              className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder={user.email || "Email"}
            />
          ) : (
            <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
              <p className="text-blue-300">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Field */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-blue-300 mb-2">
          <div className="flex items-center gap-2">
            <Shield size={14} />
            Role
          </div>
        </label>
        <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.role === "admin"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Ban Information */}
      {user.is_banned && (
        <BanInfoSection
          banReason={user.ban_reason}
          banExpires={user.ban_expires}
        />
      )}

      {/* User ID */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-blue-300 mb-2">
          User ID
        </label>
        <div className="bg-slate-800/30 border border-blue-900/30 rounded-lg px-4 py-3">
          <code className="text-blue-300 font-mono text-sm">{user.id}</code>
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
              onClick={onViewInstances}
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
  );
};
