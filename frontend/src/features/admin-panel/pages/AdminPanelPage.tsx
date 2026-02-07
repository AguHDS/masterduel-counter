import { useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData";
import { TabNavigation } from "../components/TabNavigation";
import { ManageAccountsTab } from "../components/ManageAccountsTab";
import { ReportsTab } from "../components/ReportsTab";
import { ManageInstancesTab } from "../components/ManageInstancesTab";
import type { AdminTab } from "../types/adminPanelTypes";

export const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("accounts");
  const { users, reports, loading, error, refetchUsers, refetchReports } =
    useAdminData();

  const handleRefresh = () => {
    switch (activeTab) {
      case "accounts":
        refetchUsers();
        break;
      case "reports":
        refetchReports();
        break;
      default:
        refetchUsers();
    }
  };

  return (
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
                  <p className="text-blue-300 mt-1">
                    Manage users, instances, and reports
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
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
                {activeTab === "accounts" && (
                  <ManageAccountsTab users={users} onRefresh={refetchUsers} />
                )}
                {activeTab === "reports" && (
                  <ReportsTab reports={reports} onRefresh={refetchReports} />
                )}
                {activeTab === "publications" && (
                  <ManageInstancesTab
                    publications={[]}
                    onRefresh={refetchUsers}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
