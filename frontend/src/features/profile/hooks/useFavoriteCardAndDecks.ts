import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { FavoriteDeck } from '../types/profileTypes';
import type { Profile } from '../api/profileApi';

const EMPTY_FAVORITE_DECK_SLOTS: (FavoriteDeck | null)[] = [null, null, null];

type FavoriteDeckRaw =
  | { deckId?: unknown }
  | null
  | undefined;

const isValidDeckId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

export const normalizeFavoriteDeckSlots = (
  input: unknown,
): (FavoriteDeck | null)[] => {
  const normalized: (FavoriteDeck | null)[] = [...EMPTY_FAVORITE_DECK_SLOTS];

  if (!Array.isArray(input)) {
    return normalized;
  }

  input.slice(0, 3).forEach((entry, index) => {
    const raw = entry as FavoriteDeckRaw;
    const deckId = raw && typeof raw === 'object' ? raw.deckId : null;

    if (isValidDeckId(deckId)) {
      normalized[index] = { deckId };
    }
  });

  return normalized;
};

/** Hook to manage favorite card and favorite decks in user profile */
export const useFavoriteCardAndDecks = (userId: string, profile: Profile | undefined) => {
  const [favoriteCardId, setFavoriteCardId] = useState<number | null>(null);
  const [favoriteDecks, setFavoriteDecks] = useState<(FavoriteDeck | null)[]>(
    EMPTY_FAVORITE_DECK_SLOTS,
  );

  const queryClient = useQueryClient();

  // Load favorites from profile
  useEffect(() => {
    if (profile) {
      setFavoriteCardId(profile.favoriteCardId || null);
      if (profile.favoriteDecks) {
        try {
          const decks = JSON.parse(profile.favoriteDecks) as unknown;
          setFavoriteDecks(normalizeFavoriteDeckSlots(decks));
        } catch {
          setFavoriteDecks(EMPTY_FAVORITE_DECK_SLOTS);
        }
      } else {
        setFavoriteDecks(EMPTY_FAVORITE_DECK_SLOTS);
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
      const canonicalDecks = normalizeFavoriteDeckSlots(favoriteDecks);
      // Filter out null values before saving but keep the positions
      const hasAnyDeck = canonicalDecks.some(deck => deck !== null);
      await updateFavoritesMutation.mutateAsync({
        favoriteCardId,
        favoriteDecks: hasAnyDeck ? JSON.stringify(canonicalDecks) : null,
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
