import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useCreateReport } from "../hooks/useReport";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "user" | "instance";
  targetId: string | number;
  targetName: string;
}

export const ReportModal = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>("");
  const createReportMutation = useCreateReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!reason.trim()) {
      setError("Please provide a reason for the report");
      return;
    }

    if (reason.length > 500) {
      setError("Reason must be 500 characters or less");
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        reportedUserId: targetType === "user" ? String(targetId) : undefined,
        reportedInstanceId:
          targetType === "instance" ? Number(targetId) : undefined,
        reason: reason.trim(),
      });

      alert("Report submitted successfully");
      setReason("");
      onClose();
    } catch (err) {
      const apiError =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "error" in err.response.data &&
        typeof err.response.data.error === "string"
          ? err.response.data.error
          : "Failed to submit report. Please try again.";

      setError(apiError);
      console.error("Report error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full border border-blue-800/30">
        <div className="flex items-center justify-between p-4 border-b border-blue-800/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={20} />
            <h2 className="text-lg font-semibold text-white">
              Report {targetType === "user" ? "User" : "Instance"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-2">
              You are reporting:{" "}
              <span className="font-medium text-white">{targetName}</span>
            </p>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Reason for report *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Please describe why you are reporting this..."
              className="w-full px-3 py-2 bg-slate-900 border border-blue-800/30 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[120px] resize-y"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              disabled={createReportMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending
                ? "Submitting..."
                : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
