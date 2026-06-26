import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import type { ChainPickerState, ComboCardType } from "../../../utils/comboStepEditorUtils";
import { ComboStepCardSlot } from "./ComboStepCardSlot";
import { ComboStepSideColumn } from "./ComboStepSideColumn";

interface ComboStepItemEditorProps {
  step: ComboStep;
  isReadOnly: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isMainFlowStep: boolean;
  isViewingCanceledFlow: boolean;
  hasCanceledFlow: boolean;
  isLeftExpanded: boolean;
  isRightExpanded: boolean;
  chainPickerOpen: ChainPickerState | null;
  onToggleCanceledFlow: () => void;
  onRemoveStep: () => void;
  onToggleStepType: () => void;
  onDescriptionChange: (description: string) => void;
  onToggleExpanded: (cardType: Extract<ComboCardType, "sub" | "leftSub">) => void;
  onOpenSearch: (anchorElement: HTMLElement, cardType: ComboCardType) => void;
  onRemoveCard: (cardIndex: number, cardType: ComboCardType) => void;
  onToggleChainPicker: (cardType: ComboCardType, cardIndex: number) => void;
  onUpdateChainNumber: (cardType: ComboCardType, cardIndex: number, chainNumber: number | null) => void;
  onCloseChainPicker: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * Full editable UI for one combo step in edit mode
 * Includes main card slot, side columns (materials/effects), description input, drag-and-drop handles,
 * canceled flow toggle, and delete button
 */
export const ComboStepItemEditor = ({
  step,
  isReadOnly,
  isDragging,
  isDragOver,
  isMainFlowStep,
  isViewingCanceledFlow,
  hasCanceledFlow,
  isLeftExpanded,
  isRightExpanded,
  chainPickerOpen,
  onToggleCanceledFlow,
  onRemoveStep,
  onToggleStepType,
  onDescriptionChange,
  onToggleExpanded,
  onOpenSearch,
  onRemoveCard,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: ComboStepItemEditorProps) => {
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth <= 450);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 450);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      data-step-container
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative bg-slate-800/50 border-2 rounded-lg px-4 py-8 pb-12  max-[860px]:pt-8 max-[860px]:pb-10 max-[450px]:pb-3 max-[550px]:overflow-x-scroll max-[550px]:overflow-y-hidden ${
        isReadOnly ? "border-slate-600/40 opacity-70" : "border-blue-500/40"
      } ${isDragging ? "opacity-50 scale-95" : ""} ${
        isDragOver ? "border-yellow-400 scale-105 shadow-lg shadow-yellow-400/20" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />

      {!isReadOnly && (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="absolute top-1 left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing py-2 px-4 rounded hover:bg-slate-700/30"
          style={{ touchAction: "none" }}
          title="Drag to reorder"
        >
          <div className="grid grid-cols-3 gap-[3px]">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2">
        <span className="inline-block px-2 py-0.5 text-yellow-500 text-xs font-bold rounded-full">
          #{step.stepOrder + 1}
        </span>
      </div>

      {isMainFlowStep && (hasCanceledFlow || isViewingCanceledFlow) && (
        <button
          onClick={onToggleCanceledFlow}
          className={`absolute bottom-2 left-2 px-2 py-1 text-[11px] max-[450px]:text-[9px] max-[450px]:mt-0.5 font-semibold rounded ${
            isViewingCanceledFlow
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : "bg-red-600/80 text-white hover:bg-red-600"
          }`}
          title={isViewingCanceledFlow ? "Return to Main Flow" : "View/Edit Canceled Flow"}
        >
          {isViewingCanceledFlow ? "← Go Back" : "Negated?"}
        </button>
      )}

      {!isViewingCanceledFlow && isMainFlowStep && !hasCanceledFlow && (
        <button
          onClick={onToggleCanceledFlow}
          className="absolute bottom-2 left-2 px-2 py-1 text-[11px] max-[450px]:text-[9px] max-[450px]:mt-0.5 font-semibold rounded bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
          title="Add Canceled Flow"
        >
          Canceled?
        </button>
      )}

      {!isReadOnly && (
        <button
          onClick={onRemoveStep}
          className="absolute top-2 right-2 text-red-500 hover:text-red-400"
          title="Remove step"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {!isReadOnly && (
        <button
          onClick={onToggleStepType}
          className="absolute bottom-2 right-2 px-2 py-1 text-[11px] max-[450px]:text-[9px] max-[450px]:mt-0.5 font-semibold rounded bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white"
          title="Switch to Pendulum Step"
        >
          Pendulum
        </button>
      )}

      <div className="relative z-10">
          <div className={`${isLeftExpanded || isRightExpanded ? "mb-6" : "mb-3"} ${isReadOnly ? "pointer-events-none" : ""} max-[450px]:!mb-1`}>
          <div className="flex justify-center m-auto items-center gap-3 max-[450px]:gap-1 w-fit">
          {step.mainCards.length > 0 && (
            <ComboStepSideColumn
              label="MATERIAL"
              stepId={step.id}
              cardType="leftSub"
              cards={step.leftSubCards}
              isExpanded={isLeftExpanded}
              isReadOnly={isReadOnly}
              chainPickerOpen={chainPickerOpen}
              onToggleExpanded={() => onToggleExpanded("leftSub")}
              onOpenSearch={onOpenSearch}
              onRemoveCard={(cardIndex) => onRemoveCard(cardIndex, "leftSub")}
              onToggleChainPicker={(cardIndex) => onToggleChainPicker("leftSub", cardIndex)}
              onUpdateChainNumber={(cardIndex, chainNumber) =>
                onUpdateChainNumber("leftSub", cardIndex, chainNumber)
              }
              onCloseChainPicker={onCloseChainPicker}
            />
          )}

          {step.mainCards.length > 0 && (
            <span className="text-blue-400 text-2xl font-bold self-center">=</span>
          )}

          <div className="flex gap-2 shrink-0">
            {step.mainCards.length > 0 ? (
              step.mainCards.map((card, cardIndex) => (
                <ComboStepCardSlot
                  key={`${card.id}-${cardIndex}`}
                  card={card}
                  cardType="main"
                  isReadOnly={isReadOnly}
                  isChainPickerOpen={
                    chainPickerOpen?.stepId === step.id &&
                    chainPickerOpen.cardType === "main" &&
                    chainPickerOpen.cardIndex === cardIndex
                  }
                  placeholderLabel="Main"
                  onOpenSearch={onOpenSearch}
                  onRemove={() => onRemoveCard(cardIndex, "main")}
                  onToggleChainPicker={() => onToggleChainPicker("main", cardIndex)}
                  onUpdateChainNumber={(chainNumber) =>
                    onUpdateChainNumber("main", cardIndex, chainNumber)
                  }
                  onCloseChainPicker={onCloseChainPicker}
                />
              ))
            ) : (
              <ComboStepCardSlot
                cardType="main"
                isReadOnly={isReadOnly}
                isChainPickerOpen={false}
                placeholderLabel="Main"
                onOpenSearch={onOpenSearch}
                onRemove={() => undefined}
                onToggleChainPicker={() => undefined}
                onUpdateChainNumber={() => undefined}
                onCloseChainPicker={() => undefined}
              />
            )}
          </div>

          {step.mainCards.length > 0 && (
            <span className="text-blue-400 text-2xl font-bold self-center">+</span>
          )}

          {step.mainCards.length > 0 && (
            <ComboStepSideColumn
              label="EFFECT"
              stepId={step.id}
              cardType="sub"
              cards={step.subCards}
              isExpanded={isRightExpanded}
              isReadOnly={isReadOnly}
              chainPickerOpen={chainPickerOpen}
              onToggleExpanded={() => onToggleExpanded("sub")}
              onOpenSearch={onOpenSearch}
              onRemoveCard={(cardIndex) => onRemoveCard(cardIndex, "sub")}
              onToggleChainPicker={(cardIndex) => onToggleChainPicker("sub", cardIndex)}
              onUpdateChainNumber={(cardIndex, chainNumber) =>
                onUpdateChainNumber("sub", cardIndex, chainNumber)
              }
              onCloseChainPicker={onCloseChainPicker}
            />
          )}
          </div>
        </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="text-blue-400 font-semibold text-xs mb-2 text-nowrap">
            Description (Optional)
          </label>
          <textarea
            value={step.description || ""}
            onChange={(event) => onDescriptionChange(event.target.value)}
            maxLength={500}
            disabled={isReadOnly}
            placeholder={isNarrow ? "Describe this step (Max. 500)" : "Describe this step (Max. 500 characters)..."}
            className={`w-full max-w-[280px] px-2 py-1.5 text-white text-xs rounded border focus:outline-none resize-y min-h-[60px] max-[450px]:min-h-[40px] scrollbar-homeAllPages mx-auto ${
              isReadOnly
                ? "bg-slate-800/50 border-slate-700 cursor-not-allowed"
                : "bg-slate-700/50 border-slate-600 focus:border-blue-500"
            }`}
            rows={3}
          />
          <div className="text-xs text-slate-400 max-[450px]:mb-5 text-right w-full max-w-[280px]">
            {(step.description || "").length}/500
          </div>
        </div>

    </div>
  );
};
