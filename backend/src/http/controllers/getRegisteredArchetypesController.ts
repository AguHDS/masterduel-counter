import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";

let archetypeRepository: ArchetypeRepository | null = null;

const getArchetypeRepository = (): ArchetypeRepository => {
  if (!archetypeRepository) {
    const dependencies = getDependencies();
    archetypeRepository = dependencies.getArchetypeRepository();
  }
  return archetypeRepository;
};

export const getRegisteredArchetypesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const repository = getArchetypeRepository();
    const archetypes = await repository.findAllRegisteredWithCreator();

    return res.status(200).json({
      success: true,
      data: { archetypes },
    });
  } catch (error) {
    console.error("Error fetching registered archetypes:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching registered archetypes",
    });
  }
};
