import { useState } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import { PendulumStepCard } from "./PendulumStepCard";
import { NormalStepCard } from "./NormalStepCard";

interface ComboStepCardProps {
  step: ComboStep;
  stepNumber: number;
  isEditMode: boolean;
  compactMode?: boolean;
  fitToColumn?: boolean;
  hasCanceledFlow?: boolean;
  isViewingCanceledFlow?: boolean;
  onToggleCanceledFlow?: () => void;
  isContext?: boolean;
}

/** Wrapper that renders the correct step card layout (PendulumStepCard or NormalStepCard) based on step.stepType */
export const ComboStepCard = ({
  step,
  stepNumber,
  isEditMode: _isEditMode,
  compactMode = false,
  fitToColumn = false,
  hasCanceledFlow = false,
  isViewingCanceledFlow = false,
  onToggleCanceledFlow,
  isContext = false,
}: ComboStepCardProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const hasSideCards = step.leftSubCards.length > 0 || step.subCards.length > 0;
  const compactViewWidth = "clamp(150px, calc((100vw - 280px) / 2), 240px)";

  const renderDescriptionWithLineBreaks = (text: string) => {
    if (!text) return "No description";

    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`relative border-b-2 border-blue-800/20 flex flex-col ${_isEditMode ? 'p-4 pt-8' : step.stepType !== "PENDULUM" ? 'p-2 pt-[44px] max-[860px]:p-1.5 max-[860px]:pt-[24px]' : 'p-2 pt-6 max-[860px]:p-1.5 max-[860px]:pt-4'} ${
        isContext ? 'opacity-70' : ''
      } ${hasSideCards || step.stepType === "PENDULUM" ? 'max-[345px]:overflow-x-auto max-[345px]:overflow-y-hidden' : ''}`}
      style={{
        width: _isEditMode ? "370px" : fitToColumn ? "100%" : compactViewWidth,
        minWidth: _isEditMode ? "370px" : fitToColumn ? "0" : compactViewWidth,
        minHeight: _isEditMode
          ? isDescriptionExpanded
            ? "auto"
            : "520px"
          : isDescriptionExpanded
            ? "auto"
            : compactMode
              ? "250px"
              : "270px",
        height: isDescriptionExpanded ? "auto" : undefined,
        boxSizing: "border-box",
      }}
    >
      {/* Step Number Badge - Top Left */}
      <div className="absolute top-0 left-0 flex flex-col gap-1">
        <span className={`inline-block text-yellow-500 ${_isEditMode ? 'text-xs' : 'text-[11px]'} font-bold rounded-full`}>
          #{stepNumber}
        </span>
      </div>

      {/* Canceled Flow Button - Bottom Left (only for main flow steps with canceled flows) */}
      {hasCanceledFlow && onToggleCanceledFlow && (
        <button
          onClick={onToggleCanceledFlow}
          className={`absolute bottom-2 left-2 z-20 ${_isEditMode ? 'px-2 py-1' : 'px-1 py-0.5 max-[860px]:px-0.5'} ${_isEditMode ? 'text-[11px]' : 'text-[9px] max-[860px]:text-[8px]'} rounded-xl transition-colors ${
            isViewingCanceledFlow
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-red-600/80 text-white hover:bg-red-600'
          }`}
          title={isViewingCanceledFlow ? "Return to Main Flow" : "View Canceled Flow"}
        >
          {isViewingCanceledFlow ? "← Go Back" : "Negated?"}
        </button>
      )}

      {/* Layout: Left Sub Cards + Main Card + Right Sub Cards */}
      <div className={`flex items-start ${_isEditMode ? 'max-h-[200px]' : step.stepType === "PENDULUM" ? '' : 'max-h-[160px] max-[860px]:max-h-[124px]'} ${_isEditMode ? 'gap-2' : 'gap-1 max-[860px]:gap-0.5'} justify-center flex-shrink-0 ${hasSideCards ? 'max-[345px]:justify-start' : ''}`}>
        {step.stepType === "PENDULUM" ? (
          <PendulumStepCard step={step} />
        ) : (
          <NormalStepCard step={step} isEditMode={_isEditMode} />
        )}
      </div>

      {/* Description - Always centered regardless of card layout */}
      <div className={`w-full flex flex-col items-center ${!hasSideCards && step.stepType !== "PENDULUM" ? 'mt-12' : ''} ${step.stepType === "PENDULUM" ? 'mt-10' : ''} ${step.subCards.length > 0 && step.leftSubCards.length === 0 && step.stepType !== "PENDULUM" ? 'max-[860px]:translate-x-[10px]' : ''} ${step.leftSubCards.length > 0 && step.subCards.length === 0 && step.stepType !== "PENDULUM" ? 'max-[860px]:-translate-x-[6px]' : ''} ${step.subCards.length > 0 && step.leftSubCards.length > 0 && step.stepType !== "PENDULUM" ? 'max-[860px]:translate-x-[4px]' : ''}`}>
        <span className={`${_isEditMode ? 'text-xs' : 'text-[10px]'} font-semibold text-blue-400 uppercase tracking-wide`}>
          Description
        </span>
        <div
          className={`text-center py-1 px-2 text-slate-300 ${_isEditMode ? 'text-[13px]' : 'text-[11px]'} mx-auto ${isDescriptionExpanded ? 'max-h-[200px] overflow-y-auto scrollbar-homeAllPages' : 'overflow-hidden'}`}
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: "1.3em",
            maxHeight: !isDescriptionExpanded ? "4rem" : "none",
            transition: "max-height 0.3s ease-in-out",
            width: "100%",
            maxWidth: _isEditMode ? "340px" : "calc(100% - 8px)",
          }}
        >
          {renderDescriptionWithLineBreaks(step.description || "")}
        </div>
        {(step.description || "").length > 100 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className={`${_isEditMode ? 'text-xs' : 'text-[10px]'} text-blue-400 hover:text-blue-300 px-2 py-1 mt-1 flex-shrink-0`}
          >
            {isDescriptionExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
};
