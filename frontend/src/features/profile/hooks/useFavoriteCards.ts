import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { selectCard } from "@/features/archetypes/api/archetypesApi";
import type { Card } from '@/features/archetypes/types';

export const useFavoriteCards = (
  favoriteCardId: number | null,
) => {
  const cardIds: number[] = favoriteCardId ? [favoriteCardId] : [];

  // Fetch all cards in parallel
  const cardQueries = useQueries({
    queries: cardIds.map((cardId) => ({
      queryKey: ['card', cardId],
      queryFn: () => selectCard(cardId),
      staleTime: Infinity, // Cards don't change
      enabled: !!cardId,
    })),
  });

  const isLoading = cardQueries.some((query) => query.isLoading);
  const hasError = cardQueries.some((query) => query.isError);

  const cardsMap = new Map<number, Card>();
  cardQueries.forEach((query: UseQueryResult<Card>) => {
    if (query.data) {
      cardsMap.set(query.data.id, query.data);
    }
  });

  const favoriteCard = favoriteCardId ? cardsMap.get(favoriteCardId) : null;

  return {
    favoriteCard,
    isLoading,
    hasError,
  };
};
