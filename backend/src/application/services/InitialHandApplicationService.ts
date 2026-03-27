import { InitialHandWithCards } from "@/domain/InitialHand.js";
import { InitialHandApplicationPort } from "../ports/InitialHandApplicationPort.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";

export class InitialHandApplicationService implements InitialHandApplicationPort {
  constructor(private initialHandRepository: InitialHandRepository) {}

  async getInitialHandsByInstanceId(
    instanceId: number,
  ): Promise<InitialHandWithCards[]> {
    return this.initialHandRepository.findInitialHandsByInstanceId(instanceId);
  }
}
