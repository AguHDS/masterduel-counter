import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Info, Layers } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <div className="text-cyan-400/70 text-sm">Loading decks...</div>
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
        <div className="grid grid-cols-2 min-[1200px]:grid-cols-3 min-[1420px]:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
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
                onClick={() => !isDragging && handleDeckClick(deck)}
                className={`relative rounded-lg overflow-hidden shadow-[0_4px_30px_2px_rgba(0,0,0,0.7)] group transition-all duration-300 ${
                  isOwner ? 'cursor-move' : 'cursor-pointer'
                } ${isDragging ? 'opacity-40 scale-95' : ''} ${
                  isDragOver ? 'ring-2 ring-cyan-400 scale-[1.03]' : 'hover:-translate-y-1'
                }`}
              >
                <div className="w-full aspect-[4/3.75] overflow-hidden relative">
                  {previewCard ? (
                    <img
                      src={getOptimizedCardImageUrl(previewCard.imageUrlCropped, { size: 'thumbnail', width: 400, height: 400 })}
                      alt={previewCard.name}
                      className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
                        !canView ? "opacity-50 grayscale" : ""
                      }`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800/60 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="absolute top-0.5 right-2 z-10">
                  {deck.isPublic ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/70 text-slate-300 border border-slate-600/40 backdrop-blur-sm">
                      Private
                    </span>
                  )}
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                  style={{
                    background: "linear-gradient(to top, rgba(8,10,25,0.92) 50%, rgba(8,10,20,0.0) 100%)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                >
                  <p className={`text-slate-100 font-bold text-xs truncate ${!canView ? "text-slate-500" : ""}`}>
                    {deck.title}
                  </p>
                  {canView && (
                    <div className="text-[10px] mt-0.5 flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/25">
                        <span className="text-cyan-400 font-semibold">Main</span>
                        <span className="text-slate-200 font-bold">{deck.mainDeck.length}</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/25">
                        <span className="text-purple-400 font-semibold">Extra</span>
                        <span className="text-slate-200 font-bold">{deck.extraDeck.length}</span>
                      </span>
                      {deck.sideDeck.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25">
                          <span className="text-amber-400 font-semibold">Side</span>
                          <span className="text-slate-200 font-bold">{deck.sideDeck.length}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isOwner && !isCreatingNew && (
            <div
              className={`relative group transition-all duration-300 ${
                canCreateMore ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'
              }`}
              onClick={() => canCreateMore && setIsCreatingNew(true)}
            >
              <div className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 aspect-[4/3.75] shadow-[0_4px_30px_2px_rgba(0,0,0,0.7)] ${
                canCreateMore
                  ? "border-cyan-500/40 hover:border-cyan-400/70 bg-gradient-to-b from-[#1a1545]/50 to-[#1e1850]/50 hover:from-[#1a1545]/70 hover:to-[#1e1850]/70 hover:shadow-[0_6px_35px_4px_rgba(0,0,0,0.75)]"
                  : "border-[#3d3470]/40 bg-gradient-to-b from-[#1a1545]/20 to-[#1e1850]/20"
              }`}>
                <Plus className={`transition-all duration-300 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mb-1.5 ${
                  canCreateMore ? "text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110" : "text-slate-600"
                }`} />

                <h3 className={`text-xs font-bold text-center mb-0.5 px-2 ${
                  canCreateMore ? "text-cyan-300 group-hover:text-cyan-200" : "text-slate-500"
                }`}>
                  Create New Deck
                </h3>

                <p className={`text-[10px] text-center ${
                  canCreateMore ? "text-slate-400" : "text-slate-600"
                }`}>
                  {isAdmin ? `${sortedDecks.length}/\u221E` : `${sortedDecks.length}/${maxDecks}`}
                </p>

                {!canCreateMore && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 rounded-lg pointer-events-none">
                    <div className="flex items-start gap-2 px-3 py-2">
                      <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-yellow-300">Maximum deck limit reached</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {sortedDecks.length === 0 && !isCreatingNew && (
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#3d3470]/50 bg-gradient-to-b from-[#1a1545]/30 to-[#1e1850]/30 p-8 max-[399px]:p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-cyan-400/60" />
            </div>
            <p className="text-slate-400 text-base max-[399px]:text-sm font-medium mb-2">
              {isOwner
                ? "No decks yet"
                : "No decks created"}
            </p>
            <p className="text-slate-500 text-sm max-[399px]:text-xs">
              {isOwner
                ? "Create your first custom deck to get started!"
                : "This user hasn't created any decks yet."}
            </p>
            {isOwner && (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Deck
              </button>
            )}
          </div>
        </div>
      )}

      {isOwner && userRole === "user" && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1545]/60 via-[#1e1850]/60 to-[#1a1545]/60 rounded-lg border-2 border-[#3d3470]/50 text-center">
          <p className="text-sm text-gray-300">
            Need more space?{" "}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-support"))}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Support us
            </button>{" "}
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
