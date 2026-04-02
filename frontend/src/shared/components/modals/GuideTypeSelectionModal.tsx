import { X, BookOpen, Shield } from "lucide-react";
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
            className="group relative bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/50 hover:border-orange-400 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-orange-300">
                Counter Guide
              </h3>
              <p className="text-sm text-gray-300">
                Counter guide focused on countering this archetype with
                handtraps and tips
              </p>
              <ul className="text-xs text-gray-400 space-y-1 text-left w-full">
                <li>• Handtrap suggestions</li>
                <li>• Tips for each step</li>
              </ul>
            </div>
          </button>

          <button
            onClick={handleSelectDeck}
            className="group relative bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 hover:border-blue-400 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-300">Deck Guide</h3>
              <p className="text-sm text-gray-300">
                Deck guide with combo lines, starting hands, and deck building
              </p>
              <ul className="text-xs text-gray-400 space-y-1 text-left w-full">
                <li>• Sample starting hands (up to 5)</li>
                <li>• Combo lines with alternative flows</li>
                <li>• Deck builder</li>
              </ul>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
