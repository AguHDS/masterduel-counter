import { useState } from "react";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import { CreditCard as Edit, X } from "lucide-react";
import { useFavoriteCards } from "../hooks/useFavoriteCards";
import { ArchetypeSearchModal } from "@/shared/components/modals/ArchetypeSearchModal";
import type { FavoriteDeck } from "../types/profileTypes";
import type { Card } from "@/features/archetypes/types";

interface FavoriteDecksEditorProps {
  favoriteDecks: (FavoriteDeck | null)[];
  isEditMode: boolean;
  onDecksUpdate: (decks: (FavoriteDeck | null)[]) => void;
}

export const FavoriteDecksEditor = ({
  favoriteDecks,
  isEditMode,
  onDecksUpdate,
}: FavoriteDecksEditorProps) => {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isArchetypeSearchOpen, setIsArchetypeSearchOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [archetypeModalPosition, setArchetypeModalPosition] = useState({ top: 0, left: 0 });
  const [viewingCardUrl, setViewingCardUrl] = useState<string | null>(null);

  const { favoriteDecksWithCards, isLoading } = useFavoriteCards(
    null,
    favoriteDecks,
  );

  const handleStartEdit = (slotIndex: number, anchor?: HTMLElement) => {
    if (anchor) {
      setAnchorElement(anchor);
      const rect = anchor.getBoundingClientRect();
      const modalWidth = 450;
      const modalHeight = 500;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right + 10;
      if (left + modalWidth > viewportWidth - 20) {
        left = rect.left - modalWidth - 10;
      }
      if (left < 20) {
        left = viewportWidth - modalWidth - 20;
      }

      let top = rect.top;
      if (top + modalHeight > viewportHeight - 20) {
        top = Math.max(20, viewportHeight - modalHeight - 20);
      }

      setArchetypeModalPosition({ top, left });
    }
    setEditingSlot(slotIndex);
    setIsArchetypeSearchOpen(true);
    setSelectedArchetype(null);
  };

  const handleArchetypeSelect = (
    archetypeId: number,
    archetypeName: string,
  ) => {
    setSelectedArchetype({ id: archetypeId, name: archetypeName });
    setIsArchetypeSearchOpen(false);
    setIsCardModalOpen(true);
  };

  const handleCardSelect = (card: Card) => {
    if (editingSlot !== null && selectedArchetype) {
      const newDeck: FavoriteDeck = {
        archetypeId: selectedArchetype.id,
        archetypeName: selectedArchetype.name,
        cardId: card.id,
      };

      const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
      while (newDecks.length < 3) {
        newDecks.push(null);
      }
      newDecks[editingSlot] = newDeck;

      onDecksUpdate(newDecks);
      setIsCardModalOpen(false);
      setEditingSlot(null);
      setSelectedArchetype(null);
    }
  };

  const handleRemoveDeck = (slotIndex: number) => {
    const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
    newDecks[slotIndex] = null;
    onDecksUpdate(newDecks);
  };

  const slots = [0, 1, 2];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-yellow-500 font-bold text-lg whitespace-nowrap">
          Favorite Decks
        </h2>
        <div className="flex-1 border-t border-yellow-600"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((slotIndex) => {
          const deckWithCard = favoriteDecksWithCards[slotIndex];
          const deck = favoriteDecks[slotIndex];

          return (
            <div key={slotIndex} className="relative group">
              {deck ? (
                <div
                  className="relative rounded-lg overflow-hidden shadow-lg shadow-black/50 group cursor-pointer"
                  style={{ background: "linear-gradient(to bottom, #111827, #0b0d14)" }}
                >
                  {/* Image: shifted downward so the face/upper art shows; overflow hidden clips the bottom */}
                  <div className="w-full aspect-[12/9] overflow-hidden relative">
                    {isLoading || !deckWithCard?.card ? (
                      <div className="w-full h-full bg-slate-800/60 flex items-center justify-center">
                        <span className="text-slate-500 text-sm">Loading...</span>
                      </div>
                    ) : (
                      <img
                        src={deckWithCard.card.imageUrlCropped}
                        alt={deck.archetypeName}
                        className="w-full h-[130%] object-cover object-top hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                          if (deckWithCard.card?.imageUrlCropped) {
                            setViewingCardUrl(deckWithCard.card.imageUrlCropped);
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Name bar: frosted glass over a semi-transparent dark bg */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2.5"
                    style={{
                      background: "linear-gradient(to top, rgba(8,10,25,0.92) 50%, rgba(8,10,20,0.0) 100%)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    <p className="text-slate-100 font-bold text-sm truncate">
                      {deck.archetypeName}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {deck.mainCount !== undefined && deck.extraCount !== undefined
                        ? `Main: ${deck.mainCount} · Extra: ${deck.extraCount}${deck.sideCount ? ` · Side: ${deck.sideCount}` : ""}`
                        : <span className="text-slate-600 italic text-[11px]">No deck stats</span>
                      }
                    </p>
                  </div>

                  {/* Edit controls on hover */}
                  {isEditMode && (
                    <div className="absolute top-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(slotIndex, e.currentTarget); }}
                        className="p-1.5 bg-blue-600/90 hover:bg-blue-700 rounded-full transition-colors shadow"
                      >
                        <Edit className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveDeck(slotIndex); }}
                        className="p-1.5 bg-red-600/90 hover:bg-red-700 rounded-full transition-colors shadow"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                isEditMode ? (
                  <button
                    onClick={(e) => handleStartEdit(slotIndex, e.currentTarget)}
                    className="w-full rounded-lg border-2 border-dashed border-yellow-600/40 bg-purple-950/20 hover:border-yellow-500/70 hover:bg-purple-950/40 transition-colors flex flex-col items-center justify-center py-10 gap-2"
                  >
                    <Edit className="w-6 h-6 text-yellow-500/70" />
                    <p className="text-yellow-400/80 text-sm font-semibold">Add Deck</p>
                  </button>
                ) : (
                  <div className="w-full rounded-lg border border-yellow-600/15 bg-purple-950/15 flex items-center justify-center py-10">
                    <p className="text-slate-600 text-xs">Empty slot</p>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Card image viewer */}
      {viewingCardUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setViewingCardUrl(null)}
        >
          <div className="relative top-5 max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={viewingCardUrl}
              alt="Card view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <ArchetypeSearchModal
        isOpen={isArchetypeSearchOpen}
        onClose={() => {
          setIsArchetypeSearchOpen(false);
          setEditingSlot(null);
        }}
        onSelectArchetype={handleArchetypeSelect}
        position={archetypeModalPosition}
      />

      <FloatingCardSearchModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingSlot(null);
          setSelectedArchetype(null);
          setAnchorElement(null);
        }}
        onSelectCard={handleCardSelect}
        title={`Select Card for ${selectedArchetype?.name || "Deck"}`}
        anchorElement={anchorElement}
        autoCloseAfterSelect={true}
      />
    </div>
  );
};
