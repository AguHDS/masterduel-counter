/**
 * Query keys factory for consistent cache management
 * 
 * Benefits:
 * - Centralized query key management
 * - Type-safe key generation
 * - Easy cache invalidation
 * - Prevents key conflicts
 */

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    verify: () => [...queryKeys.auth.all, 'verify'] as const,
  },

  // Archetype queries
  archetypes: {
    all: ['archetypes'] as const,
    search: (query: string, limit?: number) =>
      [...queryKeys.archetypes.all, 'search', query, limit] as const,
    registered: () => [...queryKeys.archetypes.all, 'registered'] as const,
    detail: (id: number) => [...queryKeys.archetypes.all, 'detail', id] as const,
    withHeader: (id: number) =>
      [...queryKeys.archetypes.all, 'with-header', id] as const,
    cardPairs: (id: number) =>
      [...queryKeys.archetypes.all, 'card-pairs', id] as const,
  },

  // Card queries
  cards: {
    all: ['cards'] as const,
    search: (query: string) =>
      [...queryKeys.cards.all, 'search', query] as const,
  },
} as const;
