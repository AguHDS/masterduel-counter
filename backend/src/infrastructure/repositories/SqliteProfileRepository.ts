import { PrismaClient } from "@prisma/client";
import type { ProfileRepository } from "@/domain/ports/ProfileRepository.js";
import type { Profile, CreateProfileData, UpdateProfileData } from "@/domain/Profile.js";

export class SqliteProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async resolvePublicUserId(userIdOrSlug: string): Promise<string> {
    const resolvedUserId = userIdOrSlug;

    // Format 1: username-userId (e.g., "khela-r4TvicZBkyDiKkcERxodAJvICDtbRbis")
    // The userId is always after the last hyphen and is alphanumeric
    if (userIdOrSlug.includes("-")) {
      const parts = userIdOrSlug.split("-");
      const lastPart = parts[parts.length - 1];
      
      // Check if the last part looks like a userId (long alphanumeric string)
      if (lastPart && lastPart.length >= 20 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
        // Verify this userId actually exists
        const user = await this.prisma.user.findUnique({
          where: { id: lastPart },
          select: { id: true },
        });
        
        if (user) {
          return user.id;
        }
      }
    }

    // Format 2: numeric profile ID (e.g., "123")
    if (/^\d+$/.test(userIdOrSlug)) {
      const profileByPublicId = await this.prisma.profile.findUnique({
        where: { id: Number.parseInt(userIdOrSlug, 10) },
        select: { userId: true },
      });

      if (profileByPublicId?.userId) {
        return profileByPublicId.userId;
      }
    }

    // Format 3: direct userId (fallback - try as-is)
    // This handles cases where the userId is passed directly
    return resolvedUserId;
  }

  async findProfileByUserId(userId: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) return null;

    // Calculate total likes from all user instances
    const likesAggregate = await this.prisma.archetypeInstance.aggregate({
      where: { userId },
      _sum: { likes: true },
    });

    const totalLikes = likesAggregate._sum.likes || 0;

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      favoriteCardId: profile.favoriteCardId,
      favoriteDecks: profile.favoriteDecks,
      role: profile.user.role,
      totalLikes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async createProfile(data: CreateProfileData): Promise<Profile> {
    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        bio: data.bio || null,
        profilePictureUrl: data.profilePictureUrl || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
      },
      include: { user: true },
    });

    // Calculate total likes from all user instances
    const likesAggregate = await this.prisma.archetypeInstance.aggregate({
      where: { userId: data.userId },
      _sum: { likes: true },
    });

    const totalLikes = likesAggregate._sum.likes || 0;

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      favoriteCardId: profile.favoriteCardId,
      favoriteDecks: profile.favoriteDecks,
      role: profile.user.role,
      totalLikes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        bio: data.bio !== undefined ? data.bio : undefined,
        profilePictureUrl: data.profilePictureUrl !== undefined ? data.profilePictureUrl : undefined,
        cloudinaryPublicId: data.cloudinaryPublicId !== undefined ? data.cloudinaryPublicId : undefined,
        favoriteCardId: data.favoriteCardId !== undefined ? data.favoriteCardId : undefined,
        favoriteDecks: data.favoriteDecks !== undefined ? data.favoriteDecks : undefined,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    // Calculate total likes from all user instances
    const likesAggregate = await this.prisma.archetypeInstance.aggregate({
      where: { userId },
      _sum: { likes: true },
    });

    const totalLikes = likesAggregate._sum.likes || 0;

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      favoriteCardId: profile.favoriteCardId,
      favoriteDecks: profile.favoriteDecks,
      role: profile.user.role,
      totalLikes,
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

    // Calculate total likes from all user instances
    const likesAggregate = await this.prisma.archetypeInstance.aggregate({
      where: { userId },
      _sum: { likes: true },
    });

    const totalLikes = likesAggregate._sum.likes || 0;

    return {
      id: profile.id,
      userId: profile.userId,
      userName: profile.user.name,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      cloudinaryPublicId: profile.cloudinaryPublicId,
      favoriteCardId: profile.favoriteCardId,
      favoriteDecks: profile.favoriteDecks,
      role: profile.user.role,
      totalLikes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
