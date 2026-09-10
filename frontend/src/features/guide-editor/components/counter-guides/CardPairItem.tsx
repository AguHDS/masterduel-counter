import { X, Plus, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";
import { useCardPairDragDrop } from "@/features/guide-editor/hooks/counter-guides/useCardPairDragDrop";
import { useState, useRef, useEffect } from "react";
import { CardPairCommentSection } from "./CardPairCommentSection";

interface BottomCard extends Card {
  effectiveness?: string;
}

interface CardPairItemProps {
  pairNumber: number;
  pairId: string;
  topCards: Card[];
  bottomCards: BottomCard[];
  comment?: string;
  onSelectTop: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onSelectBottom: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveTopCard: (index: number) => void;
  onRemoveBottomCard: (index: number) => void;
  onReorderTopCards?: (oldIndex: number, newIndex: number) => void;
  onReorderBottomCards?: (oldIndex: number, newIndex: number) => void;
  onMoveCardToTop?: (cardIndex: number, targetIndex: number) => void;
  onMoveCardToBottom?: (cardIndex: number, targetIndex: number) => void;
  onBottomCardEffectivenessChange: (cardIndex: number, value: string) => void;
  onCommentChange: (value: string) => void;
  onRemove: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  isEditMode: boolean;
}

/**
 * Individual card pair item displaying top and bottom cards
 * In edit mode, supports adding/removing cards, effectiveness ratings, comments, and reordering card pairs
 */
const EFFECTIVENESS_OPTIONS = [
  { value: "", label: "None", color: "text-slate-400" },
  { value: "BAD", label: "BAD", color: "text-red-500" },
  { value: "MEDIUM", label: "MEDIUM", color: "text-yellow-400" },
  { value: "EFFECTIVE", label: "GOOD", color: "text-[#80ff82]" },
  { value: "VERY_EFFECTIVE", label: "PERFECT", color: "text-[#30ff34]" },
];

const BASE_PAIR_WIDTH = 360;
const BASE_BOTTOM_CARD_WIDTH = 96;
const BASE_BOTTOM_CARD_HEIGHT = 128;
const MAX_VISIBLE_TOP_CARDS = 3;
const MAX_VISIBLE_BOTTOM_CARDS = 3;
const MAX_VISIBLE_SINGLE_SLOT_CARDS = 6;
const MAX_TOP_CARDS = 8;
const MAX_BOTTOM_CARDS = 8;
const SHOW_MORE_BUTTON_HEIGHT = 40;
const READ_MORE_BUTTON_HEIGHT = 32;
const EFFICIENCY_SELECTOR_HEIGHT = 24;
const CARD_GRID_GAP = 6;
const CARD_SECTION_HORIZONTAL_PADDING = 32;

const calculateCardsPerRow = (containerWidth: number, cardWidth: number) =>
  Math.max(
    1,
    Math.floor(
      (containerWidth - CARD_SECTION_HORIZONTAL_PADDING + CARD_GRID_GAP) /
        (cardWidth + CARD_GRID_GAP),
    ),
  );

export const CardPairItem = ({
  pairNumber,
  pairId,
  topCards,
  bottomCards,
  comment,
  onSelectTop,
  onSelectBottom,
  onRemoveTopCard,
  onRemoveBottomCard,
  onReorderTopCards,
  onReorderBottomCards,
  onMoveCardToTop,
  onMoveCardToBottom,
  onBottomCardEffectivenessChange,
  onCommentChange,
  onRemove,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  isEditMode,
}: CardPairItemProps) => {
  const [isTopExpanded, setIsTopExpanded] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [isSingleSlotExpanded, setIsSingleSlotExpanded] = useState(false);

  const {
    draggedTopCardIndex,
    dragOverTopCardIndex,
    draggedBottomCardIndex,
    dragOverBottomCardIndex,
    handleTopCardDragStart,
    handleTopCardDragOver,
    handleTopCardDrop,
    handleTopCardDragEnd,
    handleBottomCardDragStart,
    handleBottomCardDragOver,
    handleBottomCardDrop,
    handleBottomCardDragEnd,
  } = useCardPairDragDrop({
    pairId,
    onReorderTopCards,
    onReorderBottomCards,
    onMoveCardToTop,
    onMoveCardToBottom,
  });

  // For responsive design
  const itemRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(360);

  useEffect(() => {
    if (!itemRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, []);

  const normalizedPairWidth = Math.max(
    170,
    Math.min(BASE_PAIR_WIDTH, Math.round(containerWidth)),
  );
  const scale = normalizedPairWidth / BASE_PAIR_WIDTH;
  const bottomCardWidth = Math.max(
    56,
    Math.round(BASE_BOTTOM_CARD_WIDTH * scale),
  );
  const bottomCardHeight = Math.max(
    74,
    Math.round(BASE_BOTTOM_CARD_HEIGHT * scale),
  );
  const topCardWidth = Math.max(40, Math.round(bottomCardWidth * 0.7));
  const topCardHeight = Math.max(52, Math.round(bottomCardHeight * 0.75));
  const singleSlotCardWidth = Math.max(52, Math.round(bottomCardWidth * 0.9));
  const singleSlotCardHeight = Math.max(68, Math.round(bottomCardHeight * 0.9));

  const topSectionRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);

  // Track if it's the first render to prevent scrolling on mount
  const isFirstRenderTop = useRef(true);
  const isFirstRenderBottom = useRef(true);
  const isFirstRenderComment = useRef(true);

  const hasTopCards = topCards.length > 0;
  const hasBottomCards = bottomCards.length > 0;
  const isSingleSlotPair =
    !isEditMode &&
    ((hasTopCards && !hasBottomCards) || (!hasTopCards && hasBottomCards));
  const singleSlotVisibleCardsCount = hasTopCards
    ? Math.min(topCards.length, MAX_VISIBLE_SINGLE_SLOT_CARDS)
    : Math.min(bottomCards.length, MAX_VISIBLE_SINGLE_SLOT_CARDS);
  const singleSlotCardsPerRow = calculateCardsPerRow(
    normalizedPairWidth,
    singleSlotCardWidth,
  );
  const singleSlotRowsCollapsed = Math.max(
    1,
    Math.ceil(singleSlotVisibleCardsCount / singleSlotCardsPerRow),
  );
  const SINGLE_SLOT_CARD_META_HEIGHT = 18;
  const singleSlotCollapsedMaxHeight =
    singleSlotRowsCollapsed *
      (singleSlotCardHeight + SINGLE_SLOT_CARD_META_HEIGHT) +
    (singleSlotRowsCollapsed - 1) * 6 +
    12;

  useEffect(() => {
    if (isFirstRenderTop.current) {
      isFirstRenderTop.current = false;
      return;
    }
    if (topSectionRef.current) {
      topSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isTopExpanded]);

  useEffect(() => {
    if (isFirstRenderBottom.current) {
      isFirstRenderBottom.current = false;
      return;
    }
    if (bottomSectionRef.current) {
      bottomSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isBottomExpanded]);

  useEffect(() => {
    if (isFirstRenderComment.current) {
      isFirstRenderComment.current = false;
      return;
    }
    if (commentRef.current) {
      commentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isCommentExpanded]);

  if (!isEditMode && !hasTopCards && !hasBottomCards) {
    return null;
  }

  const renderTopCardSection = () => {
    const maxVisible = MAX_VISIBLE_TOP_CARDS;
    const visibleCards =
      isEditMode || isTopExpanded ? topCards : topCards.slice(0, maxVisible);
    const hasMoreCards = !isEditMode && topCards.length > maxVisible;

    const calculateHeight = (minCards = 0) => {
      const cardsPerRow = calculateCardsPerRow(normalizedPairWidth, topCardWidth);
      let totalElements = Math.max(visibleCards.length, minCards);
      if (isEditMode && topCards.length < MAX_TOP_CARDS) {
        totalElements += 1;
      }

      const rows = Math.ceil(totalElements / cardsPerRow);
      const gapHeight = (rows - 1) * CARD_GRID_GAP;
      const cardsHeight = rows * topCardHeight + gapHeight;
      const dragHandleSpace = isEditMode ? 12 : 0; // Extra space for drag handles
      // Always reserve space for Show More button to keep consistent heights across all pairs
      const showMoreButtonSpace = SHOW_MORE_BUTTON_HEIGHT;

      return cardsHeight + showMoreButtonSpace + dragHandleSpace;
    };

    return (
      <div ref={topSectionRef} className="flex flex-col items-center w-full">
        <div className="text-xs text-slate-400 mb-1 text-center font-medium">
          Target
        </div>
        <div
          className="relative overflow-visible"
          style={{
            minHeight: `${calculateHeight(3)}px`,
          }}
        >
          <div
            className="flex flex-wrap gap-1.5 justify-center pt-3"
            style={{ maxWidth: `${normalizedPairWidth - CARD_SECTION_HORIZONTAL_PADDING}px` }}
          >
            {visibleCards.map((card, index) => {
              const isDragging = draggedTopCardIndex === index;
              const isDragOver = dragOverTopCardIndex === index && draggedTopCardIndex !== index;

              return (
                <div 
                  key={index} 
                  className={`relative group ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "ring-2 ring-blue-400 rounded-sm" : ""}`}
                  onDragOver={(e) => isEditMode && handleTopCardDragOver(e, index)}
                  onDrop={(e) => isEditMode && handleTopCardDrop(e, index)}
                >
                  {isEditMode && (
                    <>
                      <div
                        draggable
                        onDragStart={(e) => handleTopCardDragStart(e, index)}
                        onDragEnd={handleTopCardDragEnd}
                        className="absolute top-0.5 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing py-1 px-2.5 rounde z-30 bg-slate-800/35"
                        title="Drag to reorder"
                      >
                        <div className="grid grid-cols-3 gap-[2px]">
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveTopCard(index)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-10 opacity-0 group-hover:opacity-100"
                        title="Remove card"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                  <CardTooltip
                    imageUrl={card.imageUrl}
                    cardName={card.name}
                    cardId={card.id}
                  >
                    <img
                      src={card.imageUrlSmall}
                      alt={card.name}
                      draggable={false}
                      className="object-scale-down rounded-sm cursor-pointer pointer-events-none"
                      style={{
                        width: `${topCardWidth}px`,
                        height: `${topCardHeight}px`,
                      }}
                    />
                  </CardTooltip>
                </div>
              );
            })}
            {isEditMode && topCards.length < MAX_TOP_CARDS && (
              <button
                onClick={onSelectTop}
                className="rounded border border-dashed hover:border-blue-500 bg-slate-700/50 flex items-center justify-center"
                style={{
                  width: `${topCardWidth}px`,
                  height: `${topCardHeight}px`,
                  borderColor: "rgb(71 85 105)",
                }}
              >
                <Plus className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 flex justify-center"
            style={{ height: `${SHOW_MORE_BUTTON_HEIGHT}px` }}
          >
            {hasMoreCards && (
              <button
                onClick={() => setIsTopExpanded(!isTopExpanded)}
                className="mt-2 mb-1 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
              >
                {isTopExpanded ? (
                  <>
                    <Minus className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Show {topCards.length - maxVisible} More
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBottomCardSection = () => {
    const maxVisible = MAX_VISIBLE_BOTTOM_CARDS;
    const visibleCards =
      isEditMode || isBottomExpanded
        ? bottomCards
        : bottomCards.slice(0, maxVisible);
    const hasMoreCards = !isEditMode && bottomCards.length > maxVisible;

    const calculateHeight = (minCards = 0) => {
      const cardsPerRow = calculateCardsPerRow(
        normalizedPairWidth,
        bottomCardWidth,
      );
      let totalElements = Math.max(visibleCards.length, minCards);
      if (isEditMode && bottomCards.length < MAX_BOTTOM_CARDS) {
        totalElements += 1;
      }

      const rows = Math.ceil(totalElements / cardsPerRow);
      const gapHeight = (rows - 1) * CARD_GRID_GAP;
      const cardsHeight = rows * bottomCardHeight + gapHeight;

      // Reserve a fixed row for efficiency/selector in every pair to keep card pair height stable.
      const efficiencyHeight = EFFICIENCY_SELECTOR_HEIGHT + 4;
      const dragHandleSpace = isEditMode ? 12 : 0; // Extra space for drag handles
      // Always reserve space for Show Less button to keep consistent heights across all pairs
      const showLessButtonSpace = 16;

      return (
        cardsHeight +
        efficiencyHeight +
        SHOW_MORE_BUTTON_HEIGHT +
        dragHandleSpace +
        showLessButtonSpace +
        (isEditMode ? 10 : 0)
      );
    };

    return (
      <div ref={bottomSectionRef} className="flex flex-col items-center w-full">
        <div className="text-xs text-slate-400 mb-1 text-center font-medium">
          Counter
        </div>
        <div
          className="relative transition-all duration-150 ease-in-out overflow-visible"
          style={{
            minHeight: `${calculateHeight(3)}px`,
          }}
        >
          <div
            className="flex flex-wrap gap-1.5 justify-center pt-3"
            style={{ maxWidth: `${normalizedPairWidth - CARD_SECTION_HORIZONTAL_PADDING}px` }}
          >
            {visibleCards.map((card, index) => {
              const selectedOption = EFFECTIVENESS_OPTIONS.find(
                (opt) => opt.value === (card.effectiveness || ""),
              );
              const isDragging = draggedBottomCardIndex === index;
              const isDragOver = dragOverBottomCardIndex === index && draggedBottomCardIndex !== index;

              return (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "ring-2 ring-blue-400 rounded-sm" : ""}`}
                  onDragOver={(e) => isEditMode && handleBottomCardDragOver(e, index)}
                  onDrop={(e) => isEditMode && handleBottomCardDrop(e, index)}
                >
                  <div className="relative group">
                    {isEditMode && (
                      <>
                        <div
                          draggable
                          onDragStart={(e) => handleBottomCardDragStart(e, index)}
                          onDragEnd={handleBottomCardDragEnd}
                          className="absolute top-0.5 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing py-1 px-2.5 rounded z-30 bg-slate-800/35"
                          title="Drag to reorder"
                        >
                          <div className="grid grid-cols-3 gap-[2px]">
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                            <div className="w-[3px] h-[3px] bg-slate-300 rounded-full" />
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveBottomCard(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-10 opacity-0 group-hover:opacity-100"
                          title="Remove card"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </>
                    )}
                    <CardTooltip
                      imageUrl={card.imageUrl}
                      cardName={card.name}
                      cardId={card.id}
                    >
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        draggable={false}
                        className="object-scale-down rounded-sm cursor-pointer pointer-events-none"
                        style={{
                          width: `${bottomCardWidth}px`,
                          height: `${bottomCardHeight}px`,
                        }}
                      />
                    </CardTooltip>
                  </div>
                  {/* Efficiency selector/display below each bottom card */}
                  {isEditMode ? (
                    <select
                      value={card.effectiveness || ""}
                      onChange={(e) =>
                        onBottomCardEffectivenessChange(index, e.target.value)
                      }
                      className="mt-1 w-full px-1 py-0.5 bg-slate-800 text-white text-center font-bold text-[10px] z-50 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                      style={{ width: `${bottomCardWidth}px` }}
                    >
                      {EFFECTIVENESS_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-slate-800"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className={`mt-1 text-center text-[10px] font-bold uppercase tracking-wide ${card.effectiveness ? (selectedOption?.color || "text-slate-400") : "text-transparent"}`}
                      style={{ width: `${bottomCardWidth}px` }}
                    >
                      {card.effectiveness ? selectedOption?.label : "NONE"}
                    </div>
                  )}
                </div>
              );
            })}
            {isEditMode && bottomCards.length < MAX_BOTTOM_CARDS && (
              <button
                onClick={onSelectBottom}
                className="rounded border border-dashed hover:border-purple-500 bg-slate-700/50 flex items-center justify-center"
                style={{
                  width: `${bottomCardWidth}px`,
                  height: `${bottomCardHeight}px`,
                  borderColor: "rgb(71 85 105)",
                }}
              >
                <Plus className="w-6 h-6 text-slate-400" />
              </button>
            )}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 flex justify-center"
            style={{ height: `${SHOW_MORE_BUTTON_HEIGHT}px` }}
          >
            {hasMoreCards && (
              <button
                onClick={() => setIsBottomExpanded(!isBottomExpanded)}
                className="mt-6 mb-1 flex items-center gap-1 text-xs text-green-500 hover:text-blue-300 px-2 py-1"
              >
                {isBottomExpanded ? (
                  <>
                    <Minus className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Show {bottomCards.length - maxVisible} More
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={itemRef}
      className="space-y-1.5 w-full"
    >
      <div className="min-h-[28px] flex items-center justify-center gap-1">
        {isEditMode && onMoveLeft && canMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-0.5 flex-shrink-0"
            title="Move left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex-1"></div>
        {isEditMode && onMoveRight && canMoveRight && (
          <button
            onClick={onMoveRight}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-0.5 flex-shrink-0"
            title="Move right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative overflow-visible bg-gradient-to-br p-2 border border-blue-500/40">
        <div className="absolute left-2 top-2 z-10 bg-slate-950/85 px-2 py-0.5 text-xs font-bold text-yellow-500">
          #{pairNumber}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:46px_46px] opacity-25" />

        {isEditMode && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-20"
            title="Remove pair"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <div className="relative z-10 flex flex-col items-center space-y-2">
          {isSingleSlotPair ? (
            <div
              className="flex flex-col items-center transition-[min-height] duration-300 ease-in-out"
              style={{
                minHeight: "300px",
              }}
            >
              <div className="text-xs text-slate-400 mb-4 text-center font-medium">
                Tech Cards
              </div>
              <div className="flex-1 flex items-center">
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight:
                      !isEditMode && !isSingleSlotExpanded
                        ? `${singleSlotCollapsedMaxHeight}px`
                        : "1200px",
                  }}
                >
                  <div
                    className="flex flex-wrap gap-1.5 justify-center content-center"
                    style={{ maxWidth: `${normalizedPairWidth - CARD_SECTION_HORIZONTAL_PADDING}px` }}
                  >
                {hasTopCards &&
                  (isEditMode || isSingleSlotExpanded ? topCards : topCards.slice(0, MAX_VISIBLE_SINGLE_SLOT_CARDS)).map((card, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative group">
                        {isEditMode && (
                          <button
                            onClick={() => onRemoveTopCard(index)}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-10 opacity-0 group-hover:opacity-100"
                            title="Remove card"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <CardTooltip
                          imageUrl={card.imageUrl}
                          cardName={card.name}
                          cardId={card.id}
                        >
                          <img
                            src={card.imageUrlSmall}
                            alt={card.name}
                            className="object-scale-down rounded border border-none cursor-pointer shadow-sm"
                            style={{
                              width: `${singleSlotCardWidth}px`,
                              height: `${singleSlotCardHeight}px`,
                            }}
                          />
                        </CardTooltip>
                      </div>
                      <div
                        className="mt-1 text-center text-[10px] font-bold uppercase tracking-wide text-transparent"
                        style={{ width: `${singleSlotCardWidth}px` }}
                      >
                        NONE
                      </div>
                    </div>
                  ))}
                {hasBottomCards &&
                  (isEditMode || isSingleSlotExpanded ? bottomCards : bottomCards.slice(0, MAX_VISIBLE_SINGLE_SLOT_CARDS)).map((card, index) => {
                    const selectedOption = EFFECTIVENESS_OPTIONS.find(
                      (opt) => opt.value === (card.effectiveness || ""),
                    );
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="relative group">
                          {isEditMode && (
                            <button
                              onClick={() => onRemoveBottomCard(index)}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-10 opacity-0 group-hover:opacity-100"
                              title="Remove card"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <CardTooltip
                            imageUrl={card.imageUrl}
                            cardName={card.name}
                            cardId={card.id}
                          >
                            <img
                              src={card.imageUrlSmall}
                              alt={card.name}
                              className="object-scale-down rounded border border-none cursor-pointer shadow-sm"
                              style={{
                                width: `${singleSlotCardWidth}px`,
                                height: `${singleSlotCardHeight}px`,
                              }}
                            />
                          </CardTooltip>
                        </div>
                        {isEditMode ? (
                          <select
                            value={card.effectiveness || ""}
                            onChange={(e) =>
                              onBottomCardEffectivenessChange(
                                index,
                                e.target.value,
                              )
                            }
                            className="mt-1 w-full px-1 py-0.5 bg-slate-800 text-white text-center font-bold text-[10px] rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                            style={{ width: `${bottomCardWidth}px` }}
                          >
                            {EFFECTIVENESS_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className="bg-slate-800"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div
                            className={`mt-1 text-center text-[10px] font-bold uppercase tracking-wide ${card.effectiveness ? (selectedOption?.color || "text-slate-400") : "text-transparent"}`}
                            style={{ width: `${singleSlotCardWidth}px` }}
                          >
                            {card.effectiveness ? selectedOption?.label : "NONE"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {isEditMode && (
                  <>
                    {(hasTopCards || (!hasTopCards && !hasBottomCards)) &&
                      topCards.length < MAX_TOP_CARDS && (
                        <button
                          onClick={(e) => onSelectTop(e)}
                          className="rounded border border-dashed border-slate-600 hover:border-blue-500 bg-slate-700/50 flex items-center justify-center"
                          style={{
                            width: `${topCardWidth}px`,
                            height: `${topCardHeight}px`,
                          }}
                        >
                          <Plus className="w-5 h-5 text-slate-400" />
                        </button>
                      )}
                    {(hasBottomCards || (!hasTopCards && !hasBottomCards)) &&
                      bottomCards.length < MAX_BOTTOM_CARDS && (
                        <button
                          onClick={(e) => onSelectBottom(e)}
                          className="rounded border border-dashed border-slate-600 hover:border-purple-500 bg-slate-700/50 flex items-center justify-center"
                          style={{
                            width: `${bottomCardWidth}px`,
                            height: `${bottomCardHeight}px`,
                          }}
                        >
                          <Plus className="w-6 h-6 text-slate-400" />
                        </button>
                      )}
                  </>
                )}
                  </div>
                </div>
              </div>
              {!isEditMode && ((hasTopCards && topCards.length > MAX_VISIBLE_SINGLE_SLOT_CARDS) || (hasBottomCards && bottomCards.length > MAX_VISIBLE_SINGLE_SLOT_CARDS)) && (
                <div className="w-full flex justify-center mt-2">
                  <button
                    onClick={() => setIsSingleSlotExpanded(!isSingleSlotExpanded)}
                    className="text-xs text-green-500 hover:text-blue-300 px-2 py-1"
                  >
                    {isSingleSlotExpanded ? `- Show Less` : `+ Show ${Math.max(
                      (hasTopCards ? topCards.length : 0) - MAX_VISIBLE_SINGLE_SLOT_CARDS,
                      (hasBottomCards ? bottomCards.length : 0) - MAX_VISIBLE_SINGLE_SLOT_CARDS
                    )} More`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {renderTopCardSection()}

              <div className="flex items-center justify-center py-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400 opacity-70"
                >
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </div>

              {renderBottomCardSection()}
            </>
          )}
        </div>
        <CardPairCommentSection
          comment={comment}
          isEditMode={isEditMode}
          isCommentExpanded={isCommentExpanded}
          onToggleExpanded={() => setIsCommentExpanded(!isCommentExpanded)}
          onCommentChange={onCommentChange}
          commentRef={commentRef}
          readMoreButtonHeight={READ_MORE_BUTTON_HEIGHT}
        />
      </div>
    </div>
  );
};
