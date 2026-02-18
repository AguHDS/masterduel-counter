import { Router } from "express";
import { ArchetypeInstanceRepository } from "@/domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import { CardRepository } from "@/domain/ports/CardRepository";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { UserRepository } from "@/domain/ports/UserRepository";
import { createGetGuideByIdController } from "@/http/controllers/guides/getGuideByIdController";

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
