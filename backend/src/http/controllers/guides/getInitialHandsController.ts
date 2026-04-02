import { Request, Response } from "express";
import { InitialHandApplicationPort } from "@/application/ports/InitialHandApplicationPort.js";

/** Get initial hands for a deck guide instance */
export const createGetInitialHandsController =
  (initialHandService: InitialHandApplicationPort) =>
  async (req: Request, res: Response) => {
    try {
      const instanceId = req.params.instanceId;
      const instanceIdNum = typeof instanceId === 'string' ? parseInt(instanceId) : NaN;

      if (isNaN(instanceIdNum)) {
        res.status(400).json({ error: "Invalid instance ID" });
        return;
      }

      const initialHands = await initialHandService.getInitialHandsByInstanceId(instanceIdNum);

      res.status(200).json(initialHands);
    } catch (error) {
      console.error("Error fetching initial hands:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
