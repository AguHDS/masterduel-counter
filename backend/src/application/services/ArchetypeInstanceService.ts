import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../../domain/ArchetypeInstance";
import { ArchetypeInstanceServicePort } from "../ports/ArchetypeInstanceService";
import { ArchetypeInstanceRepository } from "../../domain/ports/ArchetypeInstanceRepository";

export class ArchetypeInstanceService implements ArchetypeInstanceServicePort {
  constructor(private instanceRepository: ArchetypeInstanceRepository) {}

  async createOrUpdateInstance(
    data: ArchetypeInstanceCreateDTO
  ): Promise<ArchetypeInstance> {
    // Always create new instance
    return this.instanceRepository.create(data);
  }

  async getInstanceById(id: number): Promise<ArchetypeInstance | null> {
    return this.instanceRepository.findById(id);
  }

  async getInstancesByArchetypeId(
    archetypeId: number
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findByArchetypeId(archetypeId);
  }

  async getInstancesByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findByUserId(userId);
  }

  async updateInstance(
    id: number,
    userId: string,
    data: ArchetypeInstanceUpdateDTO
  ): Promise<ArchetypeInstance> {
    // Verify ownership
    const instance = await this.instanceRepository.findById(id);
    if (!instance) {
      throw new Error("Instance not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Unauthorized: You can only edit your own instances");
    }

    return this.instanceRepository.update(id, data);
  }

  async deleteInstance(id: number, userId: string): Promise<void> {
    // Verify ownership
    const instance = await this.instanceRepository.findById(id);
    if (!instance) {
      throw new Error("Instance not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own instances");
    }

    await this.instanceRepository.delete(id);
  }
}
