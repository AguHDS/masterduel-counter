import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify-email`, {
          params: { token },
        });

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/signin", {
              state: { message: "Email verified successfully! You can now sign in." }
            });
          }, 3000);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage("An error occurred during verification. Please try again.");
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <>
      <Helmet>
        <title>Verify Email - Masterduel Counter</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-slate-800/50 border border-blue-500/30 rounded-xl p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
                <p className="text-gray-400">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                <p className="text-gray-300 mb-4">{message}</p>
                <p className="text-sm text-gray-400">Redirecting to sign in...</p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate("/signin")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Go to Sign In
                </button>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};
