import type { Profile, CreateProfileData, UpdateProfileData } from "../Profile";

export interface ProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  create(data: CreateProfileData): Promise<Profile>;
  update(userId: string, data: UpdateProfileData): Promise<Profile>;
  deleteProfilePicture(userId: string): Promise<Profile>;
}
