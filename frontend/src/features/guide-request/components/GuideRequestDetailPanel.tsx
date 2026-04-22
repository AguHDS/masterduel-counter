import React from "react";
import { Loader2, ArrowLeft, ExternalLink, LogIn } from "lucide-react";
import type { GuideRequest } from "../types/guideRequest.types";
import { GuideRequestStatusBadge } from "./GuideRequestStatusBadge";
import {
  useTakeGuideRequest,
  useCancelTakeGuideRequest,
} from "../hooks/useGuideRequests";
import { buildGuidePath, buildGuideEditorPath } from "@/lib/config/urlHelpers";
import { useNavigate } from "react-router-dom";
import type { User } from "@/features/auth/context/AuthContext";

interface GuideRequestDetailPanelProps {
  request: GuideRequest;
  currentUser: User | null;
  onBack?: () => void;
  onTakeSuccess?: (request: GuideRequest) => void;
}

export const GuideRequestDetailPanel: React.FC<
  GuideRequestDetailPanelProps
> = ({ request, currentUser, onBack, onTakeSuccess }) => {
  const takeMutation = useTakeGuideRequest();
  const cancelMutation = useCancelTakeGuideRequest();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");

  const guideTypeLabel =
    request.guideType === "COUNTER" ? "Counter Guide" : "Deck Guide";

  const isMyTake = currentUser?.id === request.takenById;
  const canTake =
    request.status === "OPEN" &&
    !!currentUser &&
    currentUser.id !== request.requesterId;
  const canCancel = request.status === "TAKEN" && isMyTake;
  const showSignIn = request.status === "OPEN" && !currentUser;

  const handleTake = async () => {
    setError("");
    try {
      const updated = await takeMutation.mutateAsync(request.id);
      onTakeSuccess?.(updated);
      // Navigate to guide editor with the request context
      const editorPath = buildGuideEditorPath({
        archetypeId: request.archetypeId,
        instanceId: "new",
        guideType: request.guideType,
      });
      navigate(editorPath, {
        state: {
          guideType: request.guideType,
          guideRequestId: request.id,
        },
      });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to take this request.";
      setError(msg);
    }
  };

  const handleCancelTake = async () => {
    setError("");
    try {
      await cancelMutation.mutateAsync(request.id);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to cancel.";
      setError(msg);
    }
  };

  const fulfilledGuideHref =
    request.fulfilledInstanceId && request.archetypeName
      ? buildGuidePath({
          guideId: request.fulfilledInstanceId,
          archetypeName: request.archetypeName,
          userName: request.fulfilledByName ?? "",
          guideType: request.guideType,
        })
      : null;

  return (
    <div className="flex flex-col h-full">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#c2901c] hover:text-[#d4a534] transition-colors px-5 pt-4 pb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <div className="flex items-start gap-3 mb-2">
            <h2 className="text-white text-lg font-semibold leading-snug">
              {request.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 ml-7">
            <GuideRequestStatusBadge status={request.status} />
            <span className="inline-flex items-center rounded-full text-xs px-2 py-0.5 bg-[#c2901c]/15 text-[#c2901c] border border-[#c2901c]/20 font-medium">
              {guideTypeLabel}
            </span>
          </div>
        </div>

        <div className="bg-[#252836] rounded-lg px-4 py-3">
          <p className="text-slate-400 text-xs mb-0.5">Archetype</p>
          <p className="text-white text-sm font-medium">
            {request.archetypeName ?? `Archetype #${request.archetypeId}`}
          </p>
        </div>

        {request.description && (
          <div>
            <p className="text-slate-400 text-xs mb-1.5">Description</p>
            <p className="text-slate-200 text-sm leading-relaxed max-h-36 overflow-y-auto overflow-x-hidden scrollbar-homeAllPages break-words pr-1">
              {request.description}
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Requested by</span>
            <span className="text-slate-300">{request.requesterAlias}</span>
          </div>
          {request.status === "TAKEN" && request.takenByName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Taken by</span>
              <span className="text-amber-400">{request.takenByName}</span>
            </div>
          )}
          {request.status === "COMPLETED" && request.fulfilledByName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Completed by</span>
              <span className="text-blue-300">{request.fulfilledByName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Requested</span>
            <span className="text-slate-400 text-xs">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {fulfilledGuideHref && (
          <a
            href={fulfilledGuideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 text-sm hover:bg-emerald-500/15 transition-colors"
          >
            <span className="font-medium">Check the guide</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {(canTake || canCancel || showSignIn) && (
        <div className="p-5 border-t border-[#c2901c]/20">
          {showSignIn && (
            <a
              href="/signin"
              className="w-full py-2.5 rounded-lg border border-[#c2901c]/40 text-[#c2901c] text-sm hover:bg-[#c2901c]/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign in to take this request
            </a>
          )}
          {canTake && (
            <button
              onClick={handleTake}
              disabled={takeMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-[#c2901c] text-black text-sm font-semibold hover:bg-[#d4a534] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {takeMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Take this Request
            </button>
          )}
          {canCancel && (
            <button
              onClick={handleCancelTake}
              disabled={cancelMutation.isPending}
              className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {cancelMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Cancel My Take
            </button>
          )}
        </div>
      )}
    </div>
  );
};
