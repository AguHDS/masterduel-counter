import { X, BookOpen, Sparkles } from "lucide-react";
import type { GuideType } from "@/features/archetypes/types";

interface GuideTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: GuideType) => void;
  archetypeName: string;
}

export const GuideTypeSelectionModal = ({
  isOpen,
  onClose,
  onSelectType,
  archetypeName,
}: GuideTypeSelectionModalProps) => {
  if (!isOpen) return null;

  const handleSelectCounter = () => {
    onSelectType("COUNTER");
  };

  const handleSelectDeck = () => {
    onSelectType("DECK");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 border-2 border-blue-500/50 rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-yellow-100 mb-2">
            Select Guide Type
          </h2>
          <p className="text-gray-300">
            Choose the type of guide you want to create for{" "}
            <span className="text-blue-400 font-semibold">{archetypeName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSelectCounter}
            className="group relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 hover:border-purple-400 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-purple-300">Counter Guide</h3>
              <p className="text-sm text-gray-300">
                Create a guide focused on countering this archetype with specific card
                interactions and strategies.
              </p>
              <ul className="text-xs text-gray-400 space-y-1 text-left w-full">
                <li>• Card-by-card counter suggestions</li>
                <li>• Interaction explanations</li>
                <li>• Strategy breakdowns</li>
              </ul>
            </div>
          </button>

          <button
            onClick={handleSelectDeck}
            className="group relative bg-gradient-to-br from-green-900/30 to-teal-900/30 border-2 border-green-500/50 hover:border-green-400 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-300">Deck Guide</h3>
              <p className="text-sm text-gray-300">
                Create a comprehensive deck guide with combo lines, starting hands, and
                optimal builds.
              </p>
              <ul className="text-xs text-gray-400 space-y-1 text-left w-full">
                <li>• Sample starting hands (up to 5)</li>
                <li>• Recommended deck builds</li>
                <li>• Combo explanations</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          You can edit and update your guide type later if needed
        </div>
      </div>
    </div>
  );
};
