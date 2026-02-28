import { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { useChangePassword } from "../hooks/useChangePassword";
import { useAuth } from "@/features/auth";

export const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const changePasswordMutation = useChangePassword();
  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // Validation
    if (!currentPassword) {
      setValidationError("Current password is required");
      return;
    }

    if (!newPassword) {
      setValidationError("New password is required");
      return;
    }

    if (newPassword.length < 5) {
      setValidationError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setValidationError("New password must be different from current password");
      return;
    }

    try {
      const result = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      // Only set success message and logout if password was actually changed
      if (result.success) {
        setSuccessMessage("Password changed successfully. Redirecting to login...");
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Logout after a short delay to show the success message
        setTimeout(async () => {
          await logout();
        }, 1000);
      } else {
        setValidationError("Failed to change password. Please try again.");
      }
    } catch (error) {
      // Error message is shown via changePasswordMutation.error
      // Don't logout on error
      console.error("Password change error:", error);
    }
  };

  const errorMessage = validationError || changePasswordMutation.error?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Current Password */}
      <div>
        <label
          htmlFor="current-password"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Current Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="current-password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#2a2430] border border-[#c2901c]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c2901c] transition-colors"
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#2a2430] border border-[#c2901c]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c2901c] transition-colors"
            placeholder="Enter new password (min. 8 characters)"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#2a2430] border border-[#c2901c]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c2901c] transition-colors"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={changePasswordMutation.isPending}
        className="w-full py-2 bg-gradient-to-r from-[#c2901c] to-[#d4a22e] hover:from-[#d4a22e] hover:to-[#c2901c] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        After changing your password, you will be logged out and need to sign in again.
      </p>
    </form>
  );
};
