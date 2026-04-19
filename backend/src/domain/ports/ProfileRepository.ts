import type { Profile, CreateProfileData, UpdateProfileData } from "../Profile.js";

export interface ProfileRepository {
  /** Resolve a public profile identifier or slug to the internal user ID */
  resolvePublicUserId(userIdOrSlug: string): Promise<string>;
  /** Find profile by user ID */
  findProfileByUserId(userId: string): Promise<Profile | null>;
  /** Create new profile */
  createProfile(data: CreateProfileData): Promise<Profile>;
  /** Update existing profile */
  updateProfile(userId: string, data: UpdateProfileData): Promise<Profile>;
  /** Delete profile picture */
  deleteProfilePicture(userId: string): Promise<Profile>;
}
