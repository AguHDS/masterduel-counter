import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../ArchetypeInstance";

export interface ArchetypeInstanceRepository {
  create(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  findById(id: number): Promise<ArchetypeInstance | null>;
  findByArchetypeId(archetypeId: number): Promise<ArchetypeInstanceWithDetails[]>;
  findByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]>;
  findByArchetypeAndUser(archetypeId: number, userId: string): Promise<ArchetypeInstance | null>;
  update(id: number, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;
  delete(id: number): Promise<void>;
}
