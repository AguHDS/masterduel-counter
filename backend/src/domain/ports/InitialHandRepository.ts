import {
  FinalBoardPreview,
  InitialHand,
  InitialHandWithCards,
  InitialHandCreateDTO,
} from "../InitialHand.js";

export interface InitialHandRepository {
  /** Create a new initial hand for a guide instance */
  createInitialHand(data: InitialHandCreateDTO): Promise<InitialHand>;
  /** Create multiple initial hands for a guide instance */
  createManyInitialHands(
    instanceId: number,
    initialHands: Array<{
      cardIds: number[];
      description?: string;
      finalBoard?: FinalBoardPreview;
    }>,
  ): Promise<void>;
  /** Find all initial hands for a guide instance with card details */
  findInitialHandsByInstanceId(instanceId: number): Promise<InitialHandWithCards[]>;
  /** Delete all initial hands for a guide instance */
  deleteInitialHandsByInstanceId(instanceId: number): Promise<void>;
}
