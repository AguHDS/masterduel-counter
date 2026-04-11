import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
  RegisterGuideDTO,
  GuideType,
} from "@/domain/Guide.js";

export interface GuideInstanceServicePort {
  /** Creates a new guide or updates it if it already exists */
  createOrUpdateGuide(data: GuideCreateDTO): Promise<Guide>;
  
  /** Gets a guide by ID */
  getGuideById(id: number): Promise<Guide | null>;
  
  /** Get all archetype guides created for a specific archetype created by all users
   * @param sortBy - Optional sorting order (by Likes or Last Update)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  getGuidesByArchetypeId(archetypeId: number, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
  
  /** Get all archetype instances created by a specific user (for user profile)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  getGuideListByUserId(userId: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
  
  /** Search guides instances by archetype ID and title (for search functionality)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  searchGuideItemList(archetypeId: number, title: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
  
  /** Search instances by user ID and title (for search in user profile)
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  searchGuideItemListProfile(userId: string, title: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
  
  /** Updates an existing guide */
  updateGuide(id: number, userId: string, data: GuideUpdateDTO): Promise<Guide>;

  /** Registers or updates a guide and marks the archetype as registered */
  registerGuide(data: RegisterGuideDTO): Promise<Guide>;
  
  /** Deletes a user's guide */
  deleteGuide(id: number, userId: string): Promise<void>;

  /** Toggles a like on a guide (add if not exists, remove if exists) */
  toggleLikeGuide(instanceId: number, userId: string): Promise<{ liked: boolean; likes: number }>;

  /** Checks if a user has liked a guide */
  hasUserLikedGuide(instanceId: number, userId: string): Promise<boolean>;

  /** Toggles a favorite on a guide (add if not exists, remove if exists) */
  toggleFavoriteGuide(instanceId: number, userId: string): Promise<{ favorited: boolean; favorites: number }>;

  /** Checks if a user has favorited a guide */
  hasUserFavoritedGuide(instanceId: number, userId: string): Promise<boolean>;

  /** Gets all favorited guides by a user */
  getFavoritedGuidesByUserId(userId: string): Promise<GuideListItem[]>;

  /** Registers a view for an instance guide if the anonymous viewer is outside cooldown. */
  registerView(instanceId: number, viewerFingerprints: string[]): Promise<boolean>;

  /** Gets the total view count across all instance guides for a user */
  getTotalViewsByUserId(userId: string): Promise<number>;

  /** Gets the latest created instance guides across all archetypes
   * @param guideType - Optional filter by guide type (COUNTER or DECK)
   */
  getLastedCreatedGuides(limit: number, guideType?: GuideType): Promise<GuideListItem[]>;

  /** Cleanup method for shutting down the service */
  shutdown(): Promise<void>;
}
