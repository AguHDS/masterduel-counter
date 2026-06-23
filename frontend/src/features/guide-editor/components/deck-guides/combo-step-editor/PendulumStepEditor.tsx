import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { ComboStep } from "@/features/archetypes/types";
import type {
  ChainPickerState,
  ComboCardType,
} from "../../../utils/comboStepEditorUtils";
import { ComboStepCardSlot } from "./ComboStepCardSlot";
import type { Card } from "@/features/archetypes/types";

interface PendulumStepEditorProps {
  step: ComboStep;
  isReadOnly: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  chainPickerOpen: ChainPickerState | null;
  onToggleStepType: () => void;
  onRemoveStep: () => void;
  onDescriptionChange: (description: string) => void;
  onOpenSearch: (anchorElement: HTMLElement, cardType: ComboCardType) => void;
  onRemoveCard: (cardIndex: number, cardType: ComboCardType) => void;
  onToggleChainPicker: (cardType: ComboCardType, cardIndex: number) => void;
  onUpdateChainNumber: (
    cardType: ComboCardType,
    cardIndex: number,
    chainNumber: number | null,
  ) => void;
  onCloseChainPicker: () => void;
  onUpdateScaleValue: (side: "left" | "right", value: number | null) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

function ScalePicker({
  value,
  onChange,
  color,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  color: "blue" | "red";
}) {
  const textColor = color === "blue" ? "text-blue-400" : "text-red-400";
  const borderColor =
    color === "blue" ? "border-blue-500/50" : "border-red-500/50";
  const bgColor = color === "blue" ? "bg-blue-900/20" : "bg-red-900/20";

  return (
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value ? parseInt(e.target.value) : null)
      }
      className={`text-[11px] ${bgColor} ${borderColor} border ${textColor} bg-black rounded px-1 py-0.5 outline-none mt-1`}
    >
      {Array.from({ length: 16 }, (_, i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </select>
  );
}

function ScaleSlot({
  card,
  cardType,
  stepId,
  cardIndex,
  isReadOnly,
  chainPickerOpen,
  onOpenSearch,
  onRemoveCard,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
}: {
  card: Card | null;
  cardType: ComboCardType;
  stepId: string;
  cardIndex: number;
  isReadOnly: boolean;
  chainPickerOpen: ChainPickerState | null;
  onOpenSearch: (el: HTMLElement, ct: ComboCardType) => void;
  onRemoveCard: (ci: number, ct: ComboCardType) => void;
  onToggleChainPicker: (ct: ComboCardType, ci: number) => void;
  onUpdateChainNumber: (
    ct: ComboCardType,
    ci: number,
    cn: number | null,
  ) => void;
  onCloseChainPicker: () => void;
}) {

  return (
    <div className="relative">
      {card ? (
        <ComboStepCardSlot
          key={`${card.id}-${cardIndex}`}
          card={card}
          cardType={cardType}
          isReadOnly={isReadOnly}
          compact
          showChainPicker={false}
          isChainPickerOpen={
            chainPickerOpen?.stepId === stepId &&
            chainPickerOpen.cardType === cardType &&
            chainPickerOpen.cardIndex === cardIndex
          }
          placeholderLabel=""
          onOpenSearch={onOpenSearch}
          onRemove={() => onRemoveCard(cardIndex, cardType)}
          onToggleChainPicker={() => onToggleChainPicker(cardType, cardIndex)}
          onUpdateChainNumber={(cn) =>
            onUpdateChainNumber(cardType, cardIndex, cn)
          }
          onCloseChainPicker={onCloseChainPicker}
        />
      ) : (
        <ComboStepCardSlot
          cardType={cardType}
          isReadOnly={isReadOnly}
          compact
          showChainPicker={false}
          isChainPickerOpen={false}
          placeholderLabel=""
          onOpenSearch={onOpenSearch}
          onRemove={() => undefined}
          onToggleChainPicker={() => undefined}
          onUpdateChainNumber={() => undefined}
          onCloseChainPicker={() => undefined}
        />
      )}
    </div>
  );
}

/** Editor UI for a pendulum-themed combo step with scale card slots, scale picker and a 6-card grid */
export const PendulumStepEditor = ({
  step,
  isReadOnly,
  isDragging,
  isDragOver,
  chainPickerOpen,
  onToggleStepType,
  onRemoveStep,
  onDescriptionChange,
  onOpenSearch,
  onRemoveCard,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
  onUpdateScaleValue,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: PendulumStepEditorProps) => {
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth <= 450);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 450);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scaleSlotProps = {
    stepId: step.id,
    isReadOnly,
    chainPickerOpen,
    onOpenSearch,
    onRemoveCard,
    onToggleChainPicker,
    onUpdateChainNumber,
    onCloseChainPicker,
  };

  return (
    <div
      data-step-container
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative bg-slate-800/50 border-2 rounded-lg px-4 max-[420px]:px-0 py-8 pb-12 max-[860px]:pt-8 max-[860px]:pb-10 max-[450px]:pb-3 max-[550px]:overflow-x-scroll max-[550px]:overflow-y-hidden ${
        isReadOnly ? "border-slate-600/40 opacity-70" : "border-violet-500/40"
      } ${isDragging ? "opacity-50 scale-95" : ""} ${
        isDragOver
          ? "border-yellow-400 scale-105 shadow-lg shadow-yellow-400/20"
          : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />

      {!isReadOnly && (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="absolute top-1 left-1/2 transform -translate-x-1/2 cursor-grab active:cursor-grabbing py-1 px-3 rounded hover:bg-slate-700/30"
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
        <span className="inline-block px-2 py-0.5 text-violet-400 text-xs font-bold rounded-full">
          #{step.stepOrder + 1}
        </span>
      </div>

      {!isReadOnly && (
        <button
          onClick={onRemoveStep}
          className="absolute top-2 right-2 text-red-500 hover:text-red-400"
          title="Remove step"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Pendulum toggle button */}
      {!isReadOnly && (
        <button
          onClick={onToggleStepType}
          className="absolute bottom-2 right-2 max-[450px]:left-2 max-[450px]:right-auto max-[450px]:py-0.5 max-[450px]:text-[9px] max-[450px]:mt-0.5 px-2 py-1 text-[11px] font-semibold rounded bg-violet-600/80 text-white hover:bg-violet-600"
          title="Switch to Normal Step"
        >
          Pend summon
        </button>
      )}

      <div className="relative z-10">
        <div className="mb-[87px]">
          <div className="flex justify-between items-center gap-1.5 max-[450px]:gap-0.5 w-full mt-4 pt-10 min-h-[160px]">
            {/* LEFT SCALE */}
            <div className="flex flex-col items-center gap-1 mt-2.5 min-w-[36px]">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                SCALE
              </span>
              <ScaleSlot
                card={step.subCards[0] || null}
                cardType="sub"
                cardIndex={0}
                {...scaleSlotProps}
              />
              <ScalePicker
                value={step.rightScaleValue ?? null}
                onChange={(v) => onUpdateScaleValue("right", v)}
                color="red"
              />
            </div>

            {/* CENTER 6 SLOTS */}
            <div className="grid grid-cols-3 max-[500px]:grid-cols-2 gap-0.5 min-[585px]:gap-1 min-[1300px]:gap-1.5">
              {Array.from({ length: 6 }, (_, i) => {
                const card = step.mainCards[i] || null;
                return card ? (
                  <div key={`center-${i}`} className="relative min-[650px]:scale-110 min-[1300px]:scale-125 origin-center transition-transform">
                    <ComboStepCardSlot
                      card={card}
                      cardType="main"
                      isReadOnly={isReadOnly}
                      compact
                      showChainPicker={false}
                      isChainPickerOpen={
                        chainPickerOpen?.stepId === step.id &&
                        chainPickerOpen.cardType === "main" &&
                        chainPickerOpen.cardIndex === i
                      }
                      placeholderLabel=""
                      onOpenSearch={onOpenSearch}
                      onRemove={() => onRemoveCard(i, "main")}
                      onToggleChainPicker={() => onToggleChainPicker("main", i)}
                      onUpdateChainNumber={(cn) =>
                        onUpdateChainNumber("main", i, cn)
                      }
                      onCloseChainPicker={onCloseChainPicker}
                    />
                  </div>
                ) : (
                  <div key={`center-${i}`} className="min-[650px]:scale-110 min-[1300px]:scale-125 origin-center transition-transform">
                  <ComboStepCardSlot
                    key={`center-${i}`}
                    cardType="main"
                    isReadOnly={isReadOnly}
                    compact
                    showChainPicker={false}
                    isChainPickerOpen={false}
                    placeholderLabel=""
                    onOpenSearch={onOpenSearch}
                    onRemove={() => undefined}
                    onToggleChainPicker={() => undefined}
                    onUpdateChainNumber={() => undefined}
                    onCloseChainPicker={() => undefined}
                  />
                  </div>
                );
              })}
            </div>

            {/* RIGHT SCALE */}
            <div className="flex flex-col items-center gap-1 mt-2.5 min-w-[36px]">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                SCALE
              </span>
              <ScaleSlot
                card={step.leftSubCards[0] || null}
                cardType="leftSub"
                cardIndex={0}
                {...scaleSlotProps}
              />
              <ScalePicker
                value={step.leftScaleValue ?? null}
                onChange={(v) => onUpdateScaleValue("left", v)}
                color="blue"
              />
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
          <div className="text-xs text-slate-400 mt-0.5 text-right w-full max-w-[280px]">
            {(step.description || "").length}/500
          </div>
        </div>
      </div>
    </div>
  );
};
