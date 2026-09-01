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
  hideTitle?: boolean;
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
  hideTitle = false,
}: DeckZoneSectionProps<TCard>) => {
  const zoneStyle = DECK_ZONE_STYLES[zone];
  const titleLabel = getDeckZoneLabel(zone);
  const limit = DECK_ZONE_LIMITS[zone];
  const isAddDisabled = cards.length >= limit;

  return (
    <section
      className={`rounded-sm border p-3 shadow-[0_18px_38px_rgba(2,6,23,0.32)] ${zoneStyle.panel}`}
    >
      <div
        className={`mb-3 flex flex-wrap items-center justify-between gap-3 py-2 ${zoneStyle.header}`}
      >
        {!hideTitle && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{titleLabel}</span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${zoneStyle.badge}`}
            >
              {isEditMode ? `${cards.length}/${limit}` : cards.length}
            </span>
          </div>
        )}

        {canEdit && (
          <div className="flex items-center gap-2 ml-auto">
            {extraActions}
            <button
              onClick={(event) => onAddCard?.(zone, event.currentTarget)}
              disabled={isAddDisabled}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40 ${zoneStyle.addButton}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative overflow-hidden rounded-[16px] p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.06)] ${zoneStyle.grid}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:9px_9px] opacity-15" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(248,250,252,0.72)_1px,transparent_1.3px)] bg-[size:57px_57px] opacity-15" />

        <div className="relative z-10">
        {cards.length > 0 ? (
          <div className="grid grid-cols-7 gap-px sm:grid-cols-9 lg:grid-cols-11">
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
                  className={`shadow-[0_10px_22px_rgba(2,6,23,0.35)] ${zoneStyle.cardFrame}`}
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
                      className={`h-auto max-h-24 sm:max-h-28 w-full object-contain ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
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
      </div>
    </section>
  );
};