import { X, Plus, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";
import { useState, useRef, useEffect } from "react";

interface CardPairItemProps {
  topCards: Card[];
  bottomCards: Card[];
  effectiveness?: string;
  comment?: string;
  onSelectTop: () => void;
  onSelectBottom: () => void;
  onRemoveTopCard: (index: number) => void;
  onRemoveBottomCard: (index: number) => void;
  onEffectivenessChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onRemove: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  isEditMode: boolean;
}

const EFFECTIVENESS_OPTIONS = [
  { value: "BAD", label: "BAD", color: "text-red-500" },
  { value: "MEDIUM", label: "MEDIUM", color: "text-yellow-400" },
  { value: "EFFECTIVE", label: "GOOD", color: "text-[#80ff82]" },
  { value: "VERY_EFFECTIVE", label: "PERFECT", color: "text-[#30ff34]" },
];

const BOTTOM_CARD_WIDTH = 96;
const BOTTOM_CARD_HEIGHT = 128;
const TOP_CARD_WIDTH = Math.round(BOTTOM_CARD_WIDTH * 0.7);
const TOP_CARD_HEIGHT = Math.round(BOTTOM_CARD_HEIGHT * 0.75);
const MAX_VISIBLE_TOP_CARDS = 3;
const MAX_VISIBLE_BOTTOM_CARDS = 3;
const FIXED_CONTAINER_WIDTH = 360;
const SHOW_MORE_BUTTON_HEIGHT = 40;
const READ_MORE_BUTTON_HEIGHT = 32;

export const CardPairItem = ({
  topCards,
  bottomCards,
  effectiveness,
  comment,
  onSelectTop,
  onSelectBottom,
  onRemoveTopCard,
  onRemoveBottomCard,
  onEffectivenessChange,
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

  const topSectionRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);

  const selectedOption = EFFECTIVENESS_OPTIONS.find(
    (opt) => opt.value === effectiveness,
  );

  const hasTopCards = topCards.length > 0;
  const hasBottomCards = bottomCards.length > 0;
  const isSingleSlotPair =
    !isEditMode &&
    ((hasTopCards && !hasBottomCards) || (!hasTopCards && hasBottomCards));

  useEffect(() => {
    if (topSectionRef.current) {
      topSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isTopExpanded]);

  useEffect(() => {
    if (bottomSectionRef.current) {
      bottomSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isBottomExpanded]);

  useEffect(() => {
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

  const renderCommentWithLineBreaks = (text: string) => {
    if (!text) return "No comment";

    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const renderCardSection = (
    cards: Card[],
    isTop: boolean,
    onRemove: (index: number) => void,
    onSelect: () => void,
    isExpanded: boolean,
    setExpanded: (value: boolean) => void,
    sectionRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    const maxVisible = isTop ? MAX_VISIBLE_TOP_CARDS : MAX_VISIBLE_BOTTOM_CARDS;
    const visibleCards =
      isEditMode || isExpanded ? cards : cards.slice(0, maxVisible);
    const hasMoreCards = !isEditMode && cards.length > maxVisible;
    const cardWidth = isTop ? TOP_CARD_WIDTH : BOTTOM_CARD_WIDTH;
    const cardHeight = isTop ? TOP_CARD_HEIGHT : BOTTOM_CARD_HEIGHT;

    const calculateHeight = () => {
      const cardsPerRow = isTop ? 4 : 3;

      let totalElements = visibleCards.length;
      if (isEditMode) {
        totalElements += 1;
      }

      const rows = Math.ceil(totalElements / cardsPerRow);
      const gapHeight = (rows - 1) * 6;
      const cardsHeight = rows * cardHeight + gapHeight;

      return cardsHeight + SHOW_MORE_BUTTON_HEIGHT;
    };

    return (
      <div ref={sectionRef} className="flex flex-col items-center w-full">
        <div className="text-xs text-slate-400 mb-1 text-center font-medium">
          {isTop ? "Target" : "Counter"}
        </div>
        <div
          className="relative transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            height: `${calculateHeight()}px`,
          }}
        >
          <div
            className="flex flex-wrap gap-1.5 justify-start"
            style={{ maxWidth: `${FIXED_CONTAINER_WIDTH - 32}px` }}
          >
            {visibleCards.map((card, index) => (
              <div key={index} className="relative group">
                {isEditMode && (
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
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
                    className="object-cover rounded border cursor-pointer shadow-sm"
                    style={{
                      width: `${cardWidth}px`,
                      height: `${cardHeight}px`,
                      borderColor: isTop ? "transparent" : "transparent",
                    }}
                  />
                </CardTooltip>
              </div>
            ))}
            {isEditMode && (
              <button
                onClick={onSelect}
                className="rounded border border-dashed hover:border-blue-500 bg-slate-700/50 transition-all flex items-center justify-center"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderColor: isTop ? "rgb(71 85 105)" : "rgb(71 85 105)",
                }}
              >
                <Plus
                  className={`${isTop ? "w-5 h-5" : "w-6 h-6"} text-slate-400`}
                />
              </button>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{ height: `${SHOW_MORE_BUTTON_HEIGHT}px` }}>
            {hasMoreCards && (
              <button
                onClick={() => setExpanded(!isExpanded)}
                className="mt-2 mb-1 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
              >
                {isExpanded ? (
                  <>
                    <Minus className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Show {cards.length - maxVisible} More
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
      className="space-y-1.5"
      style={{ width: `${FIXED_CONTAINER_WIDTH}px` }}
    >
      <div className="min-h-[28px] flex items-center justify-center gap-1">
        {isEditMode && onMoveLeft && canMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-0.5 transition-colors flex-shrink-0"
            title="Move left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {isEditMode ? (
          <select
            value={effectiveness || ""}
            onChange={(e) => onEffectivenessChange(e.target.value)}
            className="w-full min-w-0 px-2 py-1 bg-slate-800 text-white text-center font-bold text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="" className="bg-slate-800">
              Select Effectiveness
            </option>
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
        ) : effectiveness ? (
          <div
            className={`w-full text-center text-1xl mb-2 font-bold uppercase tracking-wide ${selectedOption?.color || "text-slate-400"}`}
          >
            {selectedOption?.label}
          </div>
        ) : null}
        {isEditMode && onMoveRight && canMoveRight && (
          <button
            onClick={onMoveRight}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-0.5 transition-colors flex-shrink-0"
            title="Move right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative bg-gradient-to-br  p-2  border border-blue-500/40">
        {" "}
        {isEditMode && (
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 shadow-md"
            title="Remove pair"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <div className="flex flex-col items-center space-y-2">
          {isSingleSlotPair ? (
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-400 mb-1 text-center font-medium">
                Cards
              </div>
              <div
                className="flex flex-wrap gap-1.5 justify-start"
                style={{ maxWidth: `${FIXED_CONTAINER_WIDTH - 32}px` }}
              >
                {hasTopCards &&
                  topCards.map((card, index) => (
                    <div key={index} className="relative group">
                      {isEditMode && (
                        <button
                          onClick={() => onRemoveTopCard(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
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
                          className="object-cover rounded border border-blue-500 cursor-pointer shadow-sm"
                          style={{
                            width: `${TOP_CARD_WIDTH}px`,
                            height: `${TOP_CARD_HEIGHT}px`,
                          }}
                        />
                      </CardTooltip>
                    </div>
                  ))}
                {hasBottomCards &&
                  bottomCards.map((card, index) => (
                    <div key={index} className="relative group">
                      {isEditMode && (
                        <button
                          onClick={() => onRemoveBottomCard(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
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
                          className="w-24 h-32 object-cover rounded border border-none cursor-pointer shadow-sm"
                        />
                      </CardTooltip>
                    </div>
                  ))}
                {isEditMode && (
                  <>
                    {(hasTopCards || (!hasTopCards && !hasBottomCards)) && (
                      <button
                        onClick={onSelectTop}
                        className="rounded border border-dashed border-slate-600 hover:border-blue-500 bg-slate-700/50 transition-all flex items-center justify-center"
                        style={{
                          width: `${TOP_CARD_WIDTH}px`,
                          height: `${TOP_CARD_HEIGHT}px`,
                        }}
                      >
                        <Plus className="w-5 h-5 text-slate-400" />
                      </button>
                    )}
                    {(hasBottomCards || (!hasTopCards && !hasBottomCards)) && (
                      <button
                        onClick={onSelectBottom}
                        className="w-24 h-32 rounded border border-dashed border-slate-600 hover:border-purple-500 bg-slate-700/50 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6 text-slate-400" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {renderCardSection(
                topCards,
                true,
                onRemoveTopCard,
                onSelectTop,
                isTopExpanded,
                setIsTopExpanded,
                topSectionRef,
              )}

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

              {renderCardSection(
                bottomCards,
                false,
                onRemoveBottomCard,
                onSelectBottom,
                isBottomExpanded,
                setIsBottomExpanded,
                bottomSectionRef,
              )}
            </>
          )}
        </div>
        <div ref={commentRef} className="flex items-center justify-center mt-2">
          {isEditMode ? (
            <div className="w-full">
              <label className="text-blue-400 font-semibold text-xs mb-0.5 block">
                Comment
              </label>
              <textarea
                value={comment || ""}
                onChange={(e) => onCommentChange(e.target.value)}
                maxLength={2000}
                placeholder="Add a comment (Max. 2000 characters)..."
                className="w-full px-2 py-1.5 bg-slate-700/50 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 resize-y min-h-[60px]"
                rows={3}
              />
              <div className="text-xs text-slate-400 mt-0.5 text-right">
                {(comment || "").length}/2000
              </div>
            </div>
          ) : (
            <div className="w-full pb-1 flex flex-col items-center">
              <span className="text-xs mt-2 font-semibold text-blue-400 uppercase tracking-wide">
                Comment
              </span>
              <div
                className={`text-center mt-2 py-1 px-3 text-slate-300 text-[13px] w-full transition-all duration-300 overflow-hidden ${
                  !isCommentExpanded ? "" : ""
                }`}
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.3em",
                  maxHeight: !isCommentExpanded ? "4.5rem" : "500px",
                  transition: "max-height 0.3s ease-in-out",
                  minHeight: "4.5rem",
                }}
              >
                {renderCommentWithLineBreaks(comment || "No comment")}
              </div>
              <div style={{ height: `${READ_MORE_BUTTON_HEIGHT}px` }} className="flex items-center justify-center">
                {comment && comment.length > 150 && (
                  <button
                    onClick={() => setIsCommentExpanded(!isCommentExpanded)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                  >
                    {isCommentExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
