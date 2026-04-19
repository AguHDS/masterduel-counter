import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { FavoriteDeck } from '../types/profileTypes';
import type { Profile } from '../api/profileApi';

export const useFavoriteCardAndDecks = (userId: string, profile: Profile | undefined) => {
  const [favoriteCardId, setFavoriteCardId] = useState<number | null>(null);
  const [favoriteDecks, setFavoriteDecks] = useState<(FavoriteDeck | null)[]>([null, null, null]);

  const queryClient = useQueryClient();

  // Load favorites from profile
  useEffect(() => {
    if (profile) {
      setFavoriteCardId(profile.favoriteCardId || null);
      if (profile.favoriteDecks) {
        try {
          const decks = JSON.parse(profile.favoriteDecks) as (FavoriteDeck | null)[];
          // Ensure we always have exactly 3 slots
          const normalizedDecks: (FavoriteDeck | null)[] = [null, null, null];
          decks.forEach((deck, index) => {
            if (index < 3 && deck !== null && deck !== undefined) {
              normalizedDecks[index] = deck;
            }
          });
          setFavoriteDecks(normalizedDecks);
        } catch {
          setFavoriteDecks([null, null, null]);
        }
      } else {
        setFavoriteDecks([null, null, null]);
      }
    }
  }, [profile]);

  const updateFavoritesMutation = useMutation({
    mutationFn: (data: { favoriteCardId: number | null; favoriteDecks: string | null }) =>
      profileApi.updateFavorites(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const saveFavoriteCardAndDecks = useCallback(async () => {
    try {
      // Filter out null values before saving but keep the positions
      const hasAnyDeck = favoriteDecks.some(deck => deck !== null);
      await updateFavoritesMutation.mutateAsync({
        favoriteCardId,
        favoriteDecks: hasAnyDeck ? JSON.stringify(favoriteDecks) : null,
      });
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }, [favoriteCardId, favoriteDecks, updateFavoritesMutation]);

  return {
    favoriteCardId,
    favoriteDecks,
    setFavoriteCardId,
    setFavoriteDecks,
    saveFavoriteCardAndDecks,
    isSaving: updateFavoritesMutation.isPending,
  };
};
