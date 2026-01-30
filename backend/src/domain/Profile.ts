export interface Profile {
  id: number;
  userId: string;
  userName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  cloudinaryPublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileData {
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  cloudinaryPublicId?: string;
}

export interface UpdateProfileData {
  bio?: string;
  profilePictureUrl?: string;
  cloudinaryPublicId?: string;
}
