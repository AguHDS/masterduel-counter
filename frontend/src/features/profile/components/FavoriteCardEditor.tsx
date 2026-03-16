import { useState } from "react";
import { CardSearchModal } from "@/features/archetypes/components/CardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { useFavoriteCards } from "../hooks/useFavoriteCards";
import border_profile from "@/assets/MDC-border.webp";
import { Edit } from "lucide-react";
import type { Card } from "@/features/archetypes/types";

interface FavoriteCardEditorProps {
  cardId: number | null;
  isEditMode: boolean;
  onCardSelect: (card: Card) => void;
}

export const FavoriteCardEditor = ({
  cardId,
  isEditMode,
  onCardSelect,
}: FavoriteCardEditorProps) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [viewingCardUrl, setViewingCardUrl] = useState<string | null>(null);
  const { favoriteCard, isLoading } = useFavoriteCards(cardId, []);

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    onCardSelect(card);
    setIsSearchModalOpen(false);
  };

  const handleImageView = (imageUrl: string) => {
    setViewingCardUrl(imageUrl);
  };

  const displayCard = selectedCard || favoriteCard;

  return (
    <div className="w-auto">
      <h2 className="text-yellow-500 text-center font-bold text-lg mb-4">
        Favorite Card
      </h2>

      {displayCard ? (
        <div className="relative group mx-auto max-w-[178px]">
          <div className="absolute -inset-1 bg-gradient-to-br from-yellow-600 to-amber-600 rounded blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
          <div
            className="relative rounded overflow-hidden"
            style={{
              borderImage: `url(${border_profile}) 18 stretch`,
              borderWidth: "8px",
            }}
          >
            {isLoading ? (
              <div className="w-full aspect-[10/14] bg-slate-700 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Loading...</span>
              </div>
            ) : (
              <CardTooltip
                cardId={displayCard.id}
                imageUrl={displayCard.imageUrl}
                cardName={displayCard.name}
              >
                <img
                  src={displayCard.imageUrl}
                  alt="Favorite card"
                  className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageView(displayCard.imageUrl)}
                />
              </CardTooltip>
            )}
          </div>
          {isEditMode && (
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="absolute top-2 right-2 p-2 bg-blue-600/90 hover:bg-blue-700 rounded-full transition-colors z-10"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-[160px]">
          {isEditMode ? (
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full aspect-[10/14] bg-purple-950/40 border-2 border-dashed border-yellow-600/50 rounded-lg flex items-center justify-center hover:border-yellow-600 hover:bg-purple-950/60 transition-colors"
            >
              <div className="text-center">
                <Edit className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-400 text-sm font-semibold">
                  Select Card
                </p>
              </div>
            </button>
          ) : (
            <div className="w-full aspect-[10/14] bg-purple-950/40 border-2 border-yellow-600/30 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-sm text-center px-2">
                No favorite card
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal para visualizar carta */}
      {viewingCardUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setViewingCardUrl(null)}
        >
          <div className="relative top-7 max-w-3xl w-full max-h-[80vh] flex items-center justify-center">
            <button
              onClick={() => setViewingCardUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            >
            </button>
            <img
              src={viewingCardUrl}
              alt="Card view"
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <CardSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCard={handleCardSelect}
        title="Select Your Favorite Card"
        variant="center"
        keepOpenAfterSelect={false}
        autoCloseAfterSelect={true}
      />
    </div>
  );
};
