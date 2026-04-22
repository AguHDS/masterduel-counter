import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const getGuideRequestByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = validateNumberParam(req.params.id);

    if (id === null) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const service = getDependencies().getGuideRequestService();
    const request = await service.getRequestById(id);

    if (!request) {
      res.status(404).json({ error: "Guide request not found." });
      return;
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error("[getGuideRequestByIdController]:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get guide request." });
  }
};
