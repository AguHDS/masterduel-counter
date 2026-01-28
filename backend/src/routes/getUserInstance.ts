import { Router } from "express";
import { ArchetypeInstanceRepository } from "../domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "../domain/ports/ArchetypeCardPairRepository";
import { CardRepository } from "../domain/ports/CardRepository";
import { ArchetypeRepository } from "../domain/ports/ArchetypeRepository";
import { UserRepository } from "../domain/ports/UserRepository";
import { createGetUserInstanceController } from "../http/controllers/getUserInstanceController";

export const createGetUserInstanceRoute = (dependencies: {
  getInstanceRepository: () => ArchetypeInstanceRepository;
  getCardPairRepository: () => ArchetypeCardPairRepository;
  getCardRepository: () => CardRepository;
  getArchetypeRepository: () => ArchetypeRepository;
  getUserRepository: () => UserRepository;
}) => {
  const router = Router();

  const controller = createGetUserInstanceController(
    dependencies.getInstanceRepository(),
    dependencies.getCardPairRepository(),
    dependencies.getCardRepository(),
    dependencies.getArchetypeRepository(),
    dependencies.getUserRepository()
  );

  router.get("/archetypes/:archetypeId/users/:userId/instance", controller);

  return router;
};
