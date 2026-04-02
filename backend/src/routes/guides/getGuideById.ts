import { Router } from "express";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";
import { GuideCardPairRepository } from "@/domain/ports/GuideCardPairRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";
import { ComboStepRepository } from "@/domain/ports/ComboStepRepository.js";
import { createGetGuideByIdController } from "@/http/controllers/guides/getGuideByIdController.js";

/** Get a guide created by a user by ID to view. */
export const createGetGuideByIdRoute = (dependencies: {
  getInstanceRepository: () => GuideRepository;
  getCardPairRepository: () => GuideCardPairRepository;
  getCardRepository: () => CardRepository;
  getArchetypeRepository: () => ArchetypeRepository;
  getUserRepository: () => UserRepository;
  getInitialHandRepository: () => InitialHandRepository;
  getComboStepRepository: () => ComboStepRepository;
}) => {
  const router = Router();

  const controller = createGetGuideByIdController(
    dependencies.getInstanceRepository(),
    dependencies.getCardPairRepository(),
    dependencies.getCardRepository(),
    dependencies.getArchetypeRepository(),
    dependencies.getUserRepository(),
    dependencies.getInitialHandRepository(),
    dependencies.getComboStepRepository(),
  );

  router.get("/instances/:instanceId", controller);

  return router;
};
