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
  userRole?: string;
}

const MAX_DECKS_USER = 10;
const MAX_DECKS_SUPPORTER = 30;

export const CustomDecksList = ({ userId, isOwner, userRole }: CustomDecksListProps) => {
  const {
    decks,
    isLoading,
    createDeck,
    updateDeck,
    deleteDeck,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomDecks(userId);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<CustomDeck | null>(null);

  // Sort decks by creation date (oldest first, so new decks appear at the end)
  const sortedDecks = [...decks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const maxDecks = userRole === "supporter" ? MAX_DECKS_SUPPORTER : MAX_DECKS_USER;
  const canCreateMore = sortedDecks.length < maxDecks;

  const handleCreateDeck = (
    title: string,
    mainDeck: Card[],
    extraDeck: Card[],
  ) => {
    const mainDeckCards = mainDeck.map((card) => card.id);
    const extraDeckCards = extraDeck.map((card) => card.id);

    createDeck(
      { title, mainDeckCards, extraDeckCards, isPublic: true },
      {
        onSuccess: () => {
          setIsCreatingNew(false);
        },
        onError: (error) => {
          console.error("Error creating deck:", error);
          alert("Failed to create deck. Please try again.");
        },
      },
    );
  };

  const handleDeleteDeck = (deckId: number, deckTitle: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${deckTitle}"?`,
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

  const handleUpdateDeck = (
    deckId: number,
    updates: {
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      isPublic?: boolean;
    },
  ) => {
    updateDeck(
      { deckId, ...updates },
      {
        onError: (error) => {
          console.error("Error updating deck:", error);
          alert("Failed to update deck. Please try again.");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Deck Creation Form */}
      {isCreatingNew && (
        <CustomDeckEditor
          onSave={handleCreateDeck}
          onCancel={() => setIsCreatingNew(false)}
          isSaving={isCreating}
        />
      )}

      {/* Existing Decks Grid */}
      {(sortedDecks.length > 0 || (isOwner && !isCreatingNew)) && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {sortedDecks.map((deck) => {
            const canView = isOwner || deck.isPublic;
            const previewCards =
              deck.extraDeck.length > 0 ? deck.extraDeck : deck.mainDeck;

            return (
              <div
                key={deck.id}
                className="relative group cursor-pointer"
                onClick={() => handleDeckClick(deck)}
              >
                {/* Glow border effect */}
                {canView && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
                )}

                {/* Main deck card */}
                <div className="relative bg-gradient-to-b from-blue-900/90 via-slate-900 to-blue-900/90 rounded-lg border-2 border-[#3d3470]/70 group-hover:border-cyan-400/80 transition-all duration-200 overflow-hidden">
                  {/* Public/Private Label - inside container */}
                  <div className="mb-1 flex justify-end">
                    {deck.isPublic ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-slate-300 shadow-lg">
                        <span>Public</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-slate-300 shadow-lg">
                        <span>Private</span>
                      </div>
                    )}
                  </div>

                  {canView ? (
                    <div className="p-3 pt-0">
                      {/* Preview Image */}
                      <div className="flex justify-center mb-3">
                        {previewCards.length > 0 ? (
                          <img
                            src={previewCards[0].imageUrlCropped}
                            alt={previewCards[0].name}
                            className="h-[80px] w-[80px] object-cover rounded border-2 border-[#4a5866] shadow-lg"
                          />
                        ) : (
                          <div className="w-[80px] h-[80px] bg-[#6a7888] rounded border-2 border-[#4a5866] flex items-center justify-center">
                            <span className="text-gray-700 text-xs font-semibold">
                              Empty
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Deck Title */}
                      <div className="text-center mb-2">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {deck.title}
                          </h3>
                          {!deck.isPublic && (
                            <Lock className="w-3 h-3 text-[#4a5866] flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 pt-0">
                      {/* Locked Icon */}
                      <div className="flex justify-center mb-3">
                        <div className="w-[80px] h-[80px] bg-[#6a7888] rounded border-2 border-[#4a5866] flex items-center justify-center">
                          <Lock className="w-8 h-8 text-[#4a5866]" />
                        </div>
                      </div>

                      {/* Locked Title */}
                      <div className="text-center">
                        <h3 className="text-sm font-bold text-[#4a5866] truncate">
                          {deck.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels OUTSIDE the card - below */}
                {canView && (
                  <div className="flex items-center justify-start gap-3 mt-2 px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-cyan-400 font-semibold">
                        Main:
                      </span>
                      <span className="text-xs text-white font-bold">
                        {deck.mainDeck.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-purple-400 font-semibold">
                        Extra Deck:
                      </span>
                      <span className="text-xs text-white font-bold">
                        {deck.extraDeck.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Create New Deck Placeholder */}
          {isOwner && !isCreatingNew && (
            <div className="relative group">
              {/* Glow border effect */}
              {canCreateMore && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              )}

              <button
                onClick={() => canCreateMore && setIsCreatingNew(true)}
                disabled={!canCreateMore}
                className={`relative w-full h-full min-h-[160px] rounded-lg border-2 transition-all duration-200 ${
                  canCreateMore
                    ? "border-dashed border-cyan-500/50 hover:border-cyan-400/70 bg-gradient-to-b from-[#1a1545]/60 to-[#1e1850]/60 hover:from-[#1a1545]/80 hover:to-[#1e1850]/80 cursor-pointer"
                    : "border-dashed border-[#3d3470]/50 bg-gradient-to-b from-[#1a1545]/30 to-[#1e1850]/30 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full p-4">
                  {/* Plus Icon */}
                  <Plus
                    className={`w-10 h-10 mb-2 ${
                      canCreateMore
                        ? "text-cyan-400 group-hover:text-cyan-300"
                        : "text-slate-600"
                    }`}
                  />

                  {/* Text */}
                  <h3
                    className={`text-sm font-bold text-center mb-1 ${
                      canCreateMore
                        ? "text-cyan-300 group-hover:text-cyan-200"
                        : "text-slate-500"
                    }`}
                  >
                    Create New Deck
                  </h3>
                  <p
                    className={`text-xs text-center ${
                      canCreateMore ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {sortedDecks.length}/{maxDecks}
                  </p>
                </div>
              </button>

              {!canCreateMore && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900/95 border border-yellow-500/50 rounded-lg px-3 py-2 mx-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-yellow-300">
                        Maximum deck limit reached
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {sortedDecks.length === 0 && !isCreatingNew && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-4">
            {isOwner
              ? "No decks yet. Create your first custom deck!"
              : "This user hasn't created any decks yet."}
          </p>
        </div>
      )}

      {/* Support Message - Only for role "user" */}
      {isOwner && userRole === "user" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1545]/60 via-[#1e1850]/60 to-[#1a1545]/60 rounded-lg border-2 border-[#3d3470]/50 text-center">
          <p className="text-sm text-gray-300">
            Need more space?{" "}
            <a
              href="https://www.paypal.com/paypalme/ponyrosa?locale.x=es_XC&country.x=AR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Support us
            </a>{" "}
            and gain +20 additional space!
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
