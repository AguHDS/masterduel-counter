import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { FavoriteDeck } from '../types/profileTypes';
import type { Profile } from '../api/profileApi';

export const useFavoriteCardAndDecks = (userId: string, profile: Profile | undefined) => {
  const [favoriteCardId, setFavoriteCardId] = useState<number | null>(null);
  const [favoriteDecks, setFavoriteDecks] = useState<FavoriteDeck[]>([]);

  const queryClient = useQueryClient();

  // Load favorites from profile
  useEffect(() => {
    if (profile) {
      setFavoriteCardId(profile.favoriteCardId || null);
      if (profile.favoriteDecks) {
        try {
          const decks = JSON.parse(profile.favoriteDecks) as (FavoriteDeck | null)[];
          // Filter out null/undefined entries that may have been saved incorrectly
          const validDecks = decks.filter((deck): deck is FavoriteDeck => deck !== null && deck !== undefined);
          setFavoriteDecks(validDecks);
        } catch {
          setFavoriteDecks([]);
        }
      } else {
        setFavoriteDecks([]);
      }
    }
  }, [profile]);

  const updateFavoritesMutation = useMutation({
    mutationFn: (data: { favoriteCardId: number | null; favoriteDecks: string | null }) =>
      profileApi.updateFavorites(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const saveFavoriteCardAndDecks = useCallback(async () => {
    try {
      await updateFavoritesMutation.mutateAsync({
        favoriteCardId,
        favoriteDecks: favoriteDecks.length > 0 ? JSON.stringify(favoriteDecks) : null,
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
