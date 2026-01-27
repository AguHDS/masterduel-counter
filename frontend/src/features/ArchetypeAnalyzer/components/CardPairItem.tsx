import { X } from "lucide-react";
import { type Card } from "../api/cardApi";

interface CardPairItemProps {
  topCard: Card | null;
  bottomCard: Card | null;
  effectiveness?: string;
  comment?: string;
  onSelectTop: () => void;
  onSelectBottom: () => void;
  onEffectivenessChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onRemove: () => void;
  isEditMode: boolean;
}

const EFFECTIVENESS_OPTIONS = [
  { value: "BAD", label: "BAD", color: "text-red-500" },
  { value: "MEDIUM", label: "MEDIUM", color: "text-yellow-400" },
  { value: "EFFECTIVE", label: "GOOD", color: "text-green-400" },
  { value: "VERY_EFFECTIVE", label: "VERY GOOD", color: "text-green-500" },
];  

export const CardPairItem = ({
  topCard,
  bottomCard,
  effectiveness,
  comment,
  onSelectTop,
  onSelectBottom,
  onEffectivenessChange,
  onCommentChange,
  onRemove,
  isEditMode,
}: CardPairItemProps) => {
  const selectedOption = EFFECTIVENESS_OPTIONS.find((opt) => opt.value === effectiveness);

  return (
    <div className="space-y-2">
      {/* Effectiveness Label */}
      {isEditMode ? (
        <select
          value={effectiveness || ""}
          onChange={(e) => onEffectivenessChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 text-white text-center font-bold text-sm rounded border-2 border-slate-600 focus:outline-none focus:border-blue-500"
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

        <div className="flex flex-col items-center space-y-3">
          {/* Top Card (Target) */}
          <button
            onClick={onSelectTop}
            disabled={!isEditMode}
            className={`relative w-32 h-44 rounded-lg border-2 overflow-hidden transition-all ${
              topCard
                ? "border-blue-500"
                : "border-dashed border-slate-600 hover:border-blue-500 bg-slate-700/50"
            } ${isEditMode ? "cursor-pointer" : "cursor-default"}`}
          >
            {topCard ? (
              <img
                src={topCard.imageUrlSmall}
                alt={topCard.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Target Card
              </div>
            )}
          </button>

          {/* Arrow Icon */}
          <div className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

          {/* Bottom Card (Counter) */}
          <button
            onClick={onSelectBottom}
            disabled={!isEditMode}
            className={`relative w-32 h-44 rounded-lg border-2 overflow-hidden transition-all ${
              bottomCard
                ? "border-green-500"
                : "border-dashed border-slate-600 hover:border-green-500 bg-slate-700/50"
            } ${isEditMode ? "cursor-pointer" : "cursor-default"}`}
          >
            {bottomCard ? (
              <img
                src={bottomCard.imageUrlSmall}
                alt={bottomCard.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center px-2">
                Counter Card
              </div>
            )}
          </button>

          {/* Comment Field */}
          {isEditMode ? (
            <textarea
              value={comment || ""}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 bg-slate-700/50 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
          ) : comment ? (
            <div className="w-full flex flex-col items-center space-y-1">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Tip</span>
              <div className="text-center px-2 py-1 text-slate-300 text-sm italic">
                {comment}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
