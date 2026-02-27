import { useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { useCustomDecks } from "../hooks/useCustomDecks";
import { CustomDeckEditor } from "./CustomDeckEditor";
import { CustomDeckModal } from "./CustomDeckModal";
import type { CustomDeck } from "../api/customDeckApi";

interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

interface CustomDecksListProps {
  userId: string;
  isOwner: boolean;
}

const MAX_DECKS_USER = 10;

export const CustomDecksList = ({ userId, isOwner }: CustomDecksListProps) => {
  const { decks, isLoading, createDeck, deleteDeck, isCreating, isDeleting } =
    useCustomDecks(userId);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<CustomDeck | null>(null);

  const canCreateMore = decks.length < MAX_DECKS_USER;

  const handleCreateDeck = (
    title: string,
    mainDeck: Card[],
    extraDeck: Card[]
  ) => {
    const mainDeckCards = mainDeck.map((card) => card.id);
    const extraDeckCards = extraDeck.map((card) => card.id);

    createDeck(
      { title, mainDeckCards, extraDeckCards },
      {
        onSuccess: () => {
          setIsCreatingNew(false);
        },
        onError: (error) => {
          console.error("Error creating deck:", error);
          alert("Failed to create deck. Please try again.");
        },
      }
    );
  };

  const handleDeleteDeck = (deckId: number, deckTitle: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${deckTitle}"?`
    );
    if (!confirmed) return;

    deleteDeck(deckId, {
      onError: (error) => {
        console.error("Error deleting deck:", error);
        alert("Failed to delete deck. Please try again.");
      },
    });
  };

  const handleDeckClick = (deck: CustomDeck) => {
    setSelectedDeck(deck);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-cyan-400 text-lg">Loading decks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Deck Section */}
      {isOwner && !isCreatingNew && (
        <div className="relative group">
          <button
            onClick={() => canCreateMore && setIsCreatingNew(true)}
            disabled={!canCreateMore}
            className={`w-full p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
              canCreateMore
                ? "border-cyan-500/40 hover:border-cyan-500/60 bg-gradient-to-br from-slate-900/40 to-blue-950/40 hover:from-slate-900/60 hover:to-blue-950/60 cursor-pointer"
                : "border-slate-700/40 bg-gradient-to-br from-slate-900/20 to-slate-800/20 cursor-not-allowed"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Plus
                className={`w-12 h-12 ${
                  canCreateMore ? "text-cyan-400" : "text-slate-600"
                }`}
              />
              <span
                className={`text-lg font-bold ${
                  canCreateMore ? "text-cyan-300" : "text-slate-500"
                }`}
              >
                Create New Deck
              </span>
              <span
                className={`text-sm ${
                  canCreateMore ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {decks.length}/{MAX_DECKS_USER} decks
              </span>
            </div>
          </button>
          {!canCreateMore && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-900/95 border border-yellow-500/50 rounded-lg px-4 py-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">
                  Maximum deck limit reached (10 decks for regular users)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deck Creation Form */}
      {isCreatingNew && (
        <CustomDeckEditor
          onSave={handleCreateDeck}
          onCancel={() => setIsCreatingNew(false)}
          isSaving={isCreating}
        />
      )}

      {/* Existing Decks Grid */}
      {decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="relative group bg-gradient-to-br from-slate-900/80 to-blue-950/80 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleDeckClick(deck)}
            >
              {/* Deck Preview */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-bold text-lg truncate flex-1">
                    {deck.title}
                  </h3>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id, deck.title);
                      }}
                      disabled={isDeleting}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyan-400 font-semibold">Main:</span>
                    <span className="text-white">{deck.mainDeck.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400 font-semibold">Extra:</span>
                    <span className="text-white">{deck.extraDeck.length}</span>
                  </div>
                </div>

                {/* Card Preview Grid */}
                <div className="mt-4 grid grid-cols-10 gap-1">
                  {deck.mainDeck.slice(0, 10).map((card, idx) => (
                    <img
                      key={`preview-${idx}`}
                      src={card.imageUrlSmall}
                      alt={card.name}
                      className="w-full h-auto rounded border border-slate-600"
                    />
                  ))}
                  {deck.mainDeck.length > 10 && (
                    <div className="flex items-center justify-center bg-slate-800/50 rounded border border-slate-600 text-xs text-slate-400">
                      +{deck.mainDeck.length - 10}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-400">
                  Click to view full deck
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {decks.length === 0 && !isCreatingNew && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-4">
            {isOwner
              ? "No decks yet. Create your first custom deck!"
              : "This user hasn't created any decks yet."}
          </p>
        </div>
      )}

      {/* Deck Modal */}
      {selectedDeck && (
        <CustomDeckModal
          deck={selectedDeck}
          onClose={() => setSelectedDeck(null)}
        />
      )}
    </div>
  );
};
