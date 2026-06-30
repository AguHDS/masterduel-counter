import { useState, useMemo } from "react";
import { 
  useRanking, 
  useGuideRanking,
  useTrendingUserRanking,
  useTrendingGuideRanking
} from "@/features/ranking/hooks/useRanking";
import { buildProfilePath } from "@/lib/config/urlHelpers";
import type { RankingUser, RankingGuide, TrendingRankingUser, TrendingRankingGuide } from "@/features/ranking/types/ranking.types";

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
  mobileRankingType: "all-time" | "trending";
  setMobileRankingType: (type: "all-time" | "trending") => void;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  users: RankingUser[];
  isLoading: boolean;
  guides: RankingGuide[];
  isGuidesLoading: boolean;
  trendingUsers: TrendingRankingUser[];
  isLoadingTrendingUsers: boolean;
  trendingGuides: TrendingRankingGuide[];
  isLoadingTrendingGuides: boolean;
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
  const [mobileRankingType, setMobileRankingType] = useState<"all-time" | "trending">("trending");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = useMemo(
    () => new Date().toISOString().slice(0, 7),
    []
  );

  // All-time data
  const { data: rankingData, isLoading } = useRanking(1, 50);
  const { data: guideRankingData, isLoading: isGuidesLoading } = useGuideRanking(1, 50);

  // Trending data
  const { data: trendingUserData, isLoading: isLoadingTrendingUsers } = useTrendingUserRanking(currentMonth, 1, 50);
  const { data: trendingGuideData, isLoading: isLoadingTrendingGuides } = useTrendingGuideRanking(currentMonth, 1, 50);

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
          bg: "bg-gradient-to-r from-yellow-400/25 to-amber-500/15",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-blue-600/25 to-blue-800/15",
          text: "text-blue-600",
          icon: "text-blue-600",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-amber-600/15 to-amber-800/10",
          text: "text-amber-600",
          icon: "text-amber-600",
        };
      default:
        return {
          bg: "",
          text: "text-gray-500",
          icon: "text-gray-500",
        };
    }
  };

  return {
    isOpen,
    setIsOpen,
    isMobileOpen,
    mobileTab,
    setMobileTab,
    mobileRankingType,
    setMobileRankingType,
    isModalOpen,
    setIsModalOpen,
    users: rankingData?.ranking ?? [],
    isLoading,
    guides: guideRankingData?.ranking ?? [],
    isGuidesLoading,
    trendingUsers: trendingUserData?.ranking ?? [],
    isLoadingTrendingUsers,
    trendingGuides: trendingGuideData?.ranking ?? [],
    isLoadingTrendingGuides,
    toggle,
    toggleMobile,
    handleUserClick,
    handleViewFull,
    getRankStyles,
  };
}
