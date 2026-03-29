import type { ComboStep } from "@/features/archetypes/types";
import { ComboStepCard } from "./ComboStepCard";
import { ComboStepSeparator } from "./ComboStepSeparator";

interface ComboFlowViewerProps {
  comboSteps: ComboStep[];
  isEditMode: boolean;
}

export const ComboFlowViewer = ({ comboSteps, isEditMode }: ComboFlowViewerProps) => {
  if (!comboSteps || comboSteps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No combo steps were defined in this guide.
      </div>
    );
  }

  // Sort steps by stepOrder
  const sortedSteps = [...comboSteps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="border-y-2 border-blue-500/30 p-4 bg-slate-900/40">
      <div className="flex flex-wrap items-center gap-0">
        {sortedSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <ComboStepCard 
              step={step} 
              stepNumber={index + 1} 
              isEditMode={isEditMode} 
            />
            {index < sortedSteps.length - 1 && <ComboStepSeparator />}
          </div>
        ))}
      </div>
    </div>
  );
};
