import { useState } from "react";
import { FavoriteCardEditor } from "./FavoriteCardEditor";
import { TrendingSection } from "./TrendingSection";
import { TrendingHistoryModal } from "./TrendingHistoryModal";
import type { TrendingAchievement } from "../../ranking/types/ranking.types";
import type { Card } from "@/features/archetypes/types";

interface ProfileRightSidebarProps {
  favoriteCardId: number | null;
  isEditMode: boolean;
  isOwner: boolean;
  onCardSelect: (card: Card) => void;
  trendingAchievements: TrendingAchievement[];
  profilePictureUrl: string | null | undefined;
  userName: string | undefined;
  onGuideClick: (guideId: number) => void;
}

export const ProfileRightSidebar = ({
  favoriteCardId,
  isEditMode,
  isOwner,
  onCardSelect,
  trendingAchievements,
  profilePictureUrl,
  userName,
  onGuideClick,
}: ProfileRightSidebarProps) => {
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);

  return (
    <>
      <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
        <div
          className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-auto lg:h-[800px]"
          style={{ background: 'radial-gradient(ellipse at 50% 38%, #1a1235 0%, #08061a 65%)' }}
        >
          {/* Subtle corner accents */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-lg z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-lg z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-lg z-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-yellow-500/50 rounded-br-lg z-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col">
            {/* Decorative title */}
            <div className="pt-6 pb-5 px-5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/55" />
                <span className="text-yellow-500/55 text-[9px] leading-none">◆</span>
                <h2 className="text-yellow-400 font-bold text-sm tracking-[0.22em] uppercase px-1">
                  Favorite Card
                </h2>
                <span className="text-yellow-500/55 text-[9px] leading-none">◆</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/55" />
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-yellow-600/15 to-transparent" />
            </div>

            {/* Card content */}
            <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden scrollbar-homeAllPages px-5 pt-4">
              <FavoriteCardEditor
                cardId={favoriteCardId}
                isEditMode={isEditMode && isOwner}
                onCardSelect={onCardSelect}
              />

              {/* Trending Section */}
              <div className="w-full mt-7 overflow-hidden">
                <TrendingSection
                  achievements={trendingAchievements}
                  profilePictureUrl={profilePictureUrl ?? undefined}
                  onShowAll={() => setIsTrendingModalOpen(true)}
                  onGuideClick={onGuideClick}
                />
              </div>
            </div>

            {/* Bottom accent */}
            <div className="mx-6 mb-5 h-px bg-gradient-to-r from-transparent via-yellow-600/25 to-transparent" />
          </div>
        </div>
      </aside>

      {isTrendingModalOpen && (
        <TrendingHistoryModal
          isOpen={isTrendingModalOpen}
          onClose={() => setIsTrendingModalOpen(false)}
          achievements={trendingAchievements}
          username={userName || "User"}
          profilePictureUrl={profilePictureUrl ?? undefined}
          onGuideClick={onGuideClick}
        />
      )}
    </>
  );
};
