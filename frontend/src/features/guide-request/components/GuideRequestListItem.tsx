import React from "react";
import type { GuideRequest } from "../types/guideRequest.types";
import { GuideRequestStatusBadge } from "./GuideRequestStatusBadge";
import { Avatar } from "@/shared/components/DefaultAvatar";

interface GuideRequestListItemProps {
  request: GuideRequest;
  isSelected?: boolean;
  onClick: () => void;
  showCompletedParticipants?: boolean;
}

export const GuideRequestListItem: React.FC<GuideRequestListItemProps> = ({
  request,
  isSelected = false,
  onClick,
  showCompletedParticipants = false,
}) => {
  const guideTypeLabel =
    request.guideType === "COUNTER" ? "Counter guide" : "Deck guide";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 max-[650px]:px-3 py-3 max-[650px]:py-2 flex items-start gap-3 border-b border-[#c2901c]/10 hover:bg-[#c2901c]/5 ${
        isSelected ? "bg-[#c2901c]/10" : ""
      }`}
    >
      <div className="mt-0.5 shrink-0 text-[#c2901c]/60"></div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
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
          <span className="max-[650px]:inline-flex hidden">
            <GuideRequestStatusBadge status={request.status} size="xs" />
          </span>
        </p>

        {/* DESKTOP participants */}
        {showCompletedParticipants && request.status === "COMPLETED" ? (
          <div className="max-[650px]:hidden flex items-center gap-1.5 mt-1.5 min-w-0 text-[10px] flex-wrap">
            <GuideRequestStatusBadge status={request.status} size="xs" />
            <span className="text-slate-400 shrink-0">Requester:</span>
            <Avatar
              username={request.requesterAlias}
              profilePictureUrl={request.requesterProfilePictureUrl}
              size="sm"
              className="!w-4 !h-4 !text-[9px] rounded-full"
            />
            <span className="text-blue-200 truncate max-w-[80px]">
              {request.requesterAlias}
            </span>
            <span className="text-slate-500 shrink-0">-</span>
            <span className="text-slate-400 shrink-0">Completed by:</span>
            <Avatar
              username={request.fulfilledByName ?? "Unknown"}
              profilePictureUrl={request.fulfilledByProfilePictureUrl}
              size="sm"
              className="!w-4 !h-4 !text-[9px] rounded-full"
            />
            <span className="text-cyan-200 truncate max-w-[90px]">
              {request.fulfilledByName ?? "Unknown"}
            </span>
          </div>
        ) : (
          <div className="max-[650px]:hidden flex items-center gap-2 mt-1.5">
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
        )}

        {/* MOBILE */}
        <div className="hidden max-[650px]:flex items-center gap-1.5 mt-1 text-[10px] flex-wrap">
          <span className="max-[450px]:hidden text-slate-400 shrink-0">Requester:</span>
          <Avatar
            username={request.requesterAlias}
            profilePictureUrl={request.requesterProfilePictureUrl}
            size="sm"
            className="max-[450px]:hidden !w-4 !h-4 !text-[9px] rounded-full"
          />
          <span className="max-[450px]:hidden text-blue-200 truncate">
            {request.requesterAlias}
          </span>
          {showCompletedParticipants && request.status === "COMPLETED" && (
            <>
              <span className="text-slate-500 shrink-0">-</span>
              <span className="text-slate-400 shrink-0">Completed by:</span>
              <Avatar
                username={request.fulfilledByName ?? "Unknown"}
                profilePictureUrl={request.fulfilledByProfilePictureUrl}
                size="sm"
                className="!w-4 !h-4 !text-[9px] rounded-full"
              />
              <span className="text-cyan-200 truncate">
                {request.fulfilledByName ?? "Unknown"}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
};
