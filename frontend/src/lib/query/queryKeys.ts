/**
 * Query keys factory for consistent cache management
 *
 * Benefits:
 * - Centralized query key management
 * - Type-safe key generation
 * - Easy cache invalidation
 * - Prevents key conflicts
 */

// Creamos el objeto base primero para evitar referencia circular
const adminKeys = {
  all: ["admin"] as const,
  users: {
    all: ["admin", "users"] as const,
    list: () => [...adminKeys.users.all, "list"] as const,
    detail: (id: string) => [...adminKeys.users.all, "detail", id] as const,
    instances: (userId: string) =>
      [...adminKeys.users.all, "instances", userId] as const,
  },
  publications: {
    all: ["admin", "publications"] as const,
    list: () => [...adminKeys.publications.all, "list"] as const,
    detail: (id: string) =>
      [...adminKeys.publications.all, "detail", id] as const,
  },
  reports: {
    all: ["admin", "reports"] as const,
    list: () => [...adminKeys.reports.all, "list"] as const,
    detail: (id: string) => [...adminKeys.reports.all, "detail", id] as const,
  },
  stats: {
    all: ["admin", "stats"] as const,
    dashboard: () => [...adminKeys.stats.all, "dashboard"] as const,
  },
} as const;

export const queryKeys = {
  // Auth queries
  auth: {
    all: ["auth"] as const,
    verify: () => [...queryKeys.auth.all, "verify"] as const,
  },

  // Archetype queries
  archetypes: {
    all: ["archetypes"] as const,
    search: (query: string, limit?: number) =>
      ["archetypes", "search", query, limit] as const,
    registered: () => ["archetypes", "registered"] as const,
    detail: (id: number) => ["archetypes", "detail", id] as const,
    withHeader: (id: number) => ["archetypes", "with-header", id] as const,
    cardPairs: (id: number) => ["archetypes", "card-pairs", id] as const,
  },

  // Card queries
  cards: {
    all: ["cards"] as const,
    search: (query: string) => ["cards", "search", query] as const,
  },

  // Admin queries (usando el objeto predefinido)
  admin: adminKeys,
} as const;
