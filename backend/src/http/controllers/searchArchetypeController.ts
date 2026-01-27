import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot";
import { ArchetypeService } from "@/application/services/ArchetypeService";

let archetypeService: ArchetypeService | null = null;

const getArchetypeService = (): ArchetypeService => {
  if (!archetypeService) {
    const dependencies = getDependencies();
    archetypeService = dependencies.getArchetypeService();
  }
  return archetypeService;
};

export const searchArchetypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const sanitizedName = name as string;
    const service = getArchetypeService();
    const archetypes = await service.searchArchetypes(sanitizedName, limit);

    const response = {
      data: {
        archetypes: archetypes.map((archetype) => ({
          id: archetype.id,
          name: archetype.name,
          registered: archetype.registered,
          pending_requests: archetype.pending_requests,
          header_card_id: archetype.header_card_id,
        })),
      },
    };

    if (archetypes.length === 0) {
      return res.status(200).json({
        ...response,
        message: "No archetypes found matching your search",
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("[Search Archetype Controller Error]:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Invalid id") ||
        error.message.includes("Invalid name")
      ) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An error occurred while searching for archetypes",
    });
  }
};
