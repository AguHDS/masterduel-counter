import { Request, Response } from "express";
import { ComboStepApplicationPort } from "@/application/ports/ComboStepApplicationPort.js";

/** Get combo steps for an initial hand */
export const createGetComboStepsController =
  (comboStepService: ComboStepApplicationPort) =>
  async (req: Request, res: Response) => {
    try {
      const initialHandId = req.params.initialHandId;
      const initialHandIdNum = typeof initialHandId === 'string' ? parseInt(initialHandId) : NaN;

      if (isNaN(initialHandIdNum)) {
        res.status(400).json({ error: "Invalid initial hand ID" });
        return;
      }

      const comboSteps = await comboStepService.getComboStepsByInitialHandId(initialHandIdNum);

      res.status(200).json(comboSteps);
    } catch (error) {
      console.error("Error fetching combo steps:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
