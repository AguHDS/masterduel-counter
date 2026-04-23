import React from "react";
import { Loader2, ChevronRight, Plus } from "lucide-react";
import { useRecentGuideRequests } from "../hooks/useGuideRequests";
import type { GuideRequest } from "../types/guideRequest.types";
import { Avatar } from "@/shared/components/DefaultAvatar";

interface GuideRequestNavbarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullModal: (requestId?: number) => void;
  onOpenCreate: () => void;
  popupRef?: React.RefObject<HTMLDivElement | null>;
}

export const GuideRequestNavbarPopup: React.FC<
  GuideRequestNavbarPopupProps
> = ({ isOpen, onClose, onOpenFullModal, onOpenCreate, popupRef }) => {
  const { data: requests, isLoading } = useRecentGuideRequests(5);

  if (!isOpen) return null;

  const handleItemClick = (request: GuideRequest) => {
    onOpenFullModal(request.id);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute top-full right-0 mt-2 w-72 bg-[#1c1f2e] border border-[#c2901c]/30 rounded-xl shadow-2xl z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#c2901c]/20">
        <span className="text-white text-sm font-semibold">Guide Requests</span>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-1 text-[#c2901c] hover:text-[#d4a534] text-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto scrollbar-cardpair">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-[#c2901c] animate-spin" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-slate-500 text-xs">No open requests yet.</p>
            <button
              onClick={onOpenCreate}
              className="mt-2 text-[#c2901c] text-xs hover:underline"
            >
              Create the first one
            </button>
          </div>
        ) : (
          requests.map((request) => {
            const isCounter = request.guideType === "COUNTER";
            return (
              <button
                key={request.id}
                onClick={() => handleItemClick(request)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#c2901c]/5 border-b border-[#c2901c]/10 transition-colors last:border-b-0 flex items-start gap-2.5"
              >
                <Avatar
                  username={request.requesterAlias}
                  profilePictureUrl={request.requesterProfilePictureUrl}
                  size="sm"
                  className="!w-6 !h-6 !text-[10px] rounded-full mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {request.title}
                  </p>
                  <p className="text-[10px] truncate mt-0.5">
                    <span className="text-yellow-500">
                      {request.archetypeName ?? `#${request.archetypeId}`}{" "}
                      <span className="text-slate-400">·</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-[2px] ${
                        isCounter ? "text-amber-500/80" : "text-blue-400"
                      }`}
                    >
                      {isCounter ? "Counter Guide" : "Deck Guide"}{" "}
                      <span className="text-slate-400">·</span>
                    </span>
                    <span className="text-blue-200">
                      {request.requesterAlias}
                    </span>
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={() => {
          onOpenFullModal();
          onClose();
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#c2901c] hover:bg-[#c2901c]/5 transition-colors border-t border-[#c2901c]/20"
      >
        <span>View all requests</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
