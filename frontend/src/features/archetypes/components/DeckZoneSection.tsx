import type { DragEvent, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { CardTooltip } from "./CardTooltip";
import {
  DECK_ZONE_LIMITS,
  DECK_ZONE_STYLES,
  getDeckZoneLabel,
  type DeckDisplayZone,
} from "../utils/deckZonePresentation";

interface DeckRenderableCard {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
}

interface DeckZoneSectionProps<TCard extends DeckRenderableCard> {
  zone: DeckDisplayZone;
  cards: TCard[];
  isEditMode: boolean;
  canEdit?: boolean;
  emptyMessage: string;
  cardKey: (card: TCard, index: number) => string;
  onAddCard?: (zone: DeckDisplayZone, anchor: HTMLElement) => void;
  onRemoveCard?: (zone: DeckDisplayZone, index: number) => void;
  onDragStart?: (zone: DeckDisplayZone, index: number) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (zone: DeckDisplayZone, index: number) => void;
  onDragEnd?: () => void;
  draggedCardActive?: boolean;
  extraActions?: ReactNode;
}

export const DeckZoneSection = <TCard extends DeckRenderableCard>({
  zone,
  cards,
  isEditMode,
  canEdit = false,
  emptyMessage,
  cardKey,
  onAddCard,
  onRemoveCard,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedCardActive = false,
  extraActions,
}: DeckZoneSectionProps<TCard>) => {
  const zoneStyle = DECK_ZONE_STYLES[zone];
  const titleLabel = getDeckZoneLabel(zone);
  const limit = DECK_ZONE_LIMITS[zone];
  const isAddDisabled = cards.length >= limit;

  return (
    <section
      className={`rounded-[22px] border p-4 shadow-[0_18px_38px_rgba(2,6,23,0.32)] ${zoneStyle.panel}`}
    >
      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-3  py-3 ${zoneStyle.header}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-white">{titleLabel}</span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${zoneStyle.badge}`}
          >
            {isEditMode ? `${cards.length}/${limit}` : cards.length}
          </span>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {extraActions}
            <button
              onClick={(event) => onAddCard?.(zone, event.currentTarget)}
              disabled={isAddDisabled}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]  disabled:cursor-not-allowed disabled:opacity-40 ${zoneStyle.addButton}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>
          </div>
        )}
      </div>

      <div
        className={`rounded-[18px] border p-2 shadow-[inset_0_1px_0_rgba(148,163,184,0.06)] ${zoneStyle.grid}`}
      >
        {cards.length > 0 ? (
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-10">
            {cards.map((card, index) => (
              <div
                key={cardKey(card, index)}
                className="group/card relative"
                draggable={canEdit}
                onDragStart={() => canEdit && onDragStart?.(zone, index)}
                onDragOver={onDragOver}
                onDrop={() => canEdit && onDrop?.(zone, index)}
                onDragEnd={onDragEnd}
              >
                <div
                  className={`rounded-[13px] border bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-[#130f25] p-1 shadow-[0_10px_22px_rgba(2,6,23,0.35)]  ${zoneStyle.cardFrame}`}
                >
                  <CardTooltip
                    cardId={card.id}
                    imageUrl={card.imageUrl}
                    cardName={card.name}
                    disabled={draggedCardActive}
                  >
                    <img
                      src={card.imageUrlSmall}
                      alt={card.name}
                      className={`h-auto w-full rounded-[10px] object-contain ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                    />
                  </CardTooltip>
                </div>
                {canEdit && onRemoveCard && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveCard(zone, index);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 shadow-lg  group-hover/card:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={(event) => canEdit && onAddCard?.(zone, event.currentTarget)}
            disabled={!canEdit}
            className={`flex min-h-[108px] w-full flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-700/70 bg-slate-950/30 px-4 text-center  ${canEdit ? "hover:border-slate-500/70 hover:bg-slate-950/45" : "cursor-default"}`}
          >
            {canEdit && <Plus className={`mb-2 h-5 w-5 ${zoneStyle.label}`} />}
            <span className="text-sm text-slate-300">{emptyMessage}</span>
          </button>
        )}
      </div>
    </section>
  );
};