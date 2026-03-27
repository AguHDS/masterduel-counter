import { InitialHandWithCards } from "@/domain/InitialHand.js";

export interface InitialHandApplicationPort {
  /** Get all initial hands for a guide instance with card details */
  getInitialHandsByInstanceId(instanceId: number): Promise<InitialHandWithCards[]>;
}
