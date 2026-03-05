import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../ArchetypeInstance.js";

export type SortOrder = "likes" | "updated";

export interface LikeToggleResult {
  liked: boolean;
  likes: number;
}

export interface ArchetypeInstanceRepository {
  /** Create new archetype instance */
  createArchetypeInstance(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  /** Find archetype instance by its ID */
  findArchetypeInstanceById(id: number): Promise<ArchetypeInstance | null>;
  /** Find instance by archetype ID
   * @param sortBy - Optional sorting order (by Last Update or Likes)
   */
  findArchetypeInstanceByArchetypeId(archetypeId: number, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  /** Find instance by user ID
   * @param sortBy - Optional sorting order (by Last Update or Likes)
   */
  findArchetypeInstanceByUserId(userId: string, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  /** Find archetype instance by archetype ID and user ID */
  findArchetypeInstanceByArchetypeAndUserId(archetypeId: number, userId: string): Promise<ArchetypeInstance | null>;
  /** Search instances by archetype ID and title */
  searchInstancesByArchetypeIdAndTitle(archetypeId: number, title: string, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  /** Search instances by user ID and title */
  searchInstancesByUserIdAndTitle(userId: string, title: string, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  /** Update an existing archetype instance */
  updateArchetypeInstance(id: number, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;
  /** Delete an archetype instance by its ID */
  deleteArchetypeInstanceById(id: number): Promise<void>;
  /** Toggles a like on an instance (add if not exists, remove if exists) */
  ToggleLikeInstance(instanceId: number, userId: string): Promise<LikeToggleResult>;
  /** Checks if a user has already liked an instance */
  hasUserLikedInstance(instanceId: number, userId: string): Promise<boolean>;
  /** Toggles a favorite on an instance (add if not exists, remove if exists) */
  ToggleFavoriteInstance(instanceId: number, userId: string): Promise<{ favorited: boolean; favorites: number }>;
  /** Checks if a user has favorited an instance */
  hasUserFavoritedInstance(instanceId: number, userId: string): Promise<boolean>;
  /** Gets all favorited instances by a user */
  findFavoritedInstancesByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]>;
  /** Increments the view count for an instance by a specified amount */
  incrementViewCount(instanceId: number, incrementBy: number): Promise<void>;
  /** Gets the total view count across all instances for a user */
  getTotalViewsByUserId(userId: string): Promise<number>;
  /** Gets the latest created instances across all archetypes with user profile data */
  findLatestCreatedInstances(limit: number): Promise<ArchetypeInstanceWithDetails[]>;
}
