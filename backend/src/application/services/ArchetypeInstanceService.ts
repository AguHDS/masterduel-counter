import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
  RegisterInstanceDTO,
} from "@/domain/ArchetypeInstance";
import { ArchetypeInstanceServicePort } from "../ports/ArchetypeInstanceService";
import { ArchetypeInstanceRepository } from "@/domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";

export class ArchetypeInstanceService implements ArchetypeInstanceServicePort {
  constructor(
    private instanceRepository: ArchetypeInstanceRepository,
    private cardPairRepository: ArchetypeCardPairRepository,
    private archetypeRepository: ArchetypeRepository
  ) {}

  async createOrUpdateInstance(
    data: ArchetypeInstanceCreateDTO
  ): Promise<ArchetypeInstance> {
    // Always create new instance
    return this.instanceRepository.create(data);
  }

  async getInstanceById(id: number): Promise<ArchetypeInstance | null> {
    return this.instanceRepository.findById(id);
  }

  /** Used for Archetype instances list */
  async getInstancesByArchetypeId(
    archetypeId: number,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findByArchetypeId(archetypeId, sortBy);
  }

  /** Get all archetype instances created by a specific user (for user profile) */
  async getInstancesByUserId(
    userId: string,
    sortBy: 'likes' | 'updated' = 'updated'
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findByUserId(userId, sortBy);
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

  async registerInstanceWithPairs(data: RegisterInstanceDTO): Promise<ArchetypeInstance> {
    const { archetypeId, userId, title, headerCardId, generalTip, cardPairs, instanceId } = data;

    // Validate title
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required to register an archetype");
    }

    if (title.length > 100) {
      throw new Error("Title must be 100 characters or less");
    }

    // Validate card pairs
    if (!cardPairs || cardPairs.length === 0) {
      throw new Error("At least one card pair is required to register an archetype");
    }

    // Validate header card
    if (!headerCardId) {
      throw new Error("Header card is required to register an archetype");
    }

    let instance: ArchetypeInstance;

    if (instanceId) {
      // Update existing instance
      instance = await this.updateInstance(instanceId, userId, {
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    } else {
      // Create new instance
      instance = await this.createOrUpdateInstance({
        archetypeId,
        userId,
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    }

    // Delete existing pairs and create new ones
    await this.cardPairRepository.deleteByInstanceId(instance.id);

    const pairsToCreate = cardPairs.map((pair, index) => ({
      instance_id: instance.id,
      top_card_ids: pair.topCardIds,
      bottom_card_ids: pair.bottomCardIds,
      pair_order: index + 1,
      effectiveness: pair.effectiveness || null,
      comment: pair.comment || null,
    }));

    await this.cardPairRepository.createMany(pairsToCreate);

    // Mark archetype as registered if it is not already
    const archetype = await this.archetypeRepository.findById(archetypeId);
    if (archetype && !archetype.registered) {
      await this.archetypeRepository.update(archetypeId, { registered: true });
    }

    return instance;
  }

  async toggleInstanceLike(instanceId: number, userId: string): Promise<{ liked: boolean; likes: number }> {
    // Get the instance to check ownership
    const instance = await this.instanceRepository.findById(instanceId);
    
    if (!instance) {
      throw new Error("Instance not found");
    }

    // Prevent users from liking their own instances
    if (instance.userId === userId) {
      throw new Error("You cannot like your own instance");
    }

    return this.instanceRepository.toggleLike(instanceId, userId);
  }

  async hasUserLikedInstance(instanceId: number, userId: string): Promise<boolean> {
    return this.instanceRepository.hasUserLiked(instanceId, userId);
  }
}
