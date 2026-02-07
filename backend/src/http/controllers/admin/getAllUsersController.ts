import { Request, Response } from "express";

export const getAllUsersController = (
  req: Request,
  res: Response,
) => {
  res.status(200).json({ message: "Not implemented yet" });
};
