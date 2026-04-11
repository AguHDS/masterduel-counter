import { useState, useCallback, type ReactNode } from 'react';
import { TooltipContext } from './TooltipContextBase';

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setActiveTooltip = useCallback((id: string | null) => {
    setActiveTooltipId(id);
  }, []);

  const setModalOpen = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (open) {
      // Close any active tooltip when modal opens
      setActiveTooltipId(null);
    }
  }, []);

  return (
    <TooltipContext.Provider
      value={{ activeTooltipId, setActiveTooltip, isModalOpen, setModalOpen }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

