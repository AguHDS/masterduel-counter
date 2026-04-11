import { createContext } from 'react';

export interface TooltipContextValue {
  activeTooltipId: string | null;
  setActiveTooltip: (id: string | null) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);