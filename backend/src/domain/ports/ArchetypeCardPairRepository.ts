import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "../ArchetypeCardPair.js";

export interface ArchetypeCardPairRepository {
  /**
   * Create multiple pairs of cards for an archetype instance
   */
  CreateManyPairCards(
    pairs: ArchetypeCardPairCreateDTO[],
  ): Promise<ArchetypeCardPair[]>;

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
}
