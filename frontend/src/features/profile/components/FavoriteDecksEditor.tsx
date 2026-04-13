import { useState } from "react";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import border_profile from "@/assets/MDC-border.webp";
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

  // Estado para el visualizador de cartas (ahora guarda la URL)
  const [viewingCardUrl, setViewingCardUrl] = useState<string | null>(null);

  const { favoriteDecksWithCards, isLoading } = useFavoriteCards(
    null,
    favoriteDecks,
  );

  const handleStartEdit = (slotIndex: number, anchor?: HTMLElement) => {
    if (anchor) {
      setAnchorElement(anchor);
      // Calculate floating position for archetype modal
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
      const newDeck = {
        archetypeId: selectedArchetype.id,
        archetypeName: selectedArchetype.name,
        cardId: card.id,
      };

      // Ensure we have exactly 3 slots with nulls for empty positions
      const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
      // Pad with nulls if needed
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
    // Create a copy and set the slot to null instead of removing it
    const newDecks: (FavoriteDeck | null)[] = [...favoriteDecks];
    newDecks[slotIndex] = null;
    onDecksUpdate(newDecks);
  };

  // Función para manejar el clic en la imagen (ahora recibe URL)
  const handleImageView = (imageUrl: string) => {
    setViewingCardUrl(imageUrl);
  };

  const slots = [0, 1, 2];

  return (
    <div>
      <div className="flex items-center gap-4 mb-9">
        <h2 className="text-yellow-500 font-bold text-lg whitespace-nowrap">
          Favorite Decks
        </h2>
        <div className="flex-1 border-t border-yellow-600"></div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-10 xl:gap-16 2xl:gap-24 max-sm:flex-wrap lg:max-xl:flex-wrap">
        {slots.map((slotIndex) => {
          const deckWithCard = favoriteDecksWithCards[slotIndex];
          const deck = favoriteDecks[slotIndex];

          return (
            <div
              key={slotIndex}
              className="relative w-[180px] min-w-[140px] flex-shrink max-sm:flex-shrink-0 lg:max-xl:flex-shrink-0"
            >
              {deck ? (
                <div className="relative h-[220px] group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-yellow-600 to-amber-600 rounded blur opacity-30 group-hover:opacity-60 transition-opacity"></div>

                  <div
                    className="relative rounded-lg overflow-hidden w-full h-full"
                    style={{
                      borderImage: `url(${border_profile}) 18 stretch`,
                      borderWidth: "9px",
                    }}
                  >
                    {isLoading || !deckWithCard?.card ? (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 text-sm">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <img
                        src={deckWithCard.card.imageUrlCropped}
                        alt={deck.archetypeName}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          if (deckWithCard.card?.imageUrlCropped) {
                            handleImageView(deckWithCard.card.imageUrlCropped);
                          }
                        }}
                      />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-950/90 to-transparent p-3">
                      <p className="text-slate-200/90 font-bold text-center text-base">
                        {deck.archetypeName}
                      </p>
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={(e) => handleStartEdit(slotIndex, e.currentTarget)}
                        className="p-2 bg-blue-600/90 hover:bg-blue-700 rounded-full transition-colors"
                      >
                        <Edit className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => handleRemoveDeck(slotIndex)}
                        className="p-2 bg-red-600/90 hover:bg-red-700 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[168/280]">
                  {isEditMode ? (
                    <button
                      onClick={(e) => handleStartEdit(slotIndex, e.currentTarget)}
                      className="w-full h-[220px] bg-purple-950/40 border-2 border-dashed border-yellow-600/50 rounded-lg flex items-center justify-center hover:border-yellow-600 hover:bg-purple-950/60 transition-colors"
                    >
                      <div className="text-center">
                        <Edit className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                        <p className="text-yellow-400 text-sm font-semibold">
                          Add Deck
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full h-[220px] bg-purple-950/40 border-2 border-yellow-600/30 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-xs text-center px-2">
                        Empty slot
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para visualizar carta (usando URL) */}
      {viewingCardUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setViewingCardUrl(null)}
        >
          <div className="relative top-5 max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setViewingCardUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            ></button>
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
