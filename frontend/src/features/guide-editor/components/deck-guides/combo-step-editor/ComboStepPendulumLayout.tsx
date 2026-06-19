import { ComboStepCardSlot } from "./ComboStepCardSlot";
import type { ComboStep, Card } from "@/features/archetypes/types";
import type { ChainPickerState } from "@/features/guide-editor/utils/comboStepEditorUtils"

type ComboCardType = "main" | "sub" | "leftSub";

interface ComboStepPendulumLayoutProps {
  step: ComboStep;
  isReadOnly: boolean;
  chainPickerOpen: ChainPickerState | null;
  onOpenSearch: (anchorElement: HTMLElement, cardType: ComboCardType) => void;
  onRemoveCard: (cardIndex: number, cardType: ComboCardType) => void;
  onToggleChainPicker: (cardType: ComboCardType, cardIndex: number) => void;
  onUpdateChainNumber: (cardType: ComboCardType, cardIndex: number, chainNumber: number | null) => void;
  onCloseChainPicker: () => void;
  onUpdateScaleValue: (side: "left" | "right", value: number | null) => void;
}

function ScalePicker({ value, onChange, color }: { value: number | null; onChange: (v: number | null) => void; color: "blue" | "red" }) {
  const textColor = color === "blue" ? "text-blue-400" : "text-red-400";
  const borderColor = color === "blue" ? "border-blue-500/50" : "border-red-500/50";
  const bgColor = color === "blue" ? "bg-blue-900/20" : "bg-red-900/20";

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className={`text-[10px] font-semibold ${textColor}`}>Scale</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className={`text-[11px] ${bgColor} ${borderColor} border ${textColor} rounded px-1 py-0.5 outline-none`}
      >
        <option value="">-</option>
        {Array.from({ length: 16 }, (_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
    </div>
  );
}

export const ComboStepPendulumLayout = ({
  step,
  isReadOnly,
  chainPickerOpen,
  onOpenSearch,
  onRemoveCard,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
  onUpdateScaleValue,
}: ComboStepPendulumLayoutProps) => {
  const mainCards = step.mainCards;
  const mainSlots = mainCards.length > 0 ? mainCards : Array(6).fill(null);

  return (
    <div className={`flex justify-center m-auto items-start gap-2 max-[450px]:gap-1 w-fit ${isReadOnly ? "pointer-events-none" : ""}`}>
      {/* LEFT SCALE */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">SCALE</span>
        <div className="flex flex-col items-center gap-1">
          {step.subCards.length > 0 ? (
            step.subCards.map((card, cardIndex) => (
              <ComboStepCardSlot
                key={`${card.id}-${cardIndex}`}
                card={card}
                cardType="sub"
                isReadOnly={isReadOnly}
                isChainPickerOpen={chainPickerOpen?.stepId === step.id && chainPickerOpen.cardType === "sub" && chainPickerOpen.cardIndex === cardIndex}
                placeholderLabel=""
                onOpenSearch={onOpenSearch}
                onRemove={() => onRemoveCard(cardIndex, "sub")}
                onToggleChainPicker={() => onToggleChainPicker("sub", cardIndex)}
                onUpdateChainNumber={(cn) => onUpdateChainNumber("sub", cardIndex, cn)}
                onCloseChainPicker={onCloseChainPicker}
              />
            ))
          ) : (
            <ComboStepCardSlot
              cardType="sub"
              isReadOnly={isReadOnly}
              isChainPickerOpen={false}
              placeholderLabel=""
              onOpenSearch={onOpenSearch}
              onRemove={() => undefined}
              onToggleChainPicker={() => undefined}
              onUpdateChainNumber={() => undefined}
              onCloseChainPicker={() => undefined}
            />
          )}
          <ScalePicker value={step.rightScaleValue ?? null} onChange={(v) => onUpdateScaleValue("right", v)} color="red" />
        </div>
      </div>

      {/* CENTER 6 SLOTS — 3x2 grid, responsive max 2 before wrap */}
      <div className="grid grid-cols-3 max-[500px]:grid-cols-2 gap-1">
        {mainSlots.slice(0, 6).map((card, i) =>
          card ? (
            <ComboStepCardSlot
              key={`center-${i}`}
              card={card as Card}
              cardType="main"
              isReadOnly={isReadOnly}
              isChainPickerOpen={chainPickerOpen?.stepId === step.id && chainPickerOpen.cardType === "main" && chainPickerOpen.cardIndex === i}
              placeholderLabel=""
              onOpenSearch={onOpenSearch}
              onRemove={() => onRemoveCard(i, "main")}
              onToggleChainPicker={() => onToggleChainPicker("main", i)}
              onUpdateChainNumber={(cn) => onUpdateChainNumber("main", i, cn)}
              onCloseChainPicker={onCloseChainPicker}
            />
          ) : (
            <ComboStepCardSlot
              key={`center-${i}`}
              cardType="main"
              isReadOnly={isReadOnly}
              isChainPickerOpen={false}
              placeholderLabel=""
              onOpenSearch={onOpenSearch}
              onRemove={() => undefined}
              onToggleChainPicker={() => undefined}
              onUpdateChainNumber={() => undefined}
              onCloseChainPicker={() => undefined}
            />
          )
        )}
      </div>

      {/* RIGHT SCALE */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">SCALE</span>
        <div className="flex flex-col items-center gap-1">
          {step.leftSubCards.length > 0 ? (
            step.leftSubCards.map((card, cardIndex) => (
              <ComboStepCardSlot
                key={`${card.id}-${cardIndex}`}
                card={card}
                cardType="leftSub"
                isReadOnly={isReadOnly}
                isChainPickerOpen={chainPickerOpen?.stepId === step.id && chainPickerOpen.cardType === "leftSub" && chainPickerOpen.cardIndex === cardIndex}
                placeholderLabel=""
                onOpenSearch={onOpenSearch}
                onRemove={() => onRemoveCard(cardIndex, "leftSub")}
                onToggleChainPicker={() => onToggleChainPicker("leftSub", cardIndex)}
                onUpdateChainNumber={(cn) => onUpdateChainNumber("leftSub", cardIndex, cn)}
                onCloseChainPicker={onCloseChainPicker}
              />
            ))
          ) : (
            <ComboStepCardSlot
              cardType="leftSub"
              isReadOnly={isReadOnly}
              isChainPickerOpen={false}
              placeholderLabel=""
              onOpenSearch={onOpenSearch}
              onRemove={() => undefined}
              onToggleChainPicker={() => undefined}
              onUpdateChainNumber={() => undefined}
              onCloseChainPicker={() => undefined}
            />
          )}
          <ScalePicker value={step.leftScaleValue ?? null} onChange={(v) => onUpdateScaleValue("left", v)} color="blue" />
        </div>
      </div>
    </div>
  );
};
