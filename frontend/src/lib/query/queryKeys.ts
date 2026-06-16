/**
 * Query keys factory for consistent cache management
 *
 * Benefits:
 * - Centralized query key management
 * - Type-safe key generation
 * - Easy cache invalidation
 * - Prevents key conflicts
 */

// Create the base object first to avoid circular reference
const adminKeys = {
  all: ["admin"] as const,
  users: {
    all: ["admin", "users"] as const,
    list: () => [...adminKeys.users.all, "list"] as const,
    detail: (id: string) => [...adminKeys.users.all, "detail", id] as const,
    instances: (userId: string) =>
      [...adminKeys.users.all, "instances", userId] as const,
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

const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (instanceId: number) =>
    [...commentKeys.lists(), { instanceId }] as const,
  detail: (id: number) => [...commentKeys.all, "detail", id] as const,
} as const;

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (page: number) => [...notificationKeys.lists(), page] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
} as const;

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    verify: () => [...queryKeys.auth.all, "verify"] as const,
  },

  archetypes: {
    all: ["archetypes"] as const,
    search: (query: string, limit?: number) =>
      ["archetypes", "search", query, limit] as const,
    registered: () => ["archetypes", "registered"] as const,
    detail: (id: number) => ["archetypes", "detail", id] as const,
    withHeader: (id: string | number) => ["archetypes", "with-header", id] as const,
    cardPairs: (id: number) => ["archetypes", "card-pairs", id] as const,
  },

  cards: {
    all: ["cards"] as const,
    search: (query: string) => ["cards", "search", query] as const,
  },

  comments: commentKeys,

  notifications: notificationKeys,

  admin: adminKeys,

  customDecks: {
    all: ["customDecks"] as const,
    byUser: (userId: string) => ["customDecks", userId] as const,
    detail: (userId: string, deckId: number) =>
      ["customDecks", userId, deckId] as const,
  },

  guideRequests: {
    all: ["guideRequests"] as const,
    list: (page: number, limit: number, status?: string) =>
      ["guideRequests", "list", page, limit, status ?? "all"] as const,
    recent: (limit: number) => ["guideRequests", "recent", limit] as const,
    detail: (id: number) => ["guideRequests", "detail", id] as const,
    counts: ["guideRequests", "counts"] as const,
  },

  latestUpdates: {
    all: ["latestUpdates"] as const,
    list: () => [...queryKeys.latestUpdates.all, "list"] as const,
    detail: (id: number) => [...queryKeys.latestUpdates.all, "detail", id] as const,
  },

  tierList: {
    all: ["tierList"] as const,
    entries: (format: string) => [...queryKeys.tierList.all, "entries", format] as const,
    config: (format: string) => [...queryKeys.tierList.all, "config", format] as const,
  },
} as const;
