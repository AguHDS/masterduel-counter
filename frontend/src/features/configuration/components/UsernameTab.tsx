import { useEffect, useState } from "react";
import { User, AlertCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  createUsernameChangeHandler,
  getUsernameForSubmission,
  validateUsername,
} from "@/features/auth/utils/usernameUtils";
import { useChangeUsername } from "../hooks/useChangeUsername";
import type { ConfigurationTab } from "../types";

interface UsernameTabProps {
  activeTab: ConfigurationTab;
}

const formatCooldownDate = (isoDate?: string): string | null => {
  if (!isoDate) return null;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const UsernameTab = ({ activeTab }: UsernameTabProps) => {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const changeUsernameMutation = useChangeUsername();

  useEffect(() => {
    setUsername(user?.name || "");
  }, [user?.name]);

  if (activeTab !== "username") return null;

  const handleUsernameChange = createUsernameChangeHandler(setUsername);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    const validationResult = validateUsername(username, {
      requireNonEmpty: true,
      checkNormalizedLength: true,
    });

    if (!validationResult.isValid) {
      setValidationError(validationResult.error || "Invalid username");
      return;
    }

    const normalizedUsername = getUsernameForSubmission(username, {
      trim: true,
      limitLength: true,
    });

    if (normalizedUsername === user?.name) {
      setValidationError("New username must be different from current one");
      return;
    }

    try {
      const result = await changeUsernameMutation.mutateAsync({
        username: normalizedUsername,
      });

      const formattedCooldown = formatCooldownDate(result.nextAllowedChangeAt);
      setSuccessMessage(
        formattedCooldown
          ? `Username updated successfully. You can change it again after ${formattedCooldown}. Redirecting to sign in...`
          : "Username updated successfully. Redirecting to sign in...",
      );

      setTimeout(() => {
        logout();
      }, 1000);
    } catch {
      // Error is shown below through mutation error state.
    }
  };

  const errorMessage =
    validationError ||
    changeUsernameMutation.error?.message ||
    "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Change Username</h3>
        <p className="text-sm text-gray-400 mb-6">
          Your username must follow the same registration rules and can be changed once every 7 days.
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/40 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-300">
          Changing your username will close your current session. You will need to sign in again.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-400">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            New Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              maxLength={25}
              className="w-full pl-10 pr-4 py-2 bg-[#2a2430] border border-[#c2901c]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c2901c] transition-colors"
              placeholder="Enter new username"
              autoComplete="username"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changeUsernameMutation.isPending}
          className="w-full py-2 bg-gradient-to-r from-[#c2901c] to-[#d4a22e] hover:from-[#d4a22e] hover:to-[#c2901c] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {changeUsernameMutation.isPending ? "Changing Username..." : "Change Username"}
        </button>
      </form>
    </div>
  );
};
