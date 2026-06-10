import { ArrowRight } from "lucide-react";

interface ComboStepSeparatorProps {
  isEditMode?: boolean;
}

/**
 * Visual arrow between combo steps in the flow
 */
export const ComboStepSeparator = ({ isEditMode = false }: ComboStepSeparatorProps) => {
  return (
    <div 
      className={`flex items-center justify-center relative left-1 ${isEditMode ? 'px-2' : 'px-0.5'}`} 
      style={{ minHeight: isEditMode ? "240px" : "200px" }}
    >
      <ArrowRight className={`${isEditMode ? 'w-6 h-6' : 'w-5 h-5'} text-gray-400`} />
    </div>
  );
};
