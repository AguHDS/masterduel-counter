import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

/** Delete a Guide Request. Authenticated users can only delete their own requests */
export const deleteGuideRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = validateNumberParam(req.params.id);

    if (id === null) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const user = (req as AuthenticatedRequest).user!;
    const service = getDependencies().getGuideRequestService();
    await service.deleteRequest(id, user.id);

    res.json({ success: true, message: "Request deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete request.";
    const status =
      message.includes("not found") ? 404 :
      message.includes("You can only delete") ? 403 :
      500;
    res.status(status).json({ success: false, error: message });
  }
};
