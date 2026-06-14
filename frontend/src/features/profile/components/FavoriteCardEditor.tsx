import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FloatingCardSearchModal } from "@/features/archetypes/components/FloatingCardSearchModal";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import { useFavoriteCards } from "../hooks/useFavoriteCards";
import { getOptimizedCardImageUrl } from "@/lib/utils/imageOptimization";
import { Wand2, Layers, ScanSearch } from "lucide-react";
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
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [useCropped, setUseCropped] = useState(false);
  const { favoriteCard, isLoading } = useFavoriteCards(cardId);

  const displayCard = selectedCard || favoriteCard;

  // Reset selected card when cancelling edit mode
  useEffect(() => {
    if (!isEditMode) {
      setSelectedCard(null);
    }
  }, [isEditMode]);

  // Load persisted crop preference when card resolves
  useEffect(() => {
    if (displayCard) {
      const saved = localStorage.getItem(`card_cropped_${displayCard.id}`);
      setUseCropped(saved === 'true');
    }
  }, [displayCard?.id, displayCard]);

  const toggleCropped = () => {
    const next = !useCropped;
    setUseCropped(next);
    if (displayCard) {
      localStorage.setItem(`card_cropped_${displayCard.id}`, String(next));
    }
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    onCardSelect(card);
    setIsSearchModalOpen(false);
  };

  const handleImageView = (imageUrl: string) => {
    setViewingCardUrl(imageUrl);
  };

  return (
    <>
      <div className="flex flex-col items-center w-full px-5">
        {displayCard ? (
          <div className="relative group flex flex-col items-center">
            {/* Ambient glow behind card */}
            <div className="absolute -inset-10 bg-amber-500/[0.06] blur-3xl rounded-full pointer-events-none" />

            {/* Card with gradient frame */}
            <div className="relative scale-[1.04] hover:scale-[1.07] transition-transform duration-300">
              <div
                className="p-[2px] rounded-sm shadow-2xl shadow-amber-700/30"
                style={{ background: 'linear-gradient(175deg, rgba(234,179,8,0.90) 0%, rgba(210,145,0,0.78) 50%, rgba(180,115,0,0.58) 80%, rgba(100,65,0,0.12) 100%)' }}
              >
                <div className={`w-[230px] overflow-hidden rounded-[2px] bg-[#050310] ${useCropped ? 'aspect-square' : 'aspect-[10/14]'}`}>
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Loading...</span>
                    </div>
                  ) : (
                    <CardTooltip
                      cardId={displayCard.id}
                      imageUrl={displayCard.imageUrl}
                      cardName={displayCard.name}
                    >
                      <img
                        src={useCropped
                          ? (getOptimizedCardImageUrl(displayCard.imageUrlCropped, { size: 'thumbnail', width: 700, height: 700 }) ?? displayCard.imageUrlCropped)
                          : displayCard.imageUrl
                        }
                        alt="Favorite card"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300"
                        onClick={() => handleImageView(useCropped ? displayCard.imageUrlCropped : displayCard.imageUrl)}
                      />
                    </CardTooltip>
                  )}
                </div>
              </div>

              {isEditMode && (
                <button
                  onClick={(e) => {
                    setAnchorElement(e.currentTarget);
                    setIsSearchModalOpen(true);
                  }}
                  className="absolute top-1.5 right-1.5 z-10 w-7 h-7 flex items-center justify-center bg-[#08041a] border border-amber-500/70 hover:border-amber-400 hover:bg-amber-900/30 transition-colors shadow-lg shadow-black/60"
                  title="Change card"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>

            {/* Card name */}
            <div className="mt-4 w-full text-center px-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 max-w-[36px] bg-gradient-to-r from-transparent to-yellow-600/35" />
                <p className="text-amber-200/75 font-semibold text-[11px] tracking-[0.12em] uppercase truncate max-w-[175px]">
                  {displayCard.name}
                </p>
                <div className="h-px flex-1 max-w-[36px] bg-gradient-to-l from-transparent to-yellow-600/35" />
              </div>
            </div>

            {/* Art mode toggle — only in edit mode */}
            {isEditMode && (
              <button
                onClick={toggleCropped}
                className="relative mt-3 group flex items-center gap-1.5 px-3 py-1.5 overflow-hidden rounded"
              >
                <div className="absolute inset-0 border border-amber-600/35 rounded group-hover:border-amber-500/55 transition-colors" />
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
                <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
                {useCropped ? (
                  <Layers className="relative w-3 h-3 text-amber-400/80" />
                ) : (
                  <ScanSearch className="relative w-3 h-3 text-amber-400/80" />
                )}
                <span className="relative text-amber-300/75 text-[10px] tracking-[0.18em] uppercase font-bold group-hover:text-amber-300 transition-colors">
                  {useCropped ? "Full Art" : "Art Crop"}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-[187px]">
            {isEditMode ? (
              <button
                onClick={(e) => {
                  setAnchorElement(e.currentTarget);
                  setIsSearchModalOpen(true);
                }}
                className="w-full aspect-[10/14] bg-purple-950/40 border-2 border-dashed border-amber-600/40 rounded-lg flex items-center justify-center hover:border-amber-500/60 hover:bg-purple-950/60 transition-colors"
              >
                <div className="text-center">
                  <Wand2 className="w-8 h-8 text-amber-400/70 mx-auto mb-2" />
                  <p className="text-amber-300/80 text-[10px] font-bold tracking-[0.18em] uppercase">
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
      </div>

      {/* Modal rendered via portal — escapes CSS transform stacking context */}
      {viewingCardUrl && createPortal(
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setViewingCardUrl(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center">
            <img
              src={viewingCardUrl}
              alt="Card view"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}

      <FloatingCardSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setAnchorElement(null);
        }}
        onSelectCard={handleCardSelect}
        title="Select Your Favorite Card"
        anchorElement={anchorElement}
        autoCloseAfterSelect={true}
      />
    </>
  );
};
