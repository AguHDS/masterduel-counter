import { useState } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import { ComboStepCard } from "./ComboStepCard";
import { ComboStepSeparator } from "./ComboStepSeparator";

interface ComboFlowViewerProps {
  comboSteps: ComboStep[];
  isEditMode: boolean;
}

export const ComboFlowViewer = ({ comboSteps, isEditMode }: ComboFlowViewerProps) => {
  const [activeCanceledStepId, setActiveCanceledStepId] = useState<string | null>(null);

  if (!comboSteps || comboSteps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No combo steps were defined in this guide.
      </div>
    );
  }

  // Get visible steps based on active canceled flow
  const getVisibleSteps = (): ComboStep[] => {
    const mainFlowSteps = comboSteps.filter(s => !s.parentCanceledStepId);
    
    if (activeCanceledStepId) {
      // Find the index of the canceled step in main flow
      const canceledStepIndex = mainFlowSteps.findIndex(s => s.id === activeCanceledStepId);
      
      // Show main flow steps UP TO and INCLUDING the canceled step
      const stepsBeforeCanceled = mainFlowSteps.slice(0, canceledStepIndex + 1);
      
      // Show the canceled alternative steps for this step
      const canceledSteps = comboSteps.filter(s => s.parentCanceledStepId === activeCanceledStepId);
      
      return [...stepsBeforeCanceled, ...canceledSteps];
    }
    return mainFlowSteps;
  };

  const stepHasCanceledFlow = (stepId: string): boolean => {
    return comboSteps.some(s => s.parentCanceledStepId === stepId);
  };

  const handleToggleCanceledFlow = (stepId: string) => {
    if (activeCanceledStepId === stepId) {
      setActiveCanceledStepId(null);
    } else {
      setActiveCanceledStepId(stepId);
    }
  };

  // Sort steps: main flow first (by stepOrder), then canceled flow (by stepOrder)
  const sortedSteps = [...getVisibleSteps()].sort((a, b) => {
    // If one has parent and the other doesn't, main flow comes first
    const aIsMainFlow = !a.parentCanceledStepId;
    const bIsMainFlow = !b.parentCanceledStepId;
    
    if (aIsMainFlow && !bIsMainFlow) return -1;
    if (!aIsMainFlow && bIsMainFlow) return 1;
    
    // Both are same type (both main or both canceled), sort by stepOrder
    return a.stepOrder - b.stepOrder;
  });

  return (
    <div className="border-y-2 border-blue-500/30 bg-slate-900/40 p-4">
      <div className="relative overflow-hidden rounded-[18px] border border-blue-500/20 bg-slate-950/20 px-3 py-4 sm:px-4">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.21)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />

        <div className="relative z-10 ml-3 flex flex-wrap items-start gap-5 sm:ml-6">
        {sortedSteps.map((step, index) => {
          const isMainFlowStep = !step.parentCanceledStepId;
          const isContext = !!(activeCanceledStepId && isMainFlowStep);
          
          return (
            <div key={step.id} className="flex items-start">
              <ComboStepCard 
                step={step} 
                stepNumber={index + 1} 
                isEditMode={isEditMode}
                hasCanceledFlow={stepHasCanceledFlow(step.id)}
                isViewingCanceledFlow={activeCanceledStepId === step.id}
                onToggleCanceledFlow={() => handleToggleCanceledFlow(step.id)}
                isContext={isContext}
              />
              {index < sortedSteps.length - 1 && <ComboStepSeparator isEditMode={isEditMode} />}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
