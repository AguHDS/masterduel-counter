import { useContext } from 'react';
import { TooltipContext } from '../contexts/TooltipContextBase';

export const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }
  return context;
};

export const useOptionalTooltipContext = () => useContext(TooltipContext);