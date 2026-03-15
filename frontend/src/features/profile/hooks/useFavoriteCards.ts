import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { selectCard } from "@/features/archetypes/api/archetypesApi";
import type { Card } from '@/features/archetypes/types';
import type { FavoriteDeck } from '../types/profileTypes';

export const useFavoriteCards = (
  favoriteCardId: number | null,
  favoriteDecks: FavoriteDeck[]
) => {
  // Extract all card IDs
  const cardIds: number[] = [];
  
  if (favoriteCardId) {
    cardIds.push(favoriteCardId);
  }
  
  favoriteDecks.forEach((deck) => {
    if (deck && deck.cardId) {
      cardIds.push(deck.cardId);
    }
  });

  // Fetch all cards in parallel
  const cardQueries = useQueries({
    queries: cardIds.map((cardId) => ({
      queryKey: ['card', cardId],
      queryFn: () => selectCard(cardId),
      staleTime: Infinity, // Cards don't change
      enabled: !!cardId,
    })),
  });

  // Map results back to their respective positions
  const isLoading = cardQueries.some((query) => query.isLoading);
  const hasError = cardQueries.some((query) => query.isError);

  // Create a map of cardId -> Card for easy lookup
  const cardsMap = new Map<number, Card>();
  cardQueries.forEach((query: UseQueryResult<Card>) => {
    if (query.data) {
      cardsMap.set(query.data.id, query.data);
    }
  });

  // Get favorite card
  const favoriteCard = favoriteCardId ? cardsMap.get(favoriteCardId) : null;

  // Get favorite deck cards
  const favoriteDecksWithCards = favoriteDecks.map((deck) => 
    deck ? {
      ...deck,
      card: deck.cardId ? cardsMap.get(deck.cardId) : null,
    } : null
  );

  return {
    favoriteCard,
    favoriteDecksWithCards,
    isLoading,
    hasError,
  };
};
