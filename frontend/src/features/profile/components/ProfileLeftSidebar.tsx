import { useRef } from "react";
import {
  Trophy,
  ThumbsUp,
  Eye,
  Crown,
  MailWarning,
  Camera,
  Flame,
} from "lucide-react";
import { getOptimizedCardImageUrl, getOptimizedProfilePictureUrl } from "@/lib/utils/imageOptimization";
import { formatCompactNumber } from "@/shared/utils/formatNumber";
import type { Profile } from "../api/profileApi";
import type { GuideListItem } from "@/lib/http/guideInstancesApi";

interface ProfileLeftSidebarProps {
  profile: Profile | undefined;
  isEditMode: boolean;
  isOwner: boolean;
  isSaving: boolean;
  isDeletingPhoto: boolean;
  selectedFile: File | null;
  fileError: string | null;
  previewUrl: string | null;
  displayPhotoUrl: string | null | undefined;
  userRank: number | null | undefined;
  totalViews: number;
  fulfilledRequestsCount: number | undefined;
  userGuides: GuideListItem[] | undefined;
  onSelectGuide: (guide: GuideListItem) => void;
  onViewAllGuides: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: () => void;
}

export const ProfileLeftSidebar = ({
  profile,
  isEditMode,
  isOwner,
  isSaving,
  isDeletingPhoto,
  selectedFile,
  fileError,
  previewUrl,
  displayPhotoUrl,
  userRank,
  totalViews,
  fulfilledRequestsCount,
  userGuides,
  onSelectGuide,
  onViewAllGuides,
  onFileInputChange,
  onDeletePhoto,
}: ProfileLeftSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
      <div
        className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-auto lg:h-[800px]"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a1235 0%, #08061a 65%)' }}
      >
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-lg z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-lg z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-lg z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-yellow-500/50 rounded-br-lg z-20 pointer-events-none" />
        <div className="relative z-10 p-4 sm:p-5 space-y-4 h-full">
          {/* Username and Profile Photo Square */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-3">
              {profile?.userName}
            </h1>
            <div className="relative w-32 h-32 sm:w-44 sm:h-44">
              <div
                className={`absolute inset-0 rounded-lg border-2 ${
                  fileError && previewUrl && !selectedFile
                    ? "border-red-500 shadow-red-500/30"
                    : "border-yellow-500/90 shadow-amber-500/30"
                }`}
              ></div>
              <div
                className={`absolute inset-1 overflow-hidden border-2 ${
                  fileError && previewUrl && !selectedFile
                    ? "border-red-400/40"
                    : "border-yellow-400/40"
                } bg-slate-900`}
              >
                {displayPhotoUrl ? (
                  <img
                    src={getOptimizedProfilePictureUrl(displayPhotoUrl, { size: 'medium' }) || displayPhotoUrl}
                    alt={`${profile?.userName}'s profile`}
                    className={`w-full h-full object-cover ${
                      fileError && previewUrl && !selectedFile
                        ? "opacity-50"
                        : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-300 text-4xl font-semibold bg-gradient-to-br from-slate-800 to-slate-900">
                    {profile?.userName?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}
              </div>
            </div>

            {/* Error message directly below the photo */}
            {isEditMode && isOwner && fileError && (
              <div className="mt-3 w-full p-2 bg-red-900/50 border border-red-500 rounded text-xs text-red-200">
                <p>{fileError}</p>
              </div>
            )}
          </div>

          {isEditMode && isOwner && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="relative w-full py-2 group overflow-hidden rounded disabled:opacity-50"
              >
                <div className="absolute inset-0 border border-amber-600/40 rounded group-hover:border-amber-500/60 transition-colors" />
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <span className="relative flex items-center justify-center gap-1.5 text-amber-300/80 font-bold text-[10px] tracking-[0.18em] uppercase group-hover:text-amber-300 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  Change Photo
                </span>
              </button>

              {profile?.profilePictureUrl && (
                <button
                  onClick={onDeletePhoto}
                  disabled={isDeletingPhoto || isSaving}
                  className="relative w-full py-2 group overflow-hidden rounded disabled:opacity-50"
                >
                  <div className="absolute inset-0 border border-red-700/40 rounded group-hover:border-red-600/60 transition-colors" />
                  <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
                  <span className="relative flex items-center justify-center gap-1.5 text-red-400/80 font-bold text-[10px] tracking-[0.18em] uppercase group-hover:text-red-400 transition-colors">
                    <Flame className="w-3.5 h-3.5" />
                    {isDeletingPhoto ? "Deleting..." : "Delete Photo"}
                  </span>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col">
            {/* Stats with Icons */}
            <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-amber-200 font-semibold text-sm">
                  Rank
                </span>
              </div>
              <span className="text-base font-semibold text-yellow-400">
                {userRank ? `#${userRank}` : "Unranked"}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="text-amber-200 font-semibold text-sm">
                  Guide Likes
                </span>
              </div>
              <span className="text-base font-semibold text-green-500">
                {profile?.totalLikes ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="text-amber-200 font-semibold text-sm">
                  Guide Views
                </span>
              </div>
              <span className="text-base font-semibold text-purple-300">
                {formatCompactNumber(totalViews)}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
              <div className="flex items-center gap-2">
                <MailWarning className="w-5 h-5 text-orange-400" />
                <span className="text-amber-200 font-semibold text-sm">
                  Completed Requests
                </span>
              </div>
              <span className="text-base font-semibold text-orange-400">
                {fulfilledRequestsCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-amber-200 font-semibold text-sm">
                  Role
                </span>
              </div>
              <span
                className={`text-base font-semibold ${
                  profile?.role === "admin"
                    ? "text-red-600"
                    : profile?.role === "supporter"
                      ? "text-pink-500"
                      : "text-green-400"
                }`}
              >
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Best Guides */}
          <div className="space-y-3">
            <h3 className="text-yellow-500 font-bold text-sm flex items-center gap-2 border-t border-yellow-600/30 pt-4">
              <span className="text-lg">♦</span> Best Guides
            </h3>
            {userGuides && userGuides.length > 0 ? (
              <>
                <div className="space-y-1 mb-4">
                  {userGuides.slice(0, 3).map((guide) => (
                    <div
                      key={guide.id}
                      className="flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors cursor-pointer"
                      onClick={() => onSelectGuide(guide)}
                    >
                      {guide.headerCardImageUrl ? (
                        <img
                          src={getOptimizedCardImageUrl(
                            guide.headerCardImageUrl,
                            { size: "thumbnail" },
                          )}
                          alt={
                            guide.headerCardName || "Header card"
                          }
                          className="h-[50px] w-[50px] border-2 border-yellow-500/80 shadow-sm object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-slate-400 text-xs">
                            -
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white text-sm font-semibold truncate flex-1">
                            {guide.title}
                          </p>
                          <span className="text-green-400 text-xs font-semibold flex-shrink-0">
                            ↑ {guide.likes}
                          </span>
                        </div>
                        <p className="text-amber-200/70 text-xs truncate">
                          {guide.archetypeName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onViewAllGuides}
                  className="w-full px-4 hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors"
                >
                  View all ({userGuides.length})
                </button>
              </>
            ) : (
              <div className="text-center text-gray-400 py-4">
                <p className="text-sm">No guides yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
