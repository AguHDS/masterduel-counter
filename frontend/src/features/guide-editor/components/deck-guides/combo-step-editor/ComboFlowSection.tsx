import { useRef, useEffect } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import { ComboFlowViewer } from "./ComboFlowViewer";
import { ComboStepEditor } from "./ComboStepEditor";

interface ComboFlowSectionProps {
  selectedHandNumber: number | null;
  comboSteps: ComboStep[];
  setComboSteps: React.Dispatch<React.SetStateAction<ComboStep[]>>;
  isEditMode: boolean;
  initialHandId: string;
  onModalStateChange?: (isOpen: boolean) => void;
  forceCloseModal?: boolean;
  onResetCanceledFlow?: () => void;
}

/**
 * Wrapper component that manages combo flow display and editing
 * Switches between ComboStepEditor (edit mode) and ComboFlowViewer (view mode)
 * Handles hand ID changes and resets component state accordingly
 */
export const ComboFlowSection = ({
  selectedHandNumber,
  comboSteps,
  setComboSteps,
  isEditMode,
  initialHandId,
  onModalStateChange,
  forceCloseModal,
  onResetCanceledFlow: _onResetCanceledFlow,
}: ComboFlowSectionProps) => {
  const prevInitialHandIdRef = useRef(initialHandId);

  // Reset components when hand changes (via key prop)
  useEffect(() => {
    prevInitialHandIdRef.current = initialHandId;
  }, [initialHandId]);

  if (selectedHandNumber === null) {
    return null;
  }

  return (
    <div className="mt-8" data-combo-flow-section>
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-blue-300 max-[500px]:text-sm">Combo for</h3>
          <span className="text-lg font-bold text-yellow-200 max-[500px]:text-sm">
            Hand #{selectedHandNumber}
          </span>
        </div>
        {isEditMode && (
          <p className="text-sm text-gray-400 text-center sm:text-left max-[639px]:hidden">
            Add combo steps to demonstrate the play sequence
          </p>
        )}
      </div>

      {/* Content */}
      {isEditMode ? (
        <ComboStepEditor
          key={initialHandId}
          comboSteps={comboSteps}
          setComboSteps={setComboSteps}
          initialHandId={initialHandId}
          onModalStateChange={onModalStateChange}
          forceCloseModal={forceCloseModal}
        />
      ) : comboSteps.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400">Loading hand...</p>
        </div>
      ) : (
        <ComboFlowViewer
          key={initialHandId}
          comboSteps={comboSteps}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
};
