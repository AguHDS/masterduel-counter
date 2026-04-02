import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface TooltipContextValue {
  activeTooltipId: string | null;
  setActiveTooltip: (id: string | null) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

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

export const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }
  return context;
};
