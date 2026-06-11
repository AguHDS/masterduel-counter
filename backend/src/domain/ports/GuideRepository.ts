import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
  GuideType,
  SaveDraftDTO,
} from "../Guide.js";

export type SortOrder = "likes" | "updated" | "views";

export interface LikeToggleResult {
  liked: boolean;
  likes: number;
}

export interface GuideRepository {
  /** Create new archetype instance */
  createArchetypeInstance(data: GuideCreateDTO): Promise<Guide>;
  /** Find archetype instance by its ID */
  findArchetypeInstanceById(id: number): Promise<Guide | null>;
  /** Find instance by archetype ID
   * @param sortBy - Optional sorting order (by Last Update or Likes)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  findArchetypeInstanceByArchetypeId(archetypeId: number, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Find instance by user ID (for user profile)
   * @param sortBy - Optional sorting order (by Last Update or Likes)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  findArchetypeGuidesByUserId(userId: string, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Search guides by archetype ID and title (for search functionality)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  searchGuideItemList(archetypeId: number, title: string, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Search guides by user ID and title (for search in user profile)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  searchGuideItemListProfile(userId: string, title: string, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Update an existing archetype instance */
  updateArchetypeGuide(id: number, data: GuideUpdateDTO): Promise<Guide>;
  /** Delete an archetype instance by its ID */
  deleteArchetypeInstanceById(id: number): Promise<void>;
  /** Toggles a like on a guide (add if not exists, remove if exists) */
  toggleLikeGuide(instanceId: number, userId: string): Promise<LikeToggleResult>;
  /** Checks if a user has already liked a guide */
  hasUserLikedGuide(instanceId: number, userId: string): Promise<boolean>;
  /** Toggles a favorite on a guide (add if not exists, remove if exists) */
  toggleFavoriteGuide(instanceId: number, userId: string): Promise<{ favorited: boolean; favorites: number }>;
  /** Checks if a user has favorited a guide */
  hasUserFavoritedGuide(instanceId: number, userId: string): Promise<boolean>;
  /** Gets all favorited instances by a user */
  findFavoritedInstancesByUserId(userId: string): Promise<GuideListItem[]>;
  /** Increments the view count for an instance by a specified amount */
  incrementViewCount(instanceId: number, incrementBy: number): Promise<void>;
  /** Attempts to register an anonymous viewer for an instance, respecting a cooldown */
  tryRegisterView(instanceId: number, viewerFingerprints: string[], viewedAt: Date, cooldownMs: number): Promise<boolean>;
    /** Deletes anonymous view tracking records older than the provided cutoff */
    cleanupOldViewTracking(cutoffDate: Date): Promise<number>;
  
  /** Gets the total view count across all instances for a user */
  getTotalViewsByUserId(userId: string): Promise<number>;
  /** Gets the latest created instances across all archetypes with user profile data
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  findLastestCreatedGuides(limit: number, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Gets all guides across all archetypes, optionally filtered by type and searched by title or archetype name */
  findAllGuides(sortBy?: SortOrder, guideType?: GuideType, search?: string): Promise<GuideListItem[]>;
  /** Find guides by user ID, optionally including drafts (only for the owner) */
  findArchetypeGuidesByUserIdWithDrafts(userId: string, sortBy?: SortOrder, guideType?: GuideType): Promise<GuideListItem[]>;
  /** Count how many draft guides a user currently has */
  getUserDraftCount(userId: string): Promise<number>;
  /** Save or update a draft guide */
  saveDraft(data: SaveDraftDTO): Promise<Guide>;
  /** Delete expired draft guides (where draftExpiresAt < now) */
  deleteExpiredDrafts(): Promise<number>;
  /** Get guide_request_id values of drafts that will expire, for releasing linked requests */
  getExpiredDraftGuideRequestIds(): Promise<number[]>;
}
