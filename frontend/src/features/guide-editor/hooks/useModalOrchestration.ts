import { useState, useCallback } from "react";

type ActiveModalComponent =
  | "recommended-deck"
  | "initial-hands"
  | "card-pairs-handtraps"
  | "card-pairs-board-breakers"
  | "combo-steps"
  | null;

/**
 * Manages editor modal states ensuring only one modal is active at a time
 * This prevents overlapping modals which would confuse the user and cause UI issues
 */
export const useModalOrchestration = () => {
  const [activeModalComponent, setActiveModalComponent] =
    useState<ActiveModalComponent>(null);
  const [headerAnchor, setHeaderAnchor] = useState<HTMLElement | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  /**
   * Opens or closes a specific editor modal
   * Automatically closes other modals when opening a new one
   */
  const handleModalStateChange = useCallback(
    (
      component: Exclude<ActiveModalComponent, null>,
      isOpen: boolean,
    ) => {
      if (isOpen) {
        setActiveModalComponent(component);
      } else {
        setActiveModalComponent(null);
      }
    },
    [],
  );

  return {
    activeModalComponent,
    setActiveModalComponent,
    headerAnchor,
    setHeaderAnchor,
    isReportModalOpen,
    setIsReportModalOpen,
    handleModalStateChange,
  };
};

export type { ActiveModalComponent };
