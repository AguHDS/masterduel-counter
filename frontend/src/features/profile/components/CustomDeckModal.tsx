import { X } from "lucide-react";
import { CardTooltip } from "@/features/ArchetypeAnalyzer/components/CardTooltip";
import type { CustomDeck } from "../api/customDeckApi";

interface CustomDeckModalProps {
  deck: CustomDeck;
  onClose: () => void;
}

export const CustomDeckModal = ({ deck, onClose }: CustomDeckModalProps) => {
  const getMainDeckColumns = () => {
    if (deck.mainDeck.length > 50) return 12;
    return 10;
  };

  const mainDeckColumns = getMainDeckColumns();
  const cardSize = mainDeckColumns === 12 ? "tiny" : "small";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900/95 via-blue-950/95 to-slate-900/95 rounded-2xl shadow-2xl border-2 border-cyan-500/40 backdrop-blur-xl max-w-4xl w-full max-h-[90vh] overflow-auto scrollbar-cardpair"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {deck.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Deck */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-950/40 to-blue-900/40 px-4 py-3 rounded-lg border-l-4 border-cyan-400 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">
                  Main Deck
                </span>
                <span className="text-cyan-300 text-sm font-medium">
                  ({deck.mainDeck.length})
                </span>
              </div>
            </div>
            <div
              className="grid gap-1 p-3 bg-gradient-to-t from-blue-700/20 via-slate-900 to-blue-700/20 rounded-lg min-h-[100px] border border-cyan-500/40"
              style={{
                gridTemplateColumns: `repeat(${mainDeckColumns}, minmax(0, 1fr))`,
              }}
            >
              {deck.mainDeck.map((card, index) => (
                <CardTooltip
                  key={`main-${index}`}
                  cardId={card.id}
                  imageUrl={card.imageUrl}
                  cardName={card.name}
                >
                  <img
                    src={card.imageUrlSmall}
                    alt={card.name}
                    className={`w-full h-auto border border-cyan-600/30 hover:border-cyan-400/50 transition-colors ${
                      cardSize === "tiny" ? "max-h-[60px]" : "max-h-[80px]"
                    } object-contain cursor-pointer`}
                  />
                </CardTooltip>
              ))}
            </div>
          </div>

          {/* Extra Deck */}
          {deck.extraDeck.length > 0 && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-950/40 to-purple-900/40 px-4 py-3 rounded-lg border-l-4 border-purple-400 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base">
                    Extra Deck
                  </span>
                  <span className="text-purple-300 text-sm font-medium">
                    ({deck.extraDeck.length})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-15 gap-1 p-3 bg-gradient-to-t from-purple-900/30 via-slate-900 to-purple-900/30 rounded-lg border border-blue-400/20">
                {deck.extraDeck.map((card, index) => (
                  <CardTooltip
                    key={`extra-${index}`}
                    cardId={card.id}
                    imageUrl={card.imageUrl}
                    cardName={card.name}
                  >
                    <img
                      src={card.imageUrlSmall}
                      alt={card.name}
                      className="w-full h-auto rounded border border-purple-500/30 hover:border-blue-400/60 transition-colors max-h-[80px] object-contain cursor-pointer"
                    />
                  </CardTooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
