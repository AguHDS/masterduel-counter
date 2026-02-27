import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customDeckApi } from "../api/customDeckApi";
import { queryKeys } from "@/lib/query/queryKeys";

export const useCustomDecks = (userId: string) => {
  const queryClient = useQueryClient();

  const {
    data: decks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.customDecks.byUser(userId),
    queryFn: () => customDeckApi.getDecks(userId),
    enabled: !!userId,
  });

  const createDeckMutation = useMutation({
    mutationFn: ({
      title,
      mainDeckCards,
      extraDeckCards,
      isPublic,
    }: {
      title: string;
      mainDeckCards: number[];
      extraDeckCards: number[];
      isPublic?: boolean;
    }) => customDeckApi.createDeck(userId, title, mainDeckCards, extraDeckCards, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customDecks.byUser(userId),
      });
    },
  });

  const updateDeckMutation = useMutation({
    mutationFn: ({
      deckId,
      title,
      mainDeckCards,
      extraDeckCards,
      isPublic,
    }: {
      deckId: number;
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      isPublic?: boolean;
    }) => customDeckApi.updateDeck(userId, deckId, title, mainDeckCards, extraDeckCards, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customDecks.byUser(userId),
      });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: number) => customDeckApi.deleteDeck(userId, deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customDecks.byUser(userId),
      });
    },
  });

  return {
    decks,
    isLoading,
    error,
    createDeck: createDeckMutation.mutate,
    updateDeck: updateDeckMutation.mutate,
    deleteDeck: deleteDeckMutation.mutate,
    isCreating: createDeckMutation.isPending,
    isUpdating: updateDeckMutation.isPending,
    isDeleting: deleteDeckMutation.isPending,
  };
};
