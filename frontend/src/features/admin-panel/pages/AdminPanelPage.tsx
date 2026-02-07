import { useState } from "react";
import { Shield, RefreshCw, Lock } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { TabNavigation } from "../components/TabNavigation";
import { ManageAccountsTab } from "../components/ManageAccountsTab";
import { ReportsTab } from "../components/ReportsTab";
import { ManageInstancesTab } from "../components/ManageInstancesTab";
import type { AdminTab } from "../types/adminPanelTypes";

export const AdminPanelPage = () => {
  // Verificar autenticación y rol de admin
  const { user, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("accounts");
  const {
    users,
    reports,
    loading: dataLoading,
    error,
    refetchUsers,
    refetchReports,
  } = useAdminData();

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

  const loading = authLoading || dataLoading;

  // Mostrar estado de carga o verificación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300">Verifying admin permissions...</p>
        </div>
      </div>
    );
  }

  // Si el usuario no es admin (pero está autenticado), mostrar mensaje
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-slate-900/80 to-red-900/40 border-2 border-red-600/40 rounded-xl shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-full">
              <Lock className="text-red-400" size={48} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">
                Access Denied
              </h1>
              <p className="text-blue-300">
                You don't have permission to access the admin panel.
              </p>
              <p className="text-sm text-blue-400 mt-2">
                Required role:{" "}
                <span className="font-semibold text-yellow-400">admin</span>
              </p>
              <p className="text-sm text-blue-400">
                Your role:{" "}
                <span className="font-semibold text-red-400">
                  {user.role || "user"}
                </span>
              </p>
            </div>
            <a
              href="/"
              className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

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
