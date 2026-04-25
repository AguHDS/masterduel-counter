import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGuideRequestCounts } from "@/features/guide-request/hooks/useGuideRequests";
import type { GuideRequestCounts } from "@/features/guide-request/types/guideRequest.types";

const BADGE_KEY = "openRequestsBadgeDismissed";
const BADGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const HINT_KEY = "requestsHintLastShown";
const HINT_COOLDOWN_MS = 6 * 60 * 60 * 1000;

function isBadgeDismissed(): boolean {
  try {
    const v = localStorage.getItem(BADGE_KEY);
    return !!v && Date.now() - Number(v) < BADGE_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export interface NavbarRequestsState {
  isOpen: boolean;
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  showFullModal: boolean;
  setShowFullModal: (v: boolean) => void;
  selectedRequestId: number | null;
  setSelectedRequestId: (v: number | null) => void;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
  showHint: boolean;
  hintExiting: boolean;
  counts: GuideRequestCounts | undefined;
  showBadge: boolean;
  dismissHint: () => void;
  toggle: (e: React.MouseEvent) => void;
  toggleMobile: () => void;
}

/** Custom hook for managing navbar guide requests state */
export function useNavbarRequests(): NavbarRequestsState {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintExiting, setHintExiting] = useState(false);

  const location = useLocation();
  const { data: counts } = useGuideRequestCounts();

  const showBadge = (counts?.OPEN ?? 0) > 0 && !isBadgeDismissed() && !isOpen;

  // Show hint on home page with cooldown
  useEffect(() => {
    if (location.pathname !== "/") return;
    const last = localStorage.getItem(HINT_KEY);
    const shouldShow = !last || Date.now() - Number(last) > HINT_COOLDOWN_MS;
    if (!shouldShow) return;
    localStorage.setItem(HINT_KEY, String(Date.now()));
    const t = setTimeout(() => setShowHint(true), 800);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Auto-dismiss hint after 15 seconds
  useEffect(() => {
    if (!showHint) return;
    const exitTimer = setTimeout(() => setHintExiting(true), 15000);
    const unmountTimer = setTimeout(() => {
      setShowHint(false);
      setHintExiting(false);
    }, 15900);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [showHint]);

  // Close popup on outside click — uses data attribute to identify trigger,
  // no refs needed (GuideRequestNavbarPopup already stopPropagates mousedown)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-navbar-requests-trigger]")) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const dismissHint = () => {
    if (showHint) {
      setHintExiting(true);
      setTimeout(() => {
        setShowHint(false);
        setHintExiting(false);
      }, 900);
    }
  };

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissHint();
    try {
      localStorage.setItem(BADGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setIsOpen((prev) => !prev);
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return {
    isOpen,
    setIsOpen,
    isMobileOpen,
    showFullModal,
    setShowFullModal,
    selectedRequestId,
    setSelectedRequestId,
    showCreateModal,
    setShowCreateModal,
    showHint,
    hintExiting,
    counts,
    showBadge,
    dismissHint,
    toggle,
    toggleMobile,
  };
}
