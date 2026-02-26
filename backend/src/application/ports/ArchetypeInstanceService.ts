import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
  RegisterInstanceDTO,
} from "@/domain/ArchetypeInstance";

export interface ArchetypeInstanceServicePort {
  /** Creates a new instance or updates it if it already exists for the user */
  createOrUpdateInstance(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  
  /** Gets an instance by its ID */
  getInstanceById(id: number): Promise<ArchetypeInstance | null>;
  
  /** Get all archetype instances created for a specific archetype by all users
   * @param sortBy - Optional sorting order (by Likes or Last Update)
   */
  getInstancesByArchetypeId(archetypeId: number, sortBy?: 'likes' | 'updated'): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Get all archetype instances created by a specific user (for user profile) */
  getInstancesByUserId(userId: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Search instances by archetype ID and title */
  searchInstancesByArchetypeIdAndTitle(archetypeId: number, title: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Search instances by user ID and title */
  searchInstancesByUserIdAndTitle(userId: string, title: string, sortBy?: 'likes' | 'updated'): Promise<ArchetypeInstanceWithDetails[]>;
  
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
  getFavoritedInstancesByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]>;
}
