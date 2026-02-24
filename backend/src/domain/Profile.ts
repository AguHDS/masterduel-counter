export interface Profile {
  id: number;
  userId: string;
  userName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  cloudinaryPublicId: string | null;
  favoriteCardId: number | null;
  favoriteDecks: string | null;
  role: string;
  totalLikes: number;
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
  favoriteCardId?: number | null;
  favoriteDecks?: string | null;
}
