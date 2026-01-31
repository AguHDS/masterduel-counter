import type { Profile } from "@/domain/Profile";

export interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>;
  updateBio(userId: string, bio: string): Promise<Profile>;
  uploadProfilePicture(
    userId: string,
    file: Express.Multer.File
  ): Promise<Profile>;
  deleteProfilePicture(userId: string): Promise<Profile>;
}
