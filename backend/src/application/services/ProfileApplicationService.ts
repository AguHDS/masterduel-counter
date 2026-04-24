import type {
  ProfileApplicationPort,
  PublicProfilePageData,
} from "@/application/ports/ProfileApplicationPort.js";
import type { ProfileRepository } from "@/domain/ports/ProfileRepository.js";
import type { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService.js";
import type { Profile } from "@/domain/Profile.js";
import type { GuideListItem, GuideType } from "@/domain/Guide.js";
import type { GuideRepository } from "@/domain/ports/GuideRepository.js";
import type { UserRepository } from "@/domain/ports/UserRepository.js";
import type { RankingRepository } from "@/domain/ports/RankingRepository.js";

interface FavoriteDeckReference {
  deckId: number;
}

const normalizeFavoriteDeckReferences = (
  favoriteDecks: string | null,
): string | null => {
  if (favoriteDecks === null || favoriteDecks.trim() === "") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(favoriteDecks);
  } catch {
    throw new Error("Invalid favoriteDecks JSON format");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid favoriteDecks JSON format");
  }

  const normalized: (FavoriteDeckReference | null)[] = [null, null, null];

  parsed.slice(0, 3).forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const deckId = (entry as { deckId?: unknown }).deckId;
    if (typeof deckId === "number" && Number.isInteger(deckId) && deckId > 0) {
      normalized[index] = { deckId };
    }
  });

  const hasAnyDeck = normalized.some((entry) => entry !== null);
  return hasAnyDeck ? JSON.stringify(normalized) : null;
};

export class ProfileApplicationService implements ProfileApplicationPort {
  constructor(
    private profileRepository: ProfileRepository,
    private imageStorageService: ImageStorageService,
    private guideRepository: GuideRepository,
    private userRepository: UserRepository,
    private rankingRepository: RankingRepository,
  ) {}

  async getProfile(userId: string): Promise<Profile | null> {
    let profile = await this.profileRepository.findProfileByUserId(userId);

    // Create a profile lazily only for real users
    if (!profile) {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        return null;
      }

      profile = await this.profileRepository.createProfile({ userId });
    }

    return profile;
  }

  async getPublicProfilePageData(
    userIdOrSlug: string,
  ): Promise<PublicProfilePageData> {
    const resolvedUserId =
      await this.profileRepository.resolvePublicUserId(userIdOrSlug);

    const user = await this.userRepository.findUserById(resolvedUserId);
    if (!user) {
      return {
        profile: null,
        totalViews: 0,
        rank: 0,
      };
    }

    const [profile, totalViews, rank] = await Promise.all([
      this.getProfile(resolvedUserId),
      this.guideRepository.getTotalViewsByUserId(resolvedUserId),
      this.rankingRepository.getUserRankById(resolvedUserId),
    ]);

    return {
      profile,
      totalViews,
      rank,
    };
  }

  async updateBio(userId: string, bio: string): Promise<Profile> {
    if (bio.length > 1000) {
      throw new Error("Bio must be 1000 characters or less");
    }

    // Ensure profile exists
    let profile = await this.profileRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.profileRepository.createProfile({ userId, bio });
      return profile;
    }

    return await this.profileRepository.updateProfile(userId, { bio });
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File
  ): Promise<Profile> {
    // Ensure profile exists
    let profile = await this.profileRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.profileRepository.createProfile({ userId });
    }

    // Delete old profile picture if exists
    if (profile.cloudinaryPublicId) {
      try {
        await this.imageStorageService.deleteImageFromCloudinary(profile.cloudinaryPublicId);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
        // Continue even if deletion fails
      }
    }

    // Upload new profile picture
    const publicId = `profile`;
    const folder = `masterduel-counter/${userId}/profile_picture`;
    const uploadResult = await this.imageStorageService.uploadImageToCloudinary(
      file.buffer,
      publicId,
      folder
    );

    // Update profile with new picture
    return await this.profileRepository.updateProfile(userId, {
      profilePictureUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
    });
  }

  async deleteProfilePicture(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!profile.cloudinaryPublicId) {
      throw new Error("No profile picture to delete");
    }

    // Delete from Cloudinary
    try {
      await this.imageStorageService.deleteImageFromCloudinary(profile.cloudinaryPublicId);
    } catch (error) {
      console.error("Error deleting profile picture from Cloudinary:", error);
      // Continue even if deletion fails
    }

    // Update profile
    return await this.profileRepository.deleteProfilePicture(userId);
  }

  async updateFavoriteCardAndDecks(userId: string, favoriteCardId: number | null, favoriteDecks: string | null): Promise<Profile> {
    // Ensure profile exists
    let profile = await this.profileRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = await this.profileRepository.createProfile({ userId });
    }

    const normalizedFavoriteDecks = normalizeFavoriteDeckReferences(favoriteDecks);

    // Update favorites
    return await this.profileRepository.updateProfile(userId, {
      favoriteCardId,
      favoriteDecks: normalizedFavoriteDecks,
    });
  }

  /** Get all guides created by a specific user */
  async getGuideListByUserId(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    return this.guideRepository.findArchetypeGuidesByUserId(userId, sortBy, guideType);
  }

  /** Search guides by user ID and title */
  async searchGuideItemListProfile(
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
    guideType?: GuideType,
  ): Promise<GuideListItem[]> {
    return this.guideRepository.searchGuideItemListProfile(userId, title, sortBy, guideType);
  }
}
