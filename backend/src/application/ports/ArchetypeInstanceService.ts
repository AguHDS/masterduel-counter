import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "@/domain/ArchetypeInstance";

export interface ArchetypeInstanceServicePort {
  /** Creates a new instance or updates it if it already exists for the user */
  createOrUpdateInstance(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  
  /** Gets an instance by its ID */
  getInstanceById(id: number): Promise<ArchetypeInstance | null>;
  
  /** Gets all instances created for a specific archetype */
  getInstancesByArchetypeId(archetypeId: number): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Gets all instances created by a user */
  getInstancesByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Updates an existing instance */
  updateInstance(id: number, userId: string, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;
  
  /** Deletes a user's instance */
  deleteInstance(id: number, userId: string): Promise<void>;
}
