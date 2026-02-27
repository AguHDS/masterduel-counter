import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useAuthQueries";
import { Lock, User, CheckCircle } from "lucide-react";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { DiscordButton } from "./DiscordButton";
import {
  createUsernameChangeHandler,
  getUsernameForSubmission,
} from "../utils/usernameUtils";

export const LoginForm = () => {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    // Check if there's a success message from navigation state (e.g., after email verification)
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Normalize username before sending
    const normalizedUsername = getUsernameForSubmission(username, {
      trim: true,
      limitLength: false, // For login, we don't limit length, backend will validate
    });

    login(
      { username: normalizedUsername, password },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (
          error: Error & { response?: { data?: { message?: string } } },
        ) => {
          const message =
            error?.response?.data?.message || error?.message || "Login failed";
          setErrorMessage(message);
        },
      },
    );
  };

  // Use the utility function for username changes
  const handleUsernameChange = createUsernameChangeHandler(setUsername);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-950 to-blue-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <header>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign In
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Welcome back! Sign in to your account
          </p>
        </header>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          aria-label="Sign in form"
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={25}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  aria-label="Enter your username"
                  aria-describedby="username-help"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  aria-label="Enter your password"
                />
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="rounded-md bg-green-900/50 border border-green-700 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-200">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <p className="text-sm text-red-200">{errorMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-slate-950 to-blue-950 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div>
            <DiscordButton mode="signin" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </div>
    </div>
  );
};
