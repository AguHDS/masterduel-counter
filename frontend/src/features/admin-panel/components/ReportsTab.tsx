import { useState } from "react";
import { Trash2, User, ExternalLink } from "lucide-react";
import { adminApi } from "../api/adminApi";
import type { Report } from "../types/adminPanelTypes";
import { getFrontendUrl } from "@/lib/config/urlHelpers";

interface ReportsTabProps {
  reports: Report[];
  onRefetchReports: () => void;
}

export const ReportsTab = ({ reports, onRefetchReports }: ReportsTabProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    setDeletingId(reportId);

    try {
      await adminApi.deleteReport(reportId.toString());
      onRefetchReports();
    } catch (error) {
      alert("Failed to delete report");
      console.error("Delete report error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getInstanceUrl = (archetypeId: number, instanceId: number): string => {
    const baseUrl = getFrontendUrl();
    return `${baseUrl}/archetype/${archetypeId}/instance/${instanceId}`;
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
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-400">Reporter:</span>
                  <span className="ml-2 text-white">{report.reporterName}</span>
                  <span className="ml-2 text-xs text-blue-400/70">
                    ({report.reporterEmail})
                  </span>
                </div>

                <div>
                  <span className="text-blue-400">Reported:</span>
                  {report.reportedUserName ? (
                    <span className="ml-2 text-white">
                      {report.reportedUserName}
                    </span>
                  ) : report.reportedInstanceTitle ? (
                    <span className="ml-2 text-white">
                      {report.reportedInstanceTitle}
                    </span>
                  ) : (
                    <span className="ml-2 text-gray-400">Unknown</span>
                  )}
                  <span className="ml-2 text-xs text-blue-400/70">
                    ID: {report.reportedUserId || report.reportedInstanceId}
                  </span>
                </div>
              </div>

              {/* MOSTRAR AUTOR DE LA INSTANCIA SI ES UN REPORTE DE INSTANCIA */}
              {report.reportedInstanceId &&
                report.reportedInstanceAuthorName && (
                  <div className="text-sm bg-blue-900/20 border border-blue-800/30 rounded p-2 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-blue-400" />
                      <span className="text-blue-400">Instance Author:</span>
                      <span className="text-white font-medium">
                        {report.reportedInstanceAuthorName}
                      </span>
                      <span className="text-xs text-blue-400/70">
                        ID: {report.reportedInstanceAuthorId}
                      </span>
                    </div>

                    {/* LINK A LA INSTANCIA REPORTADA - CORREGIDO */}
                    {report.reportedInstanceArchetypeId && (
                      <div className="flex items-center gap-2 pt-1 border-t border-blue-800/30">
                        <ExternalLink size={14} className="text-blue-400" />
                        <span className="text-blue-400">Instance URL:</span>
                        <a
                          href={getInstanceUrl(
                            report.reportedInstanceArchetypeId,
                            report.reportedInstanceId,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-300 transition-colors underline underline-offset-2"
                        >
                          View Reported Instance
                        </a>
                        <span className="text-xs text-blue-400/70">
                          (archetype: {report.reportedInstanceArchetypeId},
                          instance: {report.reportedInstanceId})
                        </span>
                      </div>
                    )}
                  </div>
                )}

              <div>
                <span className="text-sm text-blue-400 block mb-1">
                  Reason:
                </span>
                <div className="bg-slate-900/50 border border-blue-900/30 rounded p-3">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {report.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(report.id)}
                disabled={deletingId === report.id}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete report"
              >
                <Trash2
                  size={20}
                  className={deletingId === report.id ? "animate-pulse" : ""}
                />
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
