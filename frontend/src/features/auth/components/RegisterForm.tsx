import { useState, useCallback, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useAuthQueries";
import { Lock, User, Mail, X } from "lucide-react";
import { Turnstile, type TurnstileRef } from "@/shared/components/Turnstile";
import { DiscordButton } from "./DiscordButton";
import {
  validateUsername,
  createUsernameChangeHandler,
  getUsernameForSubmission,
} from "../utils/usernameUtils";

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

export const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { mutate: register, isPending } = useRegister();
  const turnstileRef = useRef<TurnstileRef>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowVerificationModal(false);
      }
    };

    if (showVerificationModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVerificationModal]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showVerificationModal) {
        setShowVerificationModal(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showVerificationModal]);

  // Memoize callbacks to prevent Turnstile re-render
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setErrorMessage("CAPTCHA verification failed. Please try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUsernameError(null);

    // Validate username before sending
    const usernameValidation = validateUsername(username, {
      requireNonEmpty: true,
      checkNormalizedLength: true,
    });

    if (!usernameValidation.isValid) {
      setUsernameError(usernameValidation.error || "Invalid username");
      return;
    }

    if (!turnstileToken) {
      setErrorMessage("Please complete the CAPTCHA verification");
      return;
    }

    // Use the normalized username for the request
    const normalizedUsername = getUsernameForSubmission(username, {
      trim: true,
      limitLength: true,
    });

    register(
      { username: normalizedUsername, email, password, turnstileToken },
      {
        onSuccess: () => {
          setRegisteredEmail(email);
          setShowVerificationModal(true);
          // Reset form
          setUsername("");
          setEmail("");
          setPassword("");
          setTurnstileToken(null);
          turnstileRef.current?.reset();
        },
        onError: (
          error: Error & { response?: { data?: { message?: string } } },
        ) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Registration failed";
          setErrorMessage(message);

          // Reset turnstile and clear token so user can try again
          setTurnstileToken(null);
          turnstileRef.current?.reset();
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
            Sign Up
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create your account to get started
          </p>
        </header>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          aria-label="Registration form"
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
                  placeholder="Username (max 25)"
                  aria-label="Choose a username"
                  aria-describedby="username-help username-error"
                />
              </div>
              <div className="mt-1 flex justify-between items-center">
                {usernameError && (
                  <p id="username-error" className="text-xs text-red-400">
                    {usernameError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  aria-label="Enter your email address"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 placeholder-gray-500 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <p className="text-sm text-red-200">{errorMessage}</p>
            </div>
          )}

          {/* Cloudflare Turnstile CAPTCHA */}
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              theme="dark"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!turnstileToken || !!usernameError || isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Creating account..." : "Sign up"}
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
            <DiscordButton mode="signup" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={modalRef}
              className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-blue-900 p-6 text-left shadow-xl transition-all border border-blue-500/30"
            >
              <button
                onClick={() => setShowVerificationModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 mb-4">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>

              <h3 className="text-2xl font-bold text-center text-white mb-2">
                Verify Your Email
              </h3>

              <div className="text-center space-y-3">
                <p className="text-gray-300">
                  We've sent a verification email to:
                </p>
                <p className="text-lg font-semibold text-blue-400 break-all">
                  {registeredEmail}
                </p>
                <p className="text-gray-400 text-sm">
                  Click the link in the email to verify your account and
                  complete the registration process.
                </p>
              </div>

              <div className="mt-6 bg-blue-950/50 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-200 text-center">
                  <span className="font-semibold">Don't see the email?</span>
                  <br />
                  Check your "spam" and "others" folder.
                </p>
              </div>

              {/* Action button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
