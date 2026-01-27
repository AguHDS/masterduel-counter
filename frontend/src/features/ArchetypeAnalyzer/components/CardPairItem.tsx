import { X } from "lucide-react";
import { type Card } from "../api/cardApi";

interface CardPairItemProps {
  topCard: Card | null;
  bottomCard: Card | null;
  onSelectTop: () => void;
  onSelectBottom: () => void;
  onRemove: () => void;
  isEditMode: boolean;
}

export const CardPairItem = ({
  topCard,
  bottomCard,
  onSelectTop,
  onSelectBottom,
  onRemove,
  isEditMode,
}: CardPairItemProps) => {
  return (
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
      </div>
    </div>
  );
};
