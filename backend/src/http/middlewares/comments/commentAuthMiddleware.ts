import { Request, Response, NextFunction } from "express";
import { getDependencies } from "@/compositionRoot.js";
import { validateNumberParam } from "@/shared/utils/paramValidation.js";

export const canModifyCommentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rawCommentId = req.params.commentId ?? req.body?.commentId;

    const commentId = validateNumberParam(rawCommentId);

    if (!commentId) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const dependencies = getDependencies();
    const commentRepository = dependencies.getCommentRepository();

    const canModify =
      (await commentRepository.isCommentAuthor(commentId, userId)) ||
      (await commentRepository.isInstanceOwner(commentId, userId));

    if (!canModify) {
      return res
        .status(403)
        .json({ error: "You don't have permission to modify this comment" });
    }

    next();
  } catch (error) {
    console.error("Error in comment auth middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const validateCommentOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const commentId = validateNumberParam(req.params.commentId);

    if (!commentId) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const dependencies = getDependencies();
    const commentRepository = dependencies.getCommentRepository();

    const isAuthor = await commentRepository.isCommentAuthor(commentId, userId);

    if (!isAuthor) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments" });
    }

    next();
  } catch (error) {
    console.error("Error in comment owner middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
