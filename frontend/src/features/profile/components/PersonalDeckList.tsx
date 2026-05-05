import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Info } from "lucide-react";
import { useCustomDecks } from "../hooks/useCustomDecks";
import { PersonalDeckModal } from "./PersonalDeckModal";
import type { CustomDeck } from "../api/customDeckApi";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";

interface PersonalDeckListProps {
  userId: string;
  isOwner: boolean;
  userRole?: string;
  initialSelectedDeckId?: number | null;
  onDeckOpened?: () => void;
}

const MAX_DECKS_USER = 10;
const MAX_DECKS_SUPPORTER = 30;

export const PersonalDeckList = ({
  userId,
  isOwner,
  userRole,
  initialSelectedDeckId,
  onDeckOpened,
}: PersonalDeckListProps) => {
  const {
    decks,
    isLoading,
    createDeck,
    updateDeck,
    deleteCustomDeck,
    reorderDecks,
    isUpdating,
    isDeleting,
  } = useCustomDecks(userId);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<CustomDeck | null>(null);
  const [draggedDeckId, setDraggedDeckId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-open a deck when navigated from Favorite Decks
  useEffect(() => {
    if (!initialSelectedDeckId || decks.length === 0) return;
    const target = decks.find((d) => d.id === initialSelectedDeckId);
    if (target) {
      setSelectedDeck(target);
      onDeckOpened?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedDeckId, decks]);

  // Sort by displayOrder (ascending)
  const sortedDecks = [...decks].sort((a, b) => a.displayOrder - b.displayOrder);

  const normalizedRole = (userRole || "user").toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const maxDecks = isAdmin
    ? Number.POSITIVE_INFINITY
    : normalizedRole === "supporter"
      ? MAX_DECKS_SUPPORTER
      : MAX_DECKS_USER;
  const canCreateMore = isAdmin || sortedDecks.length < maxDecks;

  const handleCreateDeck = (
    data: { title: string; mainDeckCards: number[]; extraDeckCards: number[]; sideDeckCards: number[]; headerCardId?: number; isPublic: boolean }
  ) => {
    createDeck(
      data,
      {
        onSuccess: () => setIsCreatingNew(false),
        onError: (error) => {
          console.error("Error creating deck:", error);
          let errorMessage = "Failed to create deck. Please try again.";

          if (axios.isAxiosError(error)) {
            const backendMessage =
              (error.response?.data as { error?: string; message?: string } | undefined)
                ?.error ||
              (error.response?.data as { error?: string; message?: string } | undefined)
                ?.message ||
              error.message;

            if (backendMessage) {
              if (/no cards|at least one card|invalid deck data/i.test(backendMessage)) {
                errorMessage =
                  "You must add at least one card to Main Deck or Extra Deck before saving.";
              } else {
                errorMessage = backendMessage;
              }
            }
          }

          alert(errorMessage);
        },
      },
    );
  };

  const handleDeleteDeck = (deckId: number, deckTitle: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${deckTitle}"?`,
    );
    if (!confirmed) return;

    deleteCustomDeck(deckId, {
      onError: (error) => {
        console.error("Error deleting deck:", error);
        alert("Failed to delete deck. Please try again.");
      },
    });
  };

  const handleDeckClick = (deck: CustomDeck) => {
    setSelectedDeck(deck);
  };

  const handleUpdateDeck = (
    deckId: number,
    updates: {
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      sideDeckCards?: number[];
      headerCardId?: number;
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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, deckId: number) => {
    if (!isOwner) return;
    setDraggedDeckId(deckId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedDeckId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!isOwner || draggedDeckId === null) return;

    const draggedIndex = sortedDecks.findIndex(d => d.id === draggedDeckId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedDeckId(null);
      setDragOverIndex(null);
      return;
    }

    // Create new order array
    const reorderedDecks = [...sortedDecks];
    const [draggedDeck] = reorderedDecks.splice(draggedIndex, 1);
    reorderedDecks.splice(dropIndex, 0, draggedDeck);

    // Create update array with new display orders
    const deckOrders = reorderedDecks.map((deck, index) => ({
      deckId: deck.id,
      displayOrder: index,
    }));

    // Call API to persist the new order
    reorderDecks(deckOrders, {
      onError: (error) => {
        console.error("Error reordering decks:", error);
        alert("Failed to reorder decks. Please try again.");
      },
    });

    setDraggedDeckId(null);
    setDragOverIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-cyan-400 text-lg">Loading decks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isCreatingNew && (
        <PersonalDeckModal
          isOwner={true}
          onClose={() => setIsCreatingNew(false)}
          onSave={handleCreateDeck}
        />
      )}

      {(sortedDecks.length > 0 || (isOwner && !isCreatingNew)) && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {sortedDecks.map((deck, index) => {
            const canView = isOwner || deck.isPublic;
            
            // Determine preview card - use headerCard directly if available
            let previewCard = null;
            if (deck.headerCard) {
              previewCard = deck.headerCard;
            } else {
              // Fallback to default logic if no header card
              const previewCards = deck.extraDeck.length > 0 ? deck.extraDeck : deck.mainDeck;
              previewCard = previewCards[0];
            }

            const isDragging = draggedDeckId === deck.id;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={deck.id}
                draggable={isOwner}
                onDragStart={(e) => handleDragStart(e, deck.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group transition-all duration-200 ${
                  isOwner ? 'cursor-move' : 'cursor-pointer'
                } ${isDragOver ? 'scale-105' : ''} ${isDragging ? 'opacity-40' : ''}`}
                onClick={() => !isDragging && handleDeckClick(deck)}
              >
                {canView && (
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 rounded-lg opacity-0 ${isDragOver ? 'opacity-100' : ''}`} />
                )}

                <div className={`relative bg-gradient-to-b from-blue-900/90 via-slate-900 to-blue-900/90 rounded-lg border-2 transition-all duration-100 overflow-hidden ${
                  isDragOver ? 'border-cyan-400' : 'border-[#3d3470]/70 group-hover:border-cyan-400/80'
                }`}>
                  {/* Public/Private label */}
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

                  <div className="p-3 pt-0 relative">
                    {/* Preview Image */}
                    <div className="flex justify-center mb-3">
                      {previewCard ? (
                        <img
                          src={getOptimizedCardImageUrl(previewCard.imageUrlCropped, { size: 'thumbnail' })}
                          alt={previewCard.name}
                          className={`h-[80px] w-[80px] object-cover rounded border-2 border-[#4a5866] shadow-lg ${
                            !canView ? "opacity-60" : ""
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-[80px] h-[80px] bg-[#6a7888] rounded border-2 border-[#4a5866] flex items-center justify-center">
                          <span className="text-gray-700 text-xs font-semibold">
                            Empty
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Deck title */}
                    <div className="text-center mb-2">
                      <div className="flex items-center justify-center">
                        <h3
                          className={`text-sm font-bold truncate ${
                            canView ? "text-white" : "text-[#4a5866]"
                          }`}
                        >
                          {deck.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

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

          {isOwner && !isCreatingNew && (
            <div className="relative group">
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
                  <Plus
                    className={`w-10 h-10 mb-2 ${
                      canCreateMore
                        ? "text-cyan-400 group-hover:text-cyan-300"
                        : "text-slate-600"
                    }`}
                  />

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
                    {isAdmin ? `${sortedDecks.length}/∞` : `${sortedDecks.length}/${maxDecks}`}
                  </p>
                </div>
              </button>

              {!canCreateMore && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[10]">
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

      {sortedDecks.length === 0 && !isCreatingNew && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-4">
            {isOwner
              ? "No decks yet. Create your first custom deck!"
              : "This user hasn't created any decks yet."}
          </p>
        </div>
      )}

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

      {selectedDeck && (
        <PersonalDeckModal
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
