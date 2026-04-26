import React from "react";
import { RankingModal } from "@/features/ranking/components/RankingModal";
import {
  GuideRequestFullModal,
  CreateGuideRequestModal,
} from "@/features/guide-request";
import type { User } from "@/features/auth/context/AuthContext";

interface NavbarModalsProps {
  // Ranking modal
  isRankingModalOpen: boolean;
  onCloseRankingModal: () => void;
  onRankingUserClick: (username: string, userId: string) => void;
  // Full guide requests modal
  isFullModalOpen: boolean;
  onCloseFullModal: () => void;
  currentUser: User | null;
  initialRequestId?: number | null;
  // Create guide request modal
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

/** Navbar modals for various actions */
export const NavbarModals: React.FC<NavbarModalsProps> = ({
  isRankingModalOpen,
  onCloseRankingModal,
  onRankingUserClick,
  isFullModalOpen,
  onCloseFullModal,
  currentUser,
  initialRequestId,
  isCreateModalOpen,
  onCloseCreateModal,
}) => {
  return (
    <>
      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={onCloseRankingModal}
        onUserClick={onRankingUserClick}
      />
      <GuideRequestFullModal
        isOpen={isFullModalOpen}
        onClose={onCloseFullModal}
        currentUser={currentUser}
        initialRequestId={initialRequestId}
      />
      <CreateGuideRequestModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
      />
    </>
  );
};
