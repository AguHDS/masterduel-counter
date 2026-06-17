import { useState } from "react";
import { Shield } from "lucide-react";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { useAdminData } from "../hooks/useAdminData";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { TabNavigation } from "../components/TabNavigation";
import { ManageAccountsTab } from "../components/ManageAccountsTab";
import { ReportsTab } from "../components/ReportsTab";
import { TrackingTab } from "../components/TrackingTab";
import { AdminLatestUpdatesTab } from "@/features/latest-updates/components/AdminLatestUpdatesTab";
import { TierListAdminTab } from "@/features/tier-list/components/TierListAdminTab";
import { AdminArchetypesTab } from "../components/AdminArchetypesTab";
import type { AdminTab } from "../types/adminPanelTypes";

export const AdminPanelPage = () => {
  const { user, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("accounts");

  const {
    reports,
    loading: dataLoading,
    error,
    refetchReports,
  } = useAdminData();

  const loading = authLoading || dataLoading;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-yellow-600/40 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950/90 to-purple-950/90 border-b-2 border-yellow-600/30 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
                  <Shield className="text-blue-400" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-blue-300">
                      Welcome,{" "}
                      <span className="font-semibold text-yellow-400">
                        {user?.name}
                      </span>
                    </p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/30">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-yellow-600/20">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300">{error.message}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            )}

            {!loading && (
              <>
                {activeTab === "accounts" && <ManageAccountsTab />}
                {activeTab === "reports" && (
                  <ReportsTab
                    reports={reports}
                    onRefetchReports={refetchReports}
                  />
                )}                {activeTab === "tracking" && <TrackingTab />}
                {activeTab === "latest-updates" && <AdminLatestUpdatesTab />}
                {activeTab === "tier-list" && <TierListAdminTab />}
                {activeTab === "archetypes" && <AdminArchetypesTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
