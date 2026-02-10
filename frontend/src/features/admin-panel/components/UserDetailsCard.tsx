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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BanInfoSection } from "./BanInfoSection";
import type { Profile } from "../types/adminPanelTypes";
import {
  useDeleteUser,
  useChangeUserCredentials,
  useBanUser,
  useUnbanUser,
} from "../hooks/useAdminData";

interface UserDetailsCardProps {
  user: Profile;
  currentUser: any;
  onRefetchUser: () => void;
  onViewInstances: () => void;
  isCurrentUser: boolean;
  onUserDeleted?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UserDetailsCard = ({
  user,
  onRefetchUser,
  onViewInstances,
  isCurrentUser,
  onUserDeleted,
}: UserDetailsCardProps) => {
  const deleteUserMutation = useDeleteUser();
  const changeCredentialsMutation = useChangeUserCredentials();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const [editingUser, setEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Sync edit form with user data when user changes
  useEffect(() => {
    setEditForm({
      username: user.username || "",
      email: user.email || "",
    });
    setEditingUser(false);
    setErrorMessage("");
  }, [user]);

  // Estados combinados de loading
  const isMutating =
    deleteUserMutation.isPending ||
    changeCredentialsMutation.isPending ||
    banUserMutation.isPending ||
    unbanUserMutation.isPending;

  const handleEdit = () => {
    if (isCurrentUser) {
      alert("You cannot edit your own account from the admin panel");
      return;
    }
    setEditingUser(true);
    setErrorMessage("");
  };

  const handleCancelEdit = () => {
    setEditForm({ username: user.username || "", email: user.email || "" });
    setEditingUser(false);
    setErrorMessage("");
  };

  const handleSaveEdit = () => {
    if (isCurrentUser) {
      alert("You cannot edit your own account from the admin panel");
      setEditingUser(false);
      return;
    }

    if (!editForm.username.trim() || !editForm.email.trim()) {
      setErrorMessage("Username and email are required");
      return;
    }

    if (!EMAIL_REGEX.test(editForm.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    changeCredentialsMutation.mutate(
      {
        userId: user.id,
        credentials: {
          username: editForm.username.trim(),
          email: editForm.email.trim(),
        },
      },
      {
        onSuccess: () => {
          setEditingUser(false);
          onRefetchUser();
          setErrorMessage("");
        },
        onError: (error: any) => {
          setErrorMessage(
            error.response?.data?.message || "Failed to update user",
          );
        },
      },
    );
  };

  const handleBanUser = () => {
    if (isCurrentUser) {
      alert("You cannot ban yourself");
      return;
    }

    if (!window.confirm(`Are you sure you want to ban ${user.username}?`)) {
      return;
    }

    banUserMutation.mutate(user.id, {
      onSuccess: () => {
        onRefetchUser();
      },
      onError: (error: any) => {
        alert(error.response?.data?.message || "Failed to ban user");
      },
    });
  };

  const handleUnbanUser = () => {
    if (!window.confirm(`Are you sure you want to unban ${user.username}?`)) {
      return;
    }

    unbanUserMutation.mutate(user.id, {
      onSuccess: () => {
        onRefetchUser();
      },
      onError: (error: any) => {
        alert(error.response?.data?.message || "Failed to unban user");
      },
    });
  };

  const handleDeleteUser = () => {
    if (isCurrentUser) {
      alert("You cannot delete your own account");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${user.username}? This action cannot be undone and will delete all user data.`,
      )
    ) {
      return;
    }

    deleteUserMutation.mutate(user.id, {
      onSuccess: () => {
        // Notify parent component that user was deleted
        if (onUserDeleted) {
          onUserDeleted();
        }

        // Navigate back to account list
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
      },
      onError: (error: any) => {
        const errorMsg =
          error.response?.data?.message || "Failed to delete user";
        alert(errorMsg);
      },
    });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, username: e.target.value }));
    setErrorMessage("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, email: e.target.value }));
    setErrorMessage("");
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

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </p>
        </div>
      )}

      {/* Estado de eliminación en progreso */}
      {deleteUserMutation.isPending && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            Deleting user...
          </p>
        </div>
      )}

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
              disabled={isMutating}
              className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
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
              disabled={isMutating}
              className="w-full bg-slate-800/50 border border-blue-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
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
              disabled={isMutating}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {changeCredentialsMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {changeCredentialsMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isMutating}
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
              disabled={isMutating}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Package size={18} />
              View Instances
            </button>
            <button
              onClick={handleEdit}
              disabled={isMutating || isCurrentUser}
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
                disabled={isMutating}
                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {unbanUserMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Ban size={18} />
                )}
                {unbanUserMutation.isPending ? "Processing..." : "Unban User"}
              </button>
            ) : (
              <button
                onClick={handleBanUser}
                disabled={isMutating || isCurrentUser}
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
              disabled={isMutating || isCurrentUser}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isCurrentUser
                  ? "bg-gray-600/20 border border-gray-500/50 text-gray-400 cursor-not-allowed"
                  : "bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300"
              } disabled:opacity-50`}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
