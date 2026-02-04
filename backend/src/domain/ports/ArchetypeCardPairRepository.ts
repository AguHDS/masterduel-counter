import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "../ArchetypeCardPair";

export interface ArchetypeCardPairRepository {
  /**
   * Create multiple pairs of cards for an archetype instance
   */
  createMany(pairs: ArchetypeCardPairCreateDTO[]): Promise<ArchetypeCardPair[]>;

  /**
   * Gets all card pairs of an archetype instance
   */
  findByInstanceId(instanceId: number): Promise<ArchetypeCardPair[]>;

  /**
   * Gets all card pairs of an instance with card details
   */
  findByInstanceIdWithDetails(
    instanceId: number,
  ): Promise<ArchetypeCardPairWithDetails[]>;

  /**
   * Deletes all card pairs for a specific instance
   */
  deleteByInstanceId(instanceId: number): Promise<void>;

  /**
   * Deletes a specific card pair by its ID
   */
  deleteById(id: number): Promise<void>;
}
