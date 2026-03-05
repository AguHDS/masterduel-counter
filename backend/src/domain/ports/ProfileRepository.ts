import type { Profile, CreateProfileData, UpdateProfileData } from "../Profile.js";

export interface ProfileRepository {
  /** Find profile by user ID */
  findProfileByUserId(userId: string): Promise<Profile | null>;
  /** Create new profile */
  createProfile(data: CreateProfileData): Promise<Profile>;
  /** Update existing profile */
  updateProfile(userId: string, data: UpdateProfileData): Promise<Profile>;
  /** Delete profile picture */
  deleteProfilePicture(userId: string): Promise<Profile>;
}
