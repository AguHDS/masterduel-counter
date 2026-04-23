import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Settings, ArrowLeft } from "lucide-react";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import type { ConfigurationTab } from "../types";
import { AccountTab } from "../components/AccountTab";
import { UsernameTab } from "../components/UsernameTab";

export const ConfigurationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("account");

  return (
    <>
      <Helmet>
        <title>Configuration - Masterduel Counter</title>
        <meta
          name="description"
          content="Manage your account settings and preferences for Masterduel Counter."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c14] via-[#1a1425] to-[#0f0c14]">
        <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-[#c2901c]" />
          <h1 className="text-3xl font-bold text-white">Configuration</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#c2901c]/20 bg-[#1a1420]">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "account"
                  ? "text-[#c2901c] border-b-2 border-[#c2901c] bg-[#1f1a24]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("username")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "username"
                  ? "text-[#c2901c] border-b-2 border-[#c2901c] bg-[#1f1a24]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Username
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AccountTab activeTab={activeTab} />
            <UsernameTab activeTab={activeTab} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};
