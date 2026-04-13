import { Lock } from "lucide-react";
import type { CustomDeck } from "../api/customDeckApi";

interface PersonalDecksProps {
  decks: CustomDeck[];
  onViewAll: () => void;
  isOwner: boolean;
}

export const PersonalDecks = ({ decks, onViewAll, isOwner }: PersonalDecksProps) => {
  const displayDecks = decks.slice(0, 3);

  if (!isOwner && decks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-yellow-500 font-bold text-sm flex items-center gap-2 border-t border-yellow-600/30 pt-4">
        <span className="text-lg">♦</span> Personal Decks
      </h3>
      {displayDecks.length > 0 ? (
        <>
          <div className="space-y-2 mb-4">
            {displayDecks.map((deck) => {
              const canView = isOwner || deck.isPublic;
              
              // Use headerCard if available, otherwise fallback to first card
              let previewCard = null;
              if (deck.headerCard) {
                previewCard = deck.headerCard;
              } else {
                const previewCards = deck.extraDeck.length > 0 ? deck.extraDeck : deck.mainDeck;
                previewCard = previewCards[0];
              }

              return (
                <div
                  key={deck.id}
                  className="flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors cursor-pointer"
                  onClick={onViewAll}
                >
                  {canView && previewCard ? (
                    <img
                      src={previewCard.imageUrlSmall}
                      alt={previewCard.name}
                      className="h-[50px] w-[35px] border border-yellow-400/60 shadow-sm object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[35px] h-[50px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {deck.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-cyan-400">
                        Main: {deck.mainDeck.length}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-purple-400">
                        Extra: {deck.extraDeck.length}
                      </span>
                    </div>
                    {!canView && (
                      <span className="text-slate-500 text-xs">Private</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onViewAll}
            className="w-full px-4 hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors"
          >
            View all ({decks.length})
          </button>
        </>
      ) : (
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">No decks yet</p>
        </div>
      )}
    </div>
  );
};
