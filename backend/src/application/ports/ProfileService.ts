import type { Profile } from "@/domain/Profile";

export interface ProfileService {
  /** Get profile by user ID */
  getProfile(userId: string): Promise<Profile | null>;
  /** Update the bio of a profile */
  updateBio(userId: string, bio: string): Promise<Profile>;
  /** Upload a new profile picture */
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<Profile>;
  /** Delete the profile picture */
  deleteProfilePicture(userId: string): Promise<Profile>;
}
