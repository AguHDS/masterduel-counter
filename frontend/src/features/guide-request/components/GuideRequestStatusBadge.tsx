import React from "react";
import type { GuideRequestStatus } from "../types/guideRequest.types";

interface GuideRequestStatusBadgeProps {
  status: GuideRequestStatus;
  size?: "sm" | "xs";
}

const config: Record<GuideRequestStatus, { label: string; className: string }> =
  {
    OPEN: {
      label: "Open",
      className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    TAKEN: {
      label: "In Progress",
      className: "bg-indigo-400/20 text-indigo-100 border border-indigo-300/30",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-amber-500/20 text-amber-400 border border-amber-400/30",
    },
  };

export const GuideRequestStatusBadge: React.FC<GuideRequestStatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const { label, className } = config[status];
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${className}`}>
      {label}
    </span>
  );
};
