import { useState } from "react";
import { Trash2 } from "lucide-react";
import { adminApi } from "../api/adminApi";
import type { Report } from "../types/adminPanelTypes";

interface ReportsTabProps {
  reports: Report[];
  onRefresh: () => void;
}

export const ReportsTab = ({ reports, onRefresh }: ReportsTabProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }
    setLoading(true);
    try {
      await adminApi.deleteReport(reportId);
      onRefresh();
    } catch (error) {
      alert("Failed to delete report");
      console.error("Delete report error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border border-blue-800/30 rounded-lg p-6 hover:border-blue-700/50 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : report.status === "resolved"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                  }`}
                >
                  {report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)}
                </span>
                <span className="text-xs text-blue-400">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-blue-300">Publication:</span>
                  <span className="text-white font-medium">
                    {report.publication_name}
                  </span>
                  <span className="text-xs text-blue-400/70">
                    ID: {report.publication_id}
                  </span>
                </div>

                <div className="bg-slate-900/50 border border-blue-900/30 rounded p-4">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {report.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(report.id)}
                disabled={loading}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                title="Delete report"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {reports.length === 0 && (
        <div className="text-center py-12 text-blue-300">No reports found</div>
      )}
    </div>
  );
};
