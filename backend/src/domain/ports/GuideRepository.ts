import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
} from "../Guide.js";

export type SortOrder = "likes" | "updated";

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
   */
  findArchetypeInstanceByArchetypeId(archetypeId: number, sortBy?: SortOrder): Promise<GuideListItem[]>;
  /** Find instance by user ID (for user profile)
   * @param sortBy - Optional sorting order (by Last Update or Likes)
   */
  findArchetypeInstanceByUserId(userId: string, sortBy?: SortOrder): Promise<GuideListItem[]>;
  /** Find archetype instance by archetype ID and user ID */
  findArchetypeInstanceByArchetypeAndUserId(archetypeId: number, userId: string): Promise<Guide | null>;
  /** Search guides by archetype ID and title (for search functionality) */
  searchGuideItemList(archetypeId: number, title: string, sortBy?: SortOrder): Promise<GuideListItem[]>;
  /** Search guides by user ID and title (for search in user profile) */
  searchGuideItemListProfile(userId: string, title: string, sortBy?: SortOrder): Promise<GuideListItem[]>;
  /** Update an existing archetype instance */
  updateArchetypeInstance(id: number, data: GuideUpdateDTO): Promise<Guide>;
  /** Delete an archetype instance by its ID */
  deleteArchetypeInstanceById(id: number): Promise<void>;
  /** Toggles a like on an instance (add if not exists, remove if exists) */
  ToggleLikeInstance(instanceId: number, userId: string): Promise<LikeToggleResult>;
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
  /** Gets the total view count across all instances for a user */
  getTotalViewsByUserId(userId: string): Promise<number>;
  /** Gets the latest created instances across all archetypes with user profile data */
  findLatestCreatedInstances(limit: number): Promise<GuideListItem[]>;
}
