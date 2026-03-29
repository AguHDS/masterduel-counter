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
}

export const ComboFlowSection = ({
  selectedHandNumber,
  comboSteps,
  setComboSteps,
  isEditMode,
  initialHandId,
  onModalStateChange,
  forceCloseModal,
}: ComboFlowSectionProps) => {
  if (selectedHandNumber === null) {
    return null;
  }

  return (
    <div className="mt-8" data-combo-flow-section>
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-blue-300 text-center">
          Combo for Hand #{selectedHandNumber}
        </h3>
        {isEditMode && (
          <p className="text-sm text-gray-400 text-center mt-1">
            Add combo steps to demonstrate the play sequence
          </p>
        )}
      </div>

      {/* Content */}
      {isEditMode ? (
        <ComboStepEditor
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
        <ComboFlowViewer comboSteps={comboSteps} isEditMode={isEditMode} />
      )}
    </div>
  );
};
