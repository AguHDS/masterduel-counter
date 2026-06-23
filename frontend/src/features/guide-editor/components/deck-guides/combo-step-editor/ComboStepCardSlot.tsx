import { Plus, X } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";
import ChainOverlayImg from "@/assets/chain_new_card.webp";
import type { ComboCardType } from "../../../utils/comboStepEditorUtils";
import { ChainNumberPicker } from "./ChainNumberPicker";

interface ComboStepCardSlotProps {
  card?: Card;
  cardType: ComboCardType;
  isReadOnly: boolean;
  isChainPickerOpen: boolean;
  compact?: boolean;
  showChainPicker?: boolean;
  placeholderLabel?: string;
  onOpenSearch: (anchorElement: HTMLElement, cardType: ComboCardType) => void;
  onRemove: () => void;
  onToggleChainPicker: () => void;
  onUpdateChainNumber: (chainNumber: number | null) => void;
  onCloseChainPicker: () => void;
}

/**
 * Individual card slot within a combo step
 * Supports add/remove actions, chain number picker (main cards only), and card tooltip
 * Used in main, material (subcard-left), and effect (subcard-right) card positions
 */
export const ComboStepCardSlot = ({
  card,
  cardType,
  isReadOnly,
  isChainPickerOpen,
  compact,
  showChainPicker = true,
  placeholderLabel,
  onOpenSearch,
  onRemove,
  onToggleChainPicker,
  onUpdateChainNumber,
  onCloseChainPicker,
}: ComboStepCardSlotProps) => {
  const isMainCard = cardType === "main";

  if (!card) {
    const mainEmptyClass = compact
      ? "w-8 h-11 max-[450px]:w-7 max-[450px]:h-10 border-2 border-dashed border-blue-500 rounded flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors"
      : "w-20 h-28 max-[450px]:w-16 max-[450px]:h-24 border-2 border-dashed border-blue-500 rounded flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors";

    const sideEmptyClass = compact
      ? "w-7 h-10 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100"
      : "w-10 h-14 max-[450px]:w-7 max-[450px]:h-10 border-2 border-dashed border-slate-600 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-500/10 transition-colors opacity-50 hover:opacity-100";

    return (
      <button
        onClick={(event) => onOpenSearch(event.currentTarget, cardType)}
        className={isMainCard ? mainEmptyClass : sideEmptyClass}
        title="Add card"
      >
        <Plus className={isMainCard ? `${compact ? "w-3 h-3 mb-0.5" : "w-5 h-5 mb-1"} text-blue-400` : "w-3 h-3 text-slate-500 hover:text-blue-400"} />
        {placeholderLabel && <span className="text-[10px] text-blue-400">{placeholderLabel}</span>}
      </button>
    );
  }

  const mainImgClass = compact
    ? "w-8 h-11 max-[450px]:w-7 max-[450px]:h-10 object-cover hover:scale-105 transition-transform"
    : "w-20 h-28 max-[450px]:w-16 max-[450px]:h-24 object-cover hover:scale-105 transition-transform";

  const sideImgClass = compact
    ? "w-7 h-10 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform"
    : "w-10 h-14 max-[450px]:w-7 max-[450px]:h-10 object-cover rounded border border-gray-500/50 shadow hover:scale-110 transition-transform";

  return (
    <div className="relative group">
      <CardTooltip
        cardId={card.id}
        imageUrl={card.imageUrl || card.imageUrlSmall}
        cardName={card.name}
      >
        <img
          src={card.imageUrlSmall || card.imageUrl}
          alt={card.name}
          className={isMainCard ? mainImgClass : sideImgClass}
        />
      </CardTooltip>

      {card.chainNumber != null && (
        <img
          src={ChainOverlayImg}
          alt=""
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[1]"
        />
      )}

      {!isReadOnly && showChainPicker && (
        <ChainNumberPicker
          value={card.chainNumber}
          isOpen={isChainPickerOpen}
          variant={isMainCard ? "main" : "side"}
          onToggle={onToggleChainPicker}
          onSelect={onUpdateChainNumber}
          onClose={onCloseChainPicker}
        />
      )}

      {!isReadOnly && (
        <button
          onClick={onRemove}
          className={isMainCard
            ? "absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            : "absolute -top-1 -right-1 w-3 h-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
          }
          title="Remove card"
        >
          <X className={isMainCard ? "w-2.5 h-2.5 text-white" : "w-2 h-2 text-white"} />
        </button>
      )}
    </div>
  );
};