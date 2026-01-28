import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";

/** Obtiene la lista de todos los arquetipos registrados con información del creador */
export const getRegisteredArchetypesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const dependencies = getDependencies();
    const archetypeRepository = dependencies.getArchetypeRepository();
    const archetypes = await archetypeRepository.findAllRegistered();

    // Get instance count for each archetype
    const instanceRepository = dependencies.getInstanceRepository();
    const archetypesWithCreator = await Promise.all(
      archetypes.map(async (archetype) => {
        const instances = await instanceRepository.findByArchetypeId(archetype.id);
        
        return {
          ...archetype,
          instance_count: instances.length,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { archetypes: archetypesWithCreator },
    });
  } catch (error) {
    console.error("Error fetching registered archetypes:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching registered archetypes",
    });
  }
};
