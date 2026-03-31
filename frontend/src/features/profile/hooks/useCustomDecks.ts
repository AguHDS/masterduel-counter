import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customDeckApi } from "../api/customDeckApi";
import { queryKeys } from "@/lib/query/queryKeys";
import { confirmCards } from "@/features/archetypes/api/archetypesApi";

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
    mutationFn: async ({
      title,
      mainDeckCards,
      extraDeckCards,
      sideDeckCards,
      isPublic,
      headerCardId,
    }: {
      title: string;
      mainDeckCards: number[];
      extraDeckCards: number[];
      sideDeckCards?: number[];
      isPublic?: boolean;
      headerCardId?: number;
    }) => {
      // Confirm all cards exist in database before creating deck
      const allCardIds = [...mainDeckCards, ...extraDeckCards, ...(sideDeckCards || [])];
      const uniqueCardIds = [...new Set(allCardIds)];
      
      if (uniqueCardIds.length > 0) {
        await confirmCards(uniqueCardIds);
      }
      
      return customDeckApi.createDeck(userId, title, mainDeckCards, extraDeckCards, sideDeckCards, isPublic, headerCardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customDecks.byUser(userId),
      });
    },
  });

  const updateDeckMutation = useMutation({
    mutationFn: async ({
      deckId,
      title,
      mainDeckCards,
      extraDeckCards,
      sideDeckCards,
      isPublic,
      headerCardId,
    }: {
      deckId: number;
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      sideDeckCards?: number[];
      isPublic?: boolean;
      headerCardId?: number;
    }) => {
      // Confirm all cards exist in database before updating deck
      const allCardIds: number[] = [];
      if (mainDeckCards) allCardIds.push(...mainDeckCards);
      if (extraDeckCards) allCardIds.push(...extraDeckCards);
      if (sideDeckCards) allCardIds.push(...sideDeckCards);
      const uniqueCardIds = [...new Set(allCardIds)];
      
      if (uniqueCardIds.length > 0) {
        await confirmCards(uniqueCardIds);
      }
      
      return customDeckApi.updateDeck(userId, deckId, title, mainDeckCards, extraDeckCards, sideDeckCards, isPublic, headerCardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customDecks.byUser(userId),
      });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: number) => customDeckApi.deleteCustomDeck(userId, deckId),
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
    deleteCustomDeck: deleteDeckMutation.mutate,
    isCreating: createDeckMutation.isPending,
    isUpdating: updateDeckMutation.isPending,
    isDeleting: deleteDeckMutation.isPending,
  };
};
