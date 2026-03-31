import { CardTooltip } from "@/features/archetypes/components/CardTooltip";
import type { Card } from "../types";

interface CardGridProps {
  cards: Card[];
  isLoading?: boolean;
}

export const CardGrid = ({ cards, isLoading }: CardGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 30 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[59/86] bg-slate-800/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-400 text-lg">No cards found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
      {cards.map((card) => {
        const imageUrl = card.imageUrlExternal || "";
        const imageUrlSmall = card.imageUrlSmallExternal || imageUrl;

        return (
          <div
            key={card.id}
            className="aspect-[59/86] group cursor-pointer transition-transform hover:scale-105"
          >
            <CardTooltip cardId={card.id} imageUrl={imageUrl} cardName={card.name}>
              <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-slate-700 group-hover:border-cyan-500/50 transition-colors shadow-lg">
                <img
                  src={imageUrlSmall}
                  alt={card.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to full image if small version fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== imageUrl && imageUrl) {
                      target.src = imageUrl;
                    }
                  }}
                />
                
                {/* Card name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-semibold line-clamp-2">
                    {card.name}
                  </p>
                </div>
              </div>
            </CardTooltip>
          </div>
        );
      })}
    </div>
  );
};
