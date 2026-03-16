import { X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

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
  const selectedOption = EFFECTIVENESS_OPTIONS.find((opt) => opt.value === effectiveness);

  // Detect if this is a single-slot pair (cards only in one position)
  const hasTopCards = topCards.length > 0;
  const hasBottomCards = bottomCards.length > 0;
  const isSingleSlotPair = !isEditMode && ((hasTopCards && !hasBottomCards) || (!hasTopCards && hasBottomCards));
  if (!isEditMode && !hasTopCards && !hasBottomCards) {
    return null;
  }

  const renderCommentWithLineBreaks = (text: string) => {
    if (!text) return "No comment";
    
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Effectiveness Label */}
      <div className="min-h-[40px] flex items-center justify-center gap-2">
        {isEditMode && onMoveLeft && canMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-1 transition-colors"
            title="Move left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {isEditMode ? (
          <select
            value={effectiveness || ""}
            onChange={(e) => onEffectivenessChange(e.target.value)}
            className="w-full min-w-[280px] px-3 py-2 bg-slate-800 text-white text-center font-bold text-sm rounded border-2 border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="" className="bg-slate-800">Select Effectiveness</option>
            {EFFECTIVENESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        ) : effectiveness ? (
          <div className={`w-full text-center text-xl font-bold uppercase tracking-wide ${selectedOption?.color || "text-slate-400"}`}>
            {selectedOption?.label}
          </div>
        ) : null}
        {isEditMode && onMoveRight && canMoveRight && (
          <button
            onClick={onMoveRight}
            className="bg-blue-700 hover:bg-blue-600 text-white rounded p-1 transition-colors"
            title="Move right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Card Pair Container */}
      <div className="relative bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        {isEditMode && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors z-10"
            title="Remove pair"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center space-y-4">
          {/* Single Slot Layout (only top OR bottom cards) */}
          {isSingleSlotPair && (
            <div className="flex flex-col items-center">
              <div className="text-sm text-slate-400 mb-2 text-center">Cards</div>
              <div className="flex flex-wrap gap-2 justify-center items-center min-w-[140px]" style={{ minHeight: (hasTopCards ? topCards.length : bottomCards.length) > 0 ? 'auto' : '180px' }}>
                {hasTopCards && topCards.map((card, index) => (
                  <div key={index} className="relative group">
                    {isEditMode && (
                      <button
                        onClick={() => onRemoveTopCard(index)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100"
                        title="Remove card"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <CardTooltip imageUrl={card.imageUrl} cardName={card.name} cardId={card.id}>
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-32 h-44 object-cover rounded-lg border-2 border-blue-500 cursor-pointer"
                      />
                    </CardTooltip>
                  </div>
                ))}
                {hasBottomCards && bottomCards.map((card, index) => (
                  <div key={index} className="relative group">
                    {isEditMode && (
                      <button
                        onClick={() => onRemoveBottomCard(index)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100"
                        title="Remove card"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <CardTooltip imageUrl={card.imageUrl} cardName={card.name} cardId={card.id}>
                      <img
                        src={card.imageUrlSmall}
                        alt={card.name}
                        className="w-32 h-44 object-cover rounded-lg border-2 border-purple-500 cursor-pointer"
                      />
                    </CardTooltip>
                  </div>
                ))}
                {isEditMode && (
                  <>
                    {hasTopCards && (
                      <button
                        onClick={onSelectTop}
                        className="w-32 h-44 rounded-lg border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-700/50 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-8 h-8 text-slate-400" />
                      </button>
                    )}
                    {hasBottomCards && (
                      <button
                        onClick={onSelectBottom}
                        className="w-32 h-44 rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 bg-slate-700/50 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-8 h-8 text-slate-400" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Full Layout - Always show in edit mode, or in read mode when not single-slot */}
          {!isSingleSlotPair && (
            <>
              {/* Top Cards (Target) */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-slate-400 mb-2 text-center">Target</div>
                <div className="flex flex-wrap gap-2 justify-center items-center min-w-[140px]" style={{ minHeight: topCards.length > 0 ? 'auto' : '180px' }}>
                  {topCards.map((card, index) => (
                    <div key={index} className="relative group">
                      {isEditMode && (
                        <button
                          onClick={() => onRemoveTopCard(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100"
                          title="Remove card"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <CardTooltip imageUrl={card.imageUrl} cardName={card.name} cardId={card.id}>
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className="w-32 h-44 object-cover rounded-lg border-2 border-blue-500 cursor-pointer"
                        />
                      </CardTooltip>
                    </div>
                  ))}
                  {isEditMode && (
                    <button
                      onClick={onSelectTop}
                      className="w-32 h-44 rounded-lg border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-700/50 transition-all flex items-center justify-center"
                    >
                      <Plus className="w-8 h-8 text-slate-400" />
                    </button>
                  )}
                </div>
                  </div>

              {/* Arrow Icon */}
              <div className="flex items-center justify-center py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
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

              {/* Bottom Cards (Counter) */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-slate-400 mb-2 text-center">Counter</div>
                <div className="flex flex-wrap gap-2 justify-center items-center min-w-[140px]" style={{ minHeight: bottomCards.length > 0 ? 'auto' : '180px' }}>
                  {bottomCards.map((card, index) => (
                    <div key={index} className="relative group">
                      {isEditMode && (
                        <button
                          onClick={() => onRemoveBottomCard(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10 opacity-0 group-hover:opacity-100"
                          title="Remove card"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <CardTooltip imageUrl={card.imageUrl} cardName={card.name} cardId={card.id}>
                        <img
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className="w-32 h-44 object-cover rounded-lg border-2 border-purple-500 cursor-pointer"
                        />
                      </CardTooltip>
                    </div>
                  ))}
                  {isEditMode && (
                    <button
                      onClick={onSelectBottom}
                      className="w-32 h-44 rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 bg-slate-700/50 transition-all flex items-center justify-center"
                    >
                      <Plus className="w-8 h-8 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Comment Field */}
        <div className="flex items-center justify-center mt-4">
          {isEditMode ? (
            <div className="w-full">
              <label className="text-blue-400 font-semibold text-xs mb-1 block">Comment</label>
              <textarea
                value={comment || ""}
                onChange={(e) => onCommentChange(e.target.value)}
                maxLength={2000}
                placeholder="Add a comment (Max. 2000 characters)..."
                className="w-full px-3 py-2 bg-slate-700/50 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-blue-500 resize-y min-h-[80px]"
                rows={4}
              />
              <div className="text-xs text-slate-400 mt-1 text-right">
                {(comment || "").length}/2000 characters
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-1">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Comment</span>
              <div 
                className="text-center px-3 py-2 text-slate-300 text-sm w-[300px] scrollbar-cardpair"
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.4em',
                }}
              >
                {renderCommentWithLineBreaks(comment || "No comment")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};