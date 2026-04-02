import { ComboStep, ComboStepCreateDTO, ComboStepWithCards } from "../ComboStep.js";

export interface ComboStepRepository {
  /** Create multiple combo steps for an initial hand */
  createManyComboSteps(steps: ComboStepCreateDTO[]): Promise<ComboStep[]>;
  /** Find all combo steps for an initial hand with card details */
  findComboStepsByInitialHandId(initialHandId: number): Promise<ComboStepWithCards[]>;
  /** Delete all combo steps for a specific initial hand */
  deleteComboStepsByInitialHandId(initialHandId: number): Promise<void>;
  /** Delete all combo steps for a guide instance (cascade when deleting guide) */
  deleteComboStepsByInstanceId(instanceId: number): Promise<void>;
}
