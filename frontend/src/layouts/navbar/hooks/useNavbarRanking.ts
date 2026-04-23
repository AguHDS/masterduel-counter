import { useState } from "react";
import { useRanking, useGuideRanking } from "@/features/ranking/hooks/useRanking";
import { buildProfilePath } from "@/lib/config/urlHelpers";
import type { RankingUser, RankingGuide } from "@/features/ranking/types/ranking.types";

interface RankStyles {
  bg: string;
  text: string;
  icon: string;
}

export interface NavbarRankingState {
  isOpen: boolean;
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  mobileTab: "guides" | "users";
  setMobileTab: (tab: "guides" | "users") => void;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  users: RankingUser[];
  isLoading: boolean;
  guides: RankingGuide[];
  isGuidesLoading: boolean;
  toggle: (e: React.MouseEvent) => void;
  toggleMobile: () => void;
  handleUserClick: (username: string, userId: string) => void;
  handleViewFull: () => void;
  getRankStyles: (rank: number) => RankStyles;
}

/** Custom hook for managing navbar ranking state */
export function useNavbarRanking(): NavbarRankingState {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"guides" | "users">("guides");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rankingData, isLoading } = useRanking(1, 50);
  const { data: guideRankingData, isLoading: isGuidesLoading } = useGuideRanking(1, 50);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleUserClick = (username: string, userId: string) => {
    window.location.href = buildProfilePath({ userName: username, userId });
    setIsOpen(false);
    setIsMobileOpen(false);
    setIsModalOpen(false);
  };

  const handleViewFull = () => {
    setIsOpen(false);
    setIsMobileOpen(false);
    setIsModalOpen(true);
  };

  const getRankStyles = (rank: number): RankStyles => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-500/20 to-amber-600/20",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-purple-700/40 to-blue-500/20",
          text: "text-gray-300",
          icon: "text-gray-400",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-yellow-700/20 to-amber-800/50",
          text: "text-amber-600",
          icon: "text-amber-700",
        };
      default:
        return {
          bg: "bg-blue-950/30",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
    }
  };

  return {
    isOpen,
    setIsOpen,
    isMobileOpen,
    mobileTab,
    setMobileTab,
    isModalOpen,
    setIsModalOpen,
    users: rankingData?.ranking ?? [],
    isLoading,
    guides: guideRankingData?.ranking ?? [],
    isGuidesLoading,
    toggle,
    toggleMobile,
    handleUserClick,
    handleViewFull,
    getRankStyles,
  };
}
