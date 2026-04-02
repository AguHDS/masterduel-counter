import { ComboStepApplicationPort } from "../ports/ComboStepApplicationPort.js";
import { ComboStepRepository } from "@/domain/ports/ComboStepRepository.js";
import { ComboStepWithCards } from "@/domain/ComboStep.js";

export class ComboStepApplicationService implements ComboStepApplicationPort {
  constructor(private comboStepRepository: ComboStepRepository) {}

  async getComboStepsByInitialHandId(initialHandId: number): Promise<ComboStepWithCards[]> {
    return this.comboStepRepository.findComboStepsByInitialHandId(initialHandId);
  }
}
