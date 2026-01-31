import { Router } from "express";
import { ArchetypeInstanceRepository } from "../domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "../domain/ports/ArchetypeCardPairRepository";
import { CardRepository } from "../domain/ports/CardRepository";
import { ArchetypeRepository } from "../domain/ports/ArchetypeRepository";
import { UserRepository } from "../domain/ports/UserRepository";
import { createGetInstanceByIdController } from "../http/controllers/getInstanceByIdController";

export const createGetInstanceByIdRoute = (dependencies: {
  getInstanceRepository: () => ArchetypeInstanceRepository;
  getCardPairRepository: () => ArchetypeCardPairRepository;
  getCardRepository: () => CardRepository;
  getArchetypeRepository: () => ArchetypeRepository;
  getUserRepository: () => UserRepository;
}) => {
  const router = Router();

  const controller = createGetInstanceByIdController(
    dependencies.getInstanceRepository(),
    dependencies.getCardPairRepository(),
    dependencies.getCardRepository(),
    dependencies.getArchetypeRepository(),
    dependencies.getUserRepository()
  );

  router.get("/instances/:instanceId", controller);

  return router;
};
