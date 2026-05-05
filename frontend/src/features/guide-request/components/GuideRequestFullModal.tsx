import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Search, Loader2 } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import {
  useGuideRequests,
  useGuideRequestCounts,
  useGuideRequestById,
} from "../hooks/useGuideRequests";
import { GuideRequestListItem } from "./GuideRequestListItem";
import { GuideRequestDetailPanel } from "./GuideRequestDetailPanel";
import { CreateGuideRequestModal } from "./CreateGuideRequestModal";
import type { GuideRequest, GuideRequestStatus } from "../types/guideRequest.types";
import type { User } from "@/features/auth/context/AuthContext";

type StatusFilter = "ALL" | GuideRequestStatus;

interface GuideRequestFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialTab?: StatusFilter;
  initialRequest?: GuideRequest | null;
  initialRequestId?: number | null;
}

const LIMIT = 30;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "TAKEN" },
  { label: "Completed", value: "COMPLETED" },
];

export const GuideRequestFullModal: React.FC<GuideRequestFullModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab,
  initialRequest,
  initialRequestId,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialTab ?? "OPEN");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<GuideRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useGuideRequests(
    page,
    LIMIT,
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const { data: initialRequestById } = useGuideRequestById(
    isOpen && initialRequestId ? initialRequestId : null,
  );
  const { data: counts } = useGuideRequestCounts();

  // Sync initialTab and initialRequest when modal reopens, reset create modal on close
  useEffect(() => {
    if (!isOpen) {
      setShowCreateModal(false);
      return;
    }

    setPage(1);

    if (initialRequest) {
      setStatusFilter(initialRequest.status);
      setSelectedRequest(initialRequest);
      return;
    }

    if (initialRequestById) {
      setStatusFilter(initialRequestById.status);
      setSelectedRequest(initialRequestById);
      return;
    }

    if (initialTab) {
      setStatusFilter(initialTab);
    } else {
      setStatusFilter("OPEN");
    }
    setSelectedRequest(null);
  }, [isOpen, initialTab, initialRequest, initialRequestById]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSelectRequest = (request: GuideRequest) => {
    setSelectedRequest(request);
  };

  const handleTabChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setPage(1);
    setSelectedRequest(null);
  };
  const items = data?.items ?? [];
  const displayItems = useMemo(() => {
    if (statusFilter !== "COMPLETED") {
      return items;
    }

    return [...items].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [items, statusFilter]);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (!isOpen) return null;

  const modal = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-[500]" />

      <div
        className="fixed inset-0 z-[501] flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <div
          className="bg-[#1c1f2e] rounded-xl shadow-2xl w-full max-w-4xl border border-[#c2901c]/30 flex flex-col"
          style={{ height: "min(90vh, 700px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2901c]/20 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-semibold text-lg">Guide Requests</h2>
              {total > 0 && (
                <span className="text-xs text-slate-500 bg-slate-700/50 rounded-full px-2 py-0.5">
                  {total}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c2901c] text-black text-xs font-bold hover:bg-[#d4a534] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Request a Guide
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-[#c2901c]/20 shrink-0 overflow-x-auto">
            {STATUS_TABS.map((tab) => {
              const count = counts
                ? tab.value === "ALL"
                  ? counts.ALL
                  : counts[tab.value as GuideRequestStatus]
                : undefined;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                    statusFilter === tab.value
                      ? "border-b-2 border-[#c2901c] text-[#c2901c]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 flex overflow-hidden scrollbar-homeAllPages">
            <div
              className={`flex flex-col border-r border-[#c2901c]/10 ${
                selectedRequest ? "hidden lg:flex lg:w-80" : "flex-1 lg:w-80"
              }`}
            >
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-[#c2901c] animate-spin" />
                </div>
              ) : displayItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-slate-500 text-sm">No requests found.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-3 text-[#c2901c] text-sm hover:underline"
                  >
                    Be the first to create one
                  </button>
                </div>
              ) : (
                <>
                  <Virtuoso
                    style={{ flex: 1 }}
                    data={displayItems}
                    itemContent={(_, request) => (
                      <GuideRequestListItem
                        key={request.id}
                        request={request}
                        isSelected={selectedRequest?.id === request.id}
                        onClick={() => handleSelectRequest(request)}
                      />
                    )}
                  />
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-3 border-t border-[#c2901c]/10 shrink-0">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-2 py-1 text-xs text-[#c2901c] disabled:opacity-30 hover:text-[#d4a534]"
                      >
                        ‹
                      </button>
                      <span className="text-xs text-slate-500">
                        {page} / {totalPages}
                      </span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-2 py-1 text-xs text-[#c2901c] disabled:opacity-30 hover:text-[#d4a534]"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`flex-1 min-w-0 ${
                selectedRequest ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }`}
            >
              {selectedRequest ? (
                <GuideRequestDetailPanel
                  request={selectedRequest}
                  currentUser={currentUser}
                  onBack={() => setSelectedRequest(null)}
                  onTakeSuccess={(updated) => setSelectedRequest(updated)}
                  onDeleteSuccess={(deletedRequestId) => {
                    if (selectedRequest?.id === deletedRequestId) {
                      setSelectedRequest(null);
                    }
                  }}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <Search className="h-8 w-8 text-slate-600" />
                  <p className="text-slate-500 text-sm">
                    Select a request to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateGuideRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );

  return createPortal(modal, document.body);
};
