import { useState } from "react";
import { Plus, Info, Lock } from "lucide-react";
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
  const { decks, isLoading, createDeck, updateDeck, deleteDeck, isCreating, isUpdating, isDeleting } =
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

  const handleUpdateDeck = (deckId: number, updates: { mainDeckCards?: number[]; extraDeckCards?: number[]; isPublic?: boolean }) => {
    updateDeck(
      { deckId, ...updates },
      {
        onError: (error) => {
          console.error("Error updating deck:", error);
          alert("Failed to update deck. Please try again.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Deck Creation Form */}
      {isCreatingNew && (
        <CustomDeckEditor
          onSave={handleCreateDeck}
          onCancel={() => setIsCreatingNew(false)}
          isSaving={isCreating}
        />
      )}

      {/* Existing Decks Grid */}
      {(decks.length > 0 || (isOwner && !isCreatingNew)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const canView = isOwner || deck.isPublic;
            const previewCards = deck.extraDeck.length > 0 ? deck.extraDeck : deck.mainDeck;
            
            return (
              <div
                key={deck.id}
                className="relative group bg-gradient-to-br from-slate-900/80 to-blue-950/80 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleDeckClick(deck)}
              >
                {/* Deck Preview */}
                {canView ? (
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-base truncate flex-1">
                        {deck.title}
                      </h3>
                      {!deck.isPublic && (
                        <div className="p-2 rounded-lg bg-slate-700/50">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-cyan-400 font-semibold">Main:</span>
                        <span className="text-white">{deck.mainDeck.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-purple-400 font-semibold">Extra:</span>
                        <span className="text-white">{deck.extraDeck.length}</span>
                      </div>
                    </div>

                    {/* Card Preview Grid */}
                    <div className="mt-3 grid grid-cols-10 gap-1">
                      {previewCards.slice(0, 10).map((card, idx) => (
                        <img
                          key={`preview-${idx}`}
                          src={card.imageUrlSmall}
                          alt={card.name}
                          className="w-full h-auto rounded border border-slate-600"
                        />
                      ))}
                      {previewCards.length > 10 && (
                        <div className="flex items-center justify-center bg-slate-800/50 rounded border border-slate-600 text-xs text-slate-400">
                          +{previewCards.length - 10}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                      Click to view full deck
                    </div>
                  </div>
                ) : (
                  <div className="p-3 flex flex-col items-center justify-center h-full min-h-[160px]">
                    <Lock className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold">{deck.title}</p>
                    <p className="text-slate-500 text-xs mt-1">Status: Private</p>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}

          {/* Create New Deck Placeholder - Last in Grid */}
          {isOwner && !isCreatingNew && (
            <div className="relative group" style={{ gridColumn: "span 1" }}>
              <button
                onClick={() => canCreateMore && setIsCreatingNew(true)}
                disabled={!canCreateMore}
                className={`w-full h-full min-h-[200px] p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                  canCreateMore
                    ? "border-cyan-500/40 hover:border-cyan-500/60 bg-gradient-to-br from-slate-900/40 to-blue-950/40 hover:from-slate-900/60 hover:to-blue-950/60 cursor-pointer"
                    : "border-slate-700/40 bg-gradient-to-br from-slate-900/20 to-slate-800/20 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  <Plus
                    className={`w-10 h-10 ${
                      canCreateMore ? "text-cyan-400" : "text-slate-600"
                    }`}
                  />
                  <span
                    className={`text-base font-bold ${
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
                  <div className="bg-slate-900/95 border border-yellow-500/50 rounded-lg px-4 py-2 flex items-center gap-2 mx-4">
                    <Info className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-300">
                      Maximum deck limit reached (10 decks for regular users)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
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
          isOwner={isOwner}
          onClose={() => setSelectedDeck(null)}
          onUpdate={handleUpdateDeck}
          onDelete={handleDeleteDeck}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
