import { Plus } from "lucide-react";
import { CardTooltip } from "./CardTooltip";

interface HeaderCard {
  id: number;
  name: string;
  imageUrl: string;
}

interface InstanceHeaderProps {
  archetypeName: string;
  title: string;
  generalTip: string;
  headerCard: HeaderCard | null;
  isEditMode: boolean;
  onTitleChange: (value: string) => void;
  onGeneralTipChange: (value: string) => void;
  onSelectHeaderCard: () => void;
}

export const InstanceHeader = ({
  archetypeName,
  title,
  generalTip,
  headerCard,
  isEditMode,
  onTitleChange,
  onGeneralTipChange,
  onSelectHeaderCard,
}: InstanceHeaderProps) => {
  return (
    <div className="flex items-start justify-center gap-8 mb-8 w-full px-4">
      {/* Left Side: Archetype Name, Title and General Tip */}
      <div className="space-y-4 flex-1 max-w-4xl">
        {/* Archetype Name - Bold and larger */}
        <h1 className="text-3xl font-bold text-white">{archetypeName}</h1>

        {/* Title Section */}
        <div className="w-full">
          {isEditMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              maxLength={100}
              placeholder="Enter a title for your guide (Max. 100 characters)"
              className="w-full px-4 py-2 bg-slate-800/40 text-white text-xl font-normal rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          ) : (
            <h2 className="text-2xl text-white">{title}</h2>
          )}
        </div>

        {/* General Tip Section */}
        <div className="w-full">
          {isEditMode ? (
            <textarea
              value={generalTip}
              onChange={(e) => onGeneralTipChange(e.target.value)}
              maxLength={5000}
              placeholder="Add optional tip for this guide (Max. 5000 characters)..."
              className="w-full px-4 py-3 bg-slate-800/40 text-white text-base rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 resize-none shadow-sm min-h-[120px]"
              rows={5}
            />
          ) : (
            <div className="py-4 border-t border-blue-400/30">
              <p className="text-slate-300 text-base leading-relaxed break-words">
                {generalTip || "No description"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Header Card */}
      <div className="relative flex-shrink-0 group">
        {headerCard ? (
          <div className="relative w-48 h-auto rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
            <CardTooltip
              imageUrl={headerCard.imageUrl}
              cardName={headerCard.name}
              cardId={headerCard.id}
            >
              <img
                src={headerCard.imageUrl}
                alt={headerCard.name}
                className="w-full h-auto object-cover cursor-pointer"
              />
            </CardTooltip>
            {isEditMode && (
              <button
                onClick={onSelectHeaderCard}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Header Card"
              >
                <Plus className="w-12 h-12 text-white" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => isEditMode && onSelectHeaderCard()}
            disabled={!isEditMode}
            className={`bg-gradient-to-br from-blue-800 to-slate-800 w-24 h-24 rounded-full flex items-center justify-center border-2 border-blue-500 ${
              isEditMode
                ? "cursor-pointer hover:border-purple-500 transition-colors"
                : "cursor-default"
            }`}
            title={isEditMode ? "Select Header Card" : ""}
          >
            <Plus
              className={`w-12 h-12 ${
                isEditMode ? "text-purple-400" : "text-blue-300"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
