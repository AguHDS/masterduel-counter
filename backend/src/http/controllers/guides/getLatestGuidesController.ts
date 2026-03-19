import { Request, Response } from "express";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";

/** Get the latest created guide instances across all archetypes */
/** TODO:
 * En la ruta, no se esta implementando este controller como se hace convencionalmente con otros controllers
 * Chequea como se trabaja con controllers en otros archivos bien implementados (ej: backend\src\routes\guides\guideLikes.ts & backend\src\http\controllers\guides\toggleGuideLikeController.ts)
 * y si es necesario hacer X cosa en el compositionRoot para que funcione correctamente, hacerlo, pero siempre
 * siguiendo la forma de trabajo que se hace en los flujos que funcionan bien.
 * El archivo de ruta deberia conectar la ruta con el controller.
 * Cambiar tambien el nombre del controller a getLastestGuidesController.ts
 */
export const createGetLatestGuidesController =
  (instanceService: GuideInstanceServicePort) =>
  async (req: Request, res: Response) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam) : 5;

      if (isNaN(limit) || limit < 1 || limit > 50) {
        res.status(400).json({ error: "Invalid limit parameter. Must be between 1 and 50" });
        return;
      }

      const instances = await instanceService.getLastedCreatedGuides(limit);

      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching latest guides:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
