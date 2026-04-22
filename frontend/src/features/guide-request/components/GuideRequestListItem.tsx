import React from "react";
import type { GuideRequest } from "../types/guideRequest.types";
import { GuideRequestStatusBadge } from "./GuideRequestStatusBadge";
import { Avatar } from "@/shared/components/DefaultAvatar";

interface GuideRequestListItemProps {
  request: GuideRequest;
  isSelected?: boolean;
  onClick: () => void;
}

export const GuideRequestListItem: React.FC<GuideRequestListItemProps> = ({
  request,
  isSelected = false,
  onClick,
}) => {
  const guideTypeLabel =
    request.guideType === "COUNTER" ? "Counter guide" : "Deck guide";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-[#c2901c]/10 hover:bg-[#c2901c]/5 ${
        isSelected ? "bg-[#c2901c]/10" : ""
      }`}
    >
      <div className="mt-0.5 shrink-0 text-[#c2901c]/60"></div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {request.title}
        </p>
        <p className="text-[10px] truncate mt-0.5 flex items-center flex-wrap gap-x-0.5">
          <span className="text-yellow-500">
            {request.archetypeName ?? `Archetype #${request.archetypeId}`}
          </span>
          <span className="text-slate-300">·</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-[2px] ${
              request.guideType === "COUNTER"
                ? "text-amber-500/80"
                : "text-blue-400"
            }`}
          >
            {guideTypeLabel}
          </span>
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <GuideRequestStatusBadge status={request.status} size="xs" />
          <Avatar
            username={request.requesterAlias}
            profilePictureUrl={request.requesterProfilePictureUrl}
            size="sm"
            className="!w-4 !h-4 !text-[9px] rounded-full"
          />
          <span className="text-blue-200 text-[10px] truncate">
            {request.requesterAlias}
          </span>
        </div>
      </div>
    </button>
  );
};
