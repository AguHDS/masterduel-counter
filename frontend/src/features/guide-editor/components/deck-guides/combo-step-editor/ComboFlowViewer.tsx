import { useEffect, useState } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import { ComboStepCard } from "./ComboStepCard";
import { ComboStepSeparator } from "./ComboStepSeparator";

interface ComboFlowViewerProps {
  comboSteps: ComboStep[];
  isEditMode: boolean;
}

/**
 * Read-only viewer for displaying combo steps in a responsive grid/flow layout
 * Adjusts column count based on viewport width and shows canceled flow branches when toggled
 * Used in view mode to display completed combos
 */
export const ComboFlowViewer = ({ comboSteps, isEditMode }: ComboFlowViewerProps) => {
  const [activeCanceledStepId, setActiveCanceledStepId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // For responsive design
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const forcedColumns =
    viewportWidth <= 550
      ? 1
      : viewportWidth <= 860
        ? 2
        : viewportWidth >= 1040 && viewportWidth <= 1187
          ? 3
          : viewportWidth >= 1396 && viewportWidth <= 1548
            ? 4
            : null;
  const isCompactFlow = viewportWidth <= 860;
  const isForcedGrid = forcedColumns !== null;

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

        <div
          className={`relative z-10 gap-2 sm:gap-5 ${isForcedGrid ? "grid" : "flex flex-wrap sm:ml-6"}`}
          style={{
            gridTemplateColumns: forcedColumns
              ? `repeat(${forcedColumns}, minmax(0, 1fr))`
              : undefined,
          }}
        >
        {sortedSteps.map((step, index) => {
          const isMainFlowStep = !step.parentCanceledStepId;
          const isContext = !!(activeCanceledStepId && isMainFlowStep);
          
          return (
            <div
              key={step.id}
              className="flex items-start min-w-0"
              style={{ width: isCompactFlow ? "100%" : undefined }}
            >
              <ComboStepCard 
                step={step} 
                stepNumber={index + 1} 
                isEditMode={isEditMode}
                compactMode={isCompactFlow}
                fitToColumn={isForcedGrid}
                hasCanceledFlow={stepHasCanceledFlow(step.id)}
                isViewingCanceledFlow={activeCanceledStepId === step.id}
                onToggleCanceledFlow={() => handleToggleCanceledFlow(step.id)}
                isContext={isContext}
              />
              {index < sortedSteps.length - 1 && (
                <div className={isForcedGrid ? "hidden" : ""}>
                  <ComboStepSeparator isEditMode={isEditMode} />
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
