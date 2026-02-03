import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../ArchetypeInstance";

export type SortOrder = "likes" | "updated";

export interface LikeToggleResult {
  liked: boolean;
  likes: number;
}

export interface ArchetypeInstanceRepository {
  create(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  findById(id: number): Promise<ArchetypeInstance | null>;
  findByArchetypeId(archetypeId: number, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  findByUserId(userId: string, sortBy?: SortOrder): Promise<ArchetypeInstanceWithDetails[]>;
  findByArchetypeAndUser(archetypeId: number, userId: string): Promise<ArchetypeInstance | null>;
  update(id: number, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;
  delete(id: number): Promise<void>;
  /** Toggles a like on an instance (add if not exists, remove if exists) */
  toggleLike(instanceId: number, userId: string): Promise<LikeToggleResult>;
  /** Checks if a user has already liked an instance */
  hasUserLiked(instanceId: number, userId: string): Promise<boolean>;
}
