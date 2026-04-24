import React, { useState } from "react";
import { MessagesSquare, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useGuideRequests } from "../hooks/useGuideRequests";
import { GuideRequestListItem } from "./GuideRequestListItem";
import { GuideRequestFullModal } from "./GuideRequestFullModal";
import { CreateGuideRequestModal } from "./CreateGuideRequestModal";
import { useAuth } from "@/features/auth";
import type { GuideRequest, GuideRequestStatus } from "../types/guideRequest.types";

type StatusFilter = "ALL" | GuideRequestStatus;

const SECTION_LIMIT = 5;

const SECTIONS: {
  label: string;
  status: GuideRequestStatus;
  emptyMsg: string;
}[] = [
  { label: "Open", status: "OPEN", emptyMsg: "No open requests" },
  { label: "In Progress", status: "TAKEN", emptyMsg: "None in progress" },
  { label: "Completed", status: "COMPLETED", emptyMsg: "None fulfilled" },
];

export const GuideRequestsSection: React.FC = () => {
  const { user } = useAuth();
  const [showFullModal, setShowFullModal] = useState(false);
  const [fullModalTab, setFullModalTab] = useState<StatusFilter>("OPEN");
  const [fullModalRequest, setFullModalRequest] = useState<GuideRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: openData, isLoading: openLoading } = useGuideRequests(
    1,
    SECTION_LIMIT,
    "OPEN",
  );
  const { data: takenData, isLoading: takenLoading } = useGuideRequests(
    1,
    SECTION_LIMIT,
    "TAKEN",
  );
  const { data: completedData, isLoading: completedLoading } = useGuideRequests(
    1,
    SECTION_LIMIT,
    "COMPLETED",
  );

  const dataMap = {
    OPEN: { data: openData, isLoading: openLoading },
    TAKEN: { data: takenData, isLoading: takenLoading },
    COMPLETED: { data: completedData, isLoading: completedLoading },
  } as const;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-[#c2901c]" />
          <h2 className="text-white font-semibold text-base">Guide Requests</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c2901c]/30 text-[#c2901c] text-xs font-medium hover:bg-[#c2901c]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Request
          </button>
          <button
            onClick={() => setShowFullModal(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#c2901c]"
          >
            Show all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-[#1c1f2e] rounded-xl border border-[#c2901c]/20 overflow-hidden flex divide-x divide-[#c2901c]/10">
        {SECTIONS.map(({ label, status, emptyMsg }) => {
          const { data, isLoading } = dataMap[status];
          const requests = data?.items ?? [];
          const total = data?.total ?? 0;

          return (
            <div key={status} className="flex-1 min-w-0 flex flex-col">
              <div className="px-3 py-2 border-b border-[#c2901c]/10 flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold text-[#c2901c] truncate">
                  {label}
                </span>
                {total > 0 && (
                  <span className="text-[10px] text-[#c2901c]/50 font-medium shrink-0">
                    ({total})
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 text-[#c2901c] animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-1.5 px-2 text-center">
                  <p className="text-slate-300 text-xs">{emptyMsg}</p>
                  {status === "OPEN" && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-yellow-500 text-xs hover:text-yellow-600 hover:underline"
                    >
                      + Create one
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {requests.map((request) => (
                    <GuideRequestListItem
                      key={request.id}
                      request={request}
                      onClick={() => {
                        setFullModalTab(status);
                        setFullModalRequest(request);
                        setShowFullModal(true);
                      }}
                    />
                  ))}
                  {total > SECTION_LIMIT && (
                    <button
                      onClick={() => {
                        setFullModalTab(status);
                        setFullModalRequest(null);
                        setShowFullModal(true);
                      }}
                      className="w-full py-2 text-[10px] text-yellow-500 hover:text-[#c2901c] hover:bg-[#c2901c]/5 flex items-center justify-center gap-0.5"
                    >
                      +{total - SECTION_LIMIT} more
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <GuideRequestFullModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        currentUser={user ?? null}
        initialTab={fullModalTab}
        initialRequest={fullModalRequest}
      />
      <CreateGuideRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </section>
  );
};
