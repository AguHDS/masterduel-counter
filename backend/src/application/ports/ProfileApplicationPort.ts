import type { Profile } from "@/domain/Profile.js";
import type { GuideListItem, GuideType } from "@/domain/Guide.js";

export interface PublicProfilePageData {
  profile: Profile | null;
  totalViews: number;
  rank: number;
}

export interface ProfileApplicationPort {
  /** Get profile by user ID */
  getProfile(userId: string): Promise<Profile | null>;
  /** Get the public profile page data from any supported public identifier */
  getPublicProfilePageData(userIdOrSlug: string): Promise<PublicProfilePageData>;
  /** Update the bio of a profile */
  updateBio(userId: string, bio: string): Promise<Profile>;
  /** Upload a new profile picture */
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<Profile>;
  /** Delete the profile picture */
  deleteProfilePicture(userId: string): Promise<Profile>;
  /** Update favorite card and decks */
  updateFavoriteCardAndDecks(userId: string, favoriteCardId: number | null, favoriteDecks: string | null): Promise<Profile>;
  /** Get all guides created by a specific user */
  getGuideListByUserId(userId: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
  /** Search guides by user ID and title */
  searchGuideItemListProfile(userId: string, title: string, sortBy?: 'likes' | 'updated', guideType?: GuideType): Promise<GuideListItem[]>;
}
