import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId as string;
    const deps = getDependencies();
    const profileService = deps.getProfileService();

    const { profile, totalViews, rank } =
      await profileService.getPublicProfilePageData(userIdParam);

    // Resolve the actual userId (profile stores userId, but param may be a slug)
    const resolvedUserId = profile?.userId ?? null;
    const fulfilledRequestsCount = resolvedUserId
      ? await deps.getGuideRequestService().getCompletedRequestsCountByUser(resolvedUserId)
      : 0;

    return res.json({
      success: true,
      profile,
      totalViews,
      rank,
      fulfilledRequestsCount,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get profile",
    });
  }
};
