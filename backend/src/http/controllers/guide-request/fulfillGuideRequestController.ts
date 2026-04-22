import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";
import type { AuthenticatedRequest } from "@/http/middlewares/auth/authMiddleware.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const fulfillGuideRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = validateNumberParam(req.params.id);

    if (id === null) {
      res.status(400).json({ error: "Invalid request ID." });
      return;
    }

    const { instanceId } = req.body as { instanceId?: unknown };
    const parsedInstanceId = validateNumberParam(
      instanceId as string | number | undefined,
    );

    if (parsedInstanceId === null) {
      res.status(400).json({ error: "instanceId must be a positive integer." });
      return;
    }

    const user = (req as AuthenticatedRequest).user!;
    const deps = getDependencies();

    const request = await deps
      .getGuideRequestService()
      .fulfillRequest(
        id,
        user.id,
        user.name,
        parsedInstanceId,
        deps.getNotificationService(),
      );

    res.json({ success: true, data: request });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fulfill request.";
    const status = message.includes("not found")
      ? 404
      : message.includes("already been fulfilled")
        ? 409
        : 500;
    res.status(status).json({ success: false, error: message });
  }
};
