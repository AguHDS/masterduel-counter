import { ComboStepWithCards } from "@/domain/ComboStep.js";

export interface ComboStepApplicationPort {
  /** Get all combo steps for an initial hand with card details */
  getComboStepsByInitialHandId(initialHandId: number): Promise<ComboStepWithCards[]>;
}
