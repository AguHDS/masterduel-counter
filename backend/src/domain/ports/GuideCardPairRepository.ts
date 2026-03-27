import {
  CardPair,
  GuideCardPairCreateDTO,
  GuideCardPairWithDetails,
} from "../CardPair.js";

/** Repository interface for managing card pairs of guides */
export interface GuideCardPairRepository {
  /**
   * Create multiple pairs of cards for a guide
   */
  CreateManyPairCards(
    pairs: GuideCardPairCreateDTO[],
  ): Promise<CardPair[]>;

  /**
   * Gets all card pairs of a guide with card details
   */

  findCardPairsByGuideId(
    instanceId: number,
  ): Promise<GuideCardPairWithDetails[]>;

  /**
   * Deletes all card pairs for a specific guide
   */
  deleteCardPairsByGuideId(instanceId: number): Promise<void>;
}
