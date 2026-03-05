import { Router } from "express";
import { ArchetypeInstanceRepository } from "@/domain/ports/ArchetypeInstanceRepository.js";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";
import { createGetGuideByIdController } from "@/http/controllers/guides/getGuideByIdController.js";

/** Get a guide created by a user by ID to view. */
export const createGetGuideByIdRoute = (dependencies: {
  getInstanceRepository: () => ArchetypeInstanceRepository;
  getCardPairRepository: () => ArchetypeCardPairRepository;
  getCardRepository: () => CardRepository;
  getArchetypeRepository: () => ArchetypeRepository;
  getUserRepository: () => UserRepository;
}) => {
  const router = Router();

  const controller = createGetGuideByIdController(
    dependencies.getInstanceRepository(),
    dependencies.getCardPairRepository(),
    dependencies.getCardRepository(),
    dependencies.getArchetypeRepository(),
    dependencies.getUserRepository(),
  );

  router.get("/instances/:instanceId", controller);

  return router;
};
