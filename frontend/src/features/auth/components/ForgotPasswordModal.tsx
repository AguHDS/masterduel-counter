import { useState } from "react";
import type { FormEvent } from "react";
import { X, Mail, Loader2, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "../api/authApi";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStatus("loading");

    try {
      await requestPasswordReset({ email });

      setStatus("success");
      setMessage("Password reset link sent! Check your email (or console in development mode).");
      setEmail("");

      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to send reset link. Please try again.";
      setMessage(errorMessage);
    }
  };

  const handleClose = () => {
    if (status !== "loading") {
      onClose();
      // Reset state after modal closes
      setTimeout(() => {
        setEmail("");
        setStatus("idle");
        setMessage("");
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={status === "loading"}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
          <p className="text-sm text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Sent!</h3>
              <p className="text-sm text-gray-400">{message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  disabled={status === "loading"}
                />
              </div>
            </div>

            {message && status === "error" && (
              <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
                <p className="text-sm text-red-200">{message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={status === "loading"}
                className="flex-1 py-2 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
