import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeGuideListItem,
  RegisterInstanceDTO,
} from "@/domain/ArchetypeInstance.js";

export interface ArchetypeInstanceServicePort {
  /** Creates a new guide or updates it if it already exists */
  createOrUpdateGuide(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  
  /** Gets a guide by ID */
  getGuideById(id: number): Promise<ArchetypeInstance | null>;
  
  /** Get all archetype guides created for a specific archetype created by all users
   * @param sortBy - Optional sorting order (by Likes or Last Update)
   */
  getGuidesByArchetypeId(archetypeId: number, sortBy?: 'likes' | 'updated'): Promise<ArchetypeGuideListItem[]>;
  
  /** Get all archetype instances created by a specific user (for user profile) */
  getInstancesByUserId(userId: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeGuideListItem[]>;
  
  /** Search instances by archetype ID and title */
  searchInstancesByArchetypeIdAndTitle(archetypeId: number, title: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeGuideListItem[]>;
  
  /** Search instances by user ID and title */
  searchInstancesByUserIdAndTitle(userId: string, title: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeGuideListItem[]>;
  
  /** Updates an existing instance (title, headerCard, generalTip) */
  updateInstance(id: number, userId: string, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;

  /** Registers or updates an instance with card pairs and marks archetype as registered */
  registerInstanceWithPairs(data: RegisterInstanceDTO): Promise<ArchetypeInstance>;
  
  /** Deletes a user's instance */
  deleteInstance(id: number, userId: string): Promise<void>;

  /** Toggles a like on an instance (add if not exists, remove if exists) */
  toggleInstanceLike(instanceId: number, userId: string): Promise<{ liked: boolean; likes: number }>;

  /** Checks if a user has liked an instance */
  hasUserLikedInstance(instanceId: number, userId: string): Promise<boolean>;

  /** Toggles a favorite on an instance (add if not exists, remove if exists) */
  toggleInstanceFavorite(instanceId: number, userId: string): Promise<{ favorited: boolean; favorites: number }>;

  /** Checks if a user has favorited an instance */
  hasUserFavoritedInstance(instanceId: number, userId: string): Promise<boolean>;

  /** Gets all favorited instances by a user */
  getFavoritedInstancesByUserId(userId: string): Promise<ArchetypeGuideListItem[]>;

  /** Registers a view for an instance */
  registerView(instanceId: number): Promise<void>;

  /** Gets the total view count across all instances for a user */
  getTotalViewsByUserId(userId: string): Promise<number>;

  /** Gets the latest created instances across all archetypes */
  getLatestCreatedInstances(limit: number): Promise<ArchetypeGuideListItem[]>;

  /** Cleanup method for shutting down the service */
  shutdown(): Promise<void>;
}
