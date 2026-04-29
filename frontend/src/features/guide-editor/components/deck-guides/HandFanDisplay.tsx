import { X } from "lucide-react";
import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "@/features/archetypes/types";

interface HandFanDisplayProps {
  cards: Card[];
  /** When true an X button shows on hover to remove a card */
  isEditing?: boolean;
  onRemoveCard?: (cardIndex: number) => void;
}

/** Returns the rotation angle (degrees) for a card at a given index in a fan of totalCards. */
export const getCardFanRotation = (
  index: number,
  totalCards: number,
): number => {
  if (totalCards === 1) return 0;
  const maxRotation =
    totalCards === 5
      ? 60
      : totalCards === 4
        ? 50
        : totalCards === 3
          ? 45
          : totalCards === 2
            ? 25
            : 0;
  const step = (maxRotation * 2) / (totalCards - 1);
  return -maxRotation + step * index;
};
/**
 * Displays a hand of cards in a fan layout with rotation and elevation
 * Used in initial hands and final board preview to show cards held in hand
 */
export const getCardFanTranslateY = (
  index: number,
  totalCards: number,
): number => {
  if (totalCards === 1) return 14;
  const center = (totalCards - 1) / 2;
  const distanceFromCenter = Math.abs(index - center);

  const maxElevation =
    totalCards === 5
      ? 22
      : totalCards === 4
        ? 20
        : totalCards === 3
          ? 22
          : totalCards === 2
            ? 15
            : 0;
  const dropFactor =
    totalCards === 5 ? 3.5 : totalCards === 4 ? 3.8 : totalCards === 3 ? 4 : 3;

  return maxElevation - distanceFromCenter * distanceFromCenter * dropFactor;
};

/**
 * Renders a fanned-out set of card images
 */
export const HandFanDisplay = ({
  cards,
  isEditing = false,
  onRemoveCard,
}: HandFanDisplayProps) => {
  if (cards.length === 0) {
    return <div className="text-gray-500 text-xs">Empty</div>;
  }

  return (
    <div className="relative flex justify-center items-end h-full w-full scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100">
      {cards.map((card, cardIndex) => {
        const rotation = getCardFanRotation(cardIndex, cards.length);
        const translateY = getCardFanTranslateY(cardIndex, cards.length);
        const zIndex = cardIndex;
        const spacingScale =
          cards.length === 5
            ? 15
            : cards.length === 4
              ? 14
              : cards.length === 3
                ? 16
                : cards.length === 2
                  ? 12
                  : 0;
        const horizontalOffset =
          (cardIndex - (cards.length - 1) / 2) * spacingScale;

        return (
          <div
            key={`${card.id}-${cardIndex}`}
            className="absolute group"
            style={{
              transform: `translateX(${horizontalOffset}px) translateY(-${translateY}px) rotate(${rotation}deg)`,
              transformOrigin: "center bottom",
              zIndex: zIndex,
              transition: "transform 0.3s ease",
              bottom: "0",
            }}
          >
            <CardTooltip
              cardId={card.id}
              imageUrl={card.imageUrl}
              cardName={card.name}
            >
              <img
                src={card.imageUrlSmall}
                alt={card.name}
                className="w-14 h-20 object-cover hover:scale-110 hover:-translate-y-6 transition-all"
              />
            </CardTooltip>

            {isEditing && onRemoveCard && (
              <button
                onClick={() => onRemoveCard(cardIndex)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-[9999] group-hover:-translate-y-6"
                title="Remove card"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
