import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

/** Gets the list of all registered archetypes */
export const getRegisteredArchetypesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const sortBy = req.query.sortBy as string | undefined;
    const validSortBy = sortBy === "instances" ? "instances" : "recent";
    
    const type = req.query.type as string | undefined;
    
    // Validate type parameter if provided
    if (type && type !== 'counter' && type !== 'deck') {
      return res.status(400).json({
        success: false,
        error: "Invalid type parameter. Must be 'counter' or 'deck'",
      });
    }
    
    const guideType = type ? (type === 'counter' ? 'COUNTER' : 'DECK') : undefined;

    const dependencies = getDependencies();
    const archetypeRepository = dependencies.getArchetypeRepository();
    const archetypes = await archetypeRepository.findAllRegisteredArchetypes(validSortBy, guideType);

    // Get instance count for each archetype
    const instanceRepository = dependencies.getInstanceRepository();
    const archetypesWithCreator = await Promise.all(
      archetypes.map(async (archetype) => {
        const instances = await instanceRepository.findArchetypeInstanceByArchetypeId(
          archetype.id,
          'updated',
          guideType,
        );
        
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
