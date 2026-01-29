import { PrismaClient } from "@prisma/client";
import type { ProfileRepository } from "@/domain/ports/ProfileRepository";
import type { Profile, CreateProfileData, UpdateProfileData } from "@/domain/Profile";

export class SqliteProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async create(data: CreateProfileData): Promise<Profile> {
    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        bio: data.bio || null,
        profilePictureUrl: data.profilePictureUrl || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
      },
      include: { user: true },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async update(userId: string, data: UpdateProfileData): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        bio: data.bio !== undefined ? data.bio : undefined,
        profilePictureUrl: data.profilePictureUrl !== undefined ? data.profilePictureUrl : undefined,
        cloudinaryPublicId: data.cloudinaryPublicId !== undefined ? data.cloudinaryPublicId : undefined,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async deleteProfilePicture(userId: string): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        profilePictureUrl: null,
        cloudinaryPublicId: null,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
