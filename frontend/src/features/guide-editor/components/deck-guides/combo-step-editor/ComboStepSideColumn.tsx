import type { Card } from "@/features/archetypes/types";
import type { ChainPickerState, ComboCardType } from "../../../utils/comboStepEditorUtils";
import { SIDE_CARD_MAX_SLOTS, SIDE_CARD_VISIBLE_SLOTS } from "../../../utils/comboStepEditorUtils";
import { ComboStepCardSlot } from "./ComboStepCardSlot";

interface ComboStepSideColumnProps {
  label: string;
  stepId: string;
  cardType: Extract<ComboCardType, "sub" | "leftSub">;
  cards: Card[];
  isExpanded: boolean;
  isReadOnly: boolean;
  chainPickerOpen: ChainPickerState | null;
  onToggleExpanded: () => void;
  onOpenSearch: (anchorElement: HTMLElement, cardType: ComboCardType) => void;
  onRemoveCard: (cardIndex: number) => void;
  onToggleChainPicker: (cardIndex: number) => void;
  onUpdateChainNumber: (cardIndex: number, chainNumber: number | null) => void;
  onCloseChainPicker: () => void;
}

/**
 * Side column displaying material(left) or effect(right) cards for a combo step
 * Supports expansion to show additional slots beyond the default visible count
 * Includes chain number pickers for cards when applicable
 */
export const ComboStepSideColumn = ({
  label,
  stepId,
  cardType,
  cards,
  isExpanded,
  isReadOnly,
  chainPickerOpen,
  onToggleExpanded,
  onOpenSearch,
  onRemoveCard,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
}: ComboStepSideColumnProps) => {
  const visibleSlotIndexes = Array.from({ length: SIDE_CARD_VISIBLE_SLOTS }, (_, index) => index);
  const extraSlotIndexes = Array.from(
    { length: SIDE_CARD_MAX_SLOTS - SIDE_CARD_VISIBLE_SLOTS },
    (_, index) => index + SIDE_CARD_VISIBLE_SLOTS,
  );

  const renderSlot = (slotIndex: number) => (
    <ComboStepCardSlot
      key={slotIndex}
      card={cards[slotIndex]}
      cardType={cardType}
      isReadOnly={isReadOnly}
      isChainPickerOpen={
        chainPickerOpen?.stepId === stepId &&
        chainPickerOpen.cardType === cardType &&
        chainPickerOpen.cardIndex === slotIndex
      }
      onOpenSearch={onOpenSearch}
      onRemove={() => onRemoveCard(slotIndex)}
      onToggleChainPicker={() => onToggleChainPicker(slotIndex)}
      onUpdateChainNumber={(chainNumber) => onUpdateChainNumber(slotIndex, chainNumber)}
      onCloseChainPicker={onCloseChainPicker}
    />
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </span>

      <div className="flex flex-col gap-1 items-center max-[450px]:!min-h-[120px]" style={{ minHeight: "232px" }}>
        {visibleSlotIndexes.map(renderSlot)}

        {isExpanded && extraSlotIndexes.map(renderSlot)}

        <div className="h-6 flex items-center">
          <button
            onClick={onToggleExpanded}
            className="text-[10px] text-blue-400 hover:text-blue-300 py-0.5 px-1 bg-slate-700/50 rounded text-center w-full"
          >
            {isExpanded ? "Less" : "Show All"}
          </button>
        </div>
      </div>
    </div>
  );
};