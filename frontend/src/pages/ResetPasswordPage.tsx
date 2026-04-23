import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Reset token is missing");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStatus("idle");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Reset token is missing");
      return;
    }

    setStatus("loading");

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      setStatus("success");
      setMessage("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/signin", {
          state: {
            message:
              "Password reset successfully! You can now sign in with your new password.",
          },
        });
      }, 1000);
    } catch (error: unknown) {
      setStatus("error");

      let errorMessage = "Failed to reset password. The link may be expired.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: string }).message);
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setMessage(errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Masterduel Counter</title>
        <meta
          name="description"
          content="Reset your password for Masterduel Counter"
        />
      </Helmet>

      <Navbar />

      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-950 to-blue-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <header className="text-center">
            <h1 className="text-3xl font-extrabold text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Enter your new password below
            </p>
          </header>

          {status === "success" ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Password Reset Successfully!
                </h2>
                <p className="text-gray-400">{message}</p>
              </div>
            </div>
          ) : status === "error" && !token ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-400 mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Invalid Link
                </h2>
                <p className="text-gray-400">{message}</p>
              </div>
            </div>
          ) : (
            <form
              className="mt-8 space-y-6 bg-slate-800 rounded-lg p-8"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter new password"
                      disabled={status === "loading"}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm new password"
                      disabled={status === "loading"}
                    />
                  </div>
                </div>
              </div>

              {message && status === "error" && (
                <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
                  <p className="text-sm text-red-200">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};
