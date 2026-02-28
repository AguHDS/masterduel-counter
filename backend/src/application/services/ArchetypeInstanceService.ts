import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
  RegisterInstanceDTO,
} from "@/domain/ArchetypeInstance";
import { ArchetypeInstanceServicePort } from "../ports/ArchetypeInstanceService";
import { ArchetypeInstanceRepository } from "@/domain/ports/ArchetypeInstanceRepository";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { NotificationServicePort } from "@/application/ports/NotificationService";
import { ViewCountCache } from "@/infrastructure/adapters/ViewCountCache";
import { UserRepository } from "@/domain/ports/UserRepository";

const MAX_FAVORITES_USER = 20;

export class ArchetypeInstanceService implements ArchetypeInstanceServicePort {
  private viewCountCache: ViewCountCache;

  constructor(
    private instanceRepository: ArchetypeInstanceRepository,
    private cardPairRepository: ArchetypeCardPairRepository,
    private archetypeRepository: ArchetypeRepository,
    private notificationService: NotificationServicePort,
    private userRepository: UserRepository,
  ) {
    // Initialize view count cache with flush callback
    this.viewCountCache = new ViewCountCache((instanceId, count) =>
      this.instanceRepository.incrementViewCount(instanceId, count)
    );
  }

  async createOrUpdateInstance(
    data: ArchetypeInstanceCreateDTO,
  ): Promise<ArchetypeInstance> {
    // Always create new instance
    return this.instanceRepository.createArchetypeInstance(data);
  }

  async getInstanceById(id: number): Promise<ArchetypeInstance | null> {
    return this.instanceRepository.findArchetypeInstanceById(id);
  }

  // Used for Archetype instances list 
  async getInstancesByArchetypeId(
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findArchetypeInstanceByArchetypeId(archetypeId, sortBy);
  }

  /** Get all archetype instances created by a specific user (for user profile) */
  async getInstancesByUserId(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findArchetypeInstanceByUserId(userId, sortBy);
  }

  async searchInstancesByArchetypeIdAndTitle(
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.searchInstancesByArchetypeIdAndTitle(archetypeId, title, sortBy);
  }

  async searchInstancesByUserIdAndTitle(
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.searchInstancesByUserIdAndTitle(userId, title, sortBy);
  }

  async updateInstance(
    id: number,
    userId: string,
    data: ArchetypeInstanceUpdateDTO,
  ): Promise<ArchetypeInstance> {
    // Verify ownership
    const instance = await this.instanceRepository.findArchetypeInstanceById(id);
    if (!instance) {
      throw new Error("Instance not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Unauthorized: You can only edit your own instances");
    }

    return this.instanceRepository.updateArchetypeInstance(id, data);
  }

  async registerInstanceWithPairs(
    data: RegisterInstanceDTO,
  ): Promise<ArchetypeInstance> {
    const {
      archetypeId,
      userId,
      title,
      headerCardId,
      generalTip,
      cardPairs,
      instanceId,
    } = data;

    // Validate title
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required to register an archetype");
    }

    if (title.length > 100) {
      throw new Error("Title must be 100 characters or less");
    }

    if (generalTip && generalTip.length > 3000) {
      throw new Error("Description can't exceed 3000 characters");
    }

    // Validate card pairs
    if (!cardPairs || cardPairs.length === 0) {
      throw new Error(
        "At least one card pair is required to register an archetype",
      );
    }

    // Validate header card
    if (!headerCardId) {
      throw new Error("Header card is required to register an archetype");
    }

    let instance: ArchetypeInstance;

    if (instanceId) {
      // Update existing instance
      instance = await this.updateInstance(instanceId, userId, {
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    } else {
      // Create new instance
      instance = await this.createOrUpdateInstance({
        archetypeId,
        userId,
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    }

    // Delete existing pairs and create new ones
    await this.cardPairRepository.deleteByInstanceId(instance.id);

    const pairsToCreate = cardPairs.map((pair, index) => ({
      instance_id: instance.id,
      top_card_ids: pair.topCardIds,
      bottom_card_ids: pair.bottomCardIds,
      pair_order: index + 1,
      effectiveness: pair.effectiveness || null,
      comment: pair.comment || null,
    }));

    await this.cardPairRepository.CreateManyPairCards(pairsToCreate);

    // Mark archetype as registered if it is not already
    const archetype = await this.archetypeRepository.findArchetypeById(archetypeId);
    if (archetype && !archetype.registered) {
      await this.archetypeRepository.updateExistingArchetype(archetypeId, { registered: true });
    }

    return instance;
  }

  async deleteInstance(id: number, userId: string): Promise<void> {
    // Verify ownership
    const instance = await this.instanceRepository.findArchetypeInstanceById(id);
    if (!instance) {
      throw new Error("Instance not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own instances");
    }

    await this.instanceRepository.deleteArchetypeInstanceById(id);
  }

  async toggleInstanceLike(
    instanceId: number,
    userId: string,
  ): Promise<{ liked: boolean; likes: number }> {
    // Get the instance to check ownership
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);

    if (!instance) {
      throw new Error("Instance not found");
    }

    // Prevent users from liking their own instances
    if (instance.userId === userId) {
      throw new Error("You cannot like your own instance");
    }

    const result = await this.instanceRepository.ToggleLikeInstance(instanceId, userId);

    // Create or update notification (async, don't wait)
    if (result.liked) {
      // Like was added
      this.notificationService.createOrUpdateLikeNotification(instance.userId, instanceId)
        .catch(error => console.error("Failed to create like notification:", error));
    } else {
      // Like was removed
      this.notificationService.decrementOrDeleteAggregatedNotification(instance.userId, instanceId, "like")
        .catch(error => console.error("Failed to decrement like notification:", error));
    }

    return result;
  }

  async hasUserLikedInstance(
    instanceId: number,
    userId: string,
  ): Promise<boolean> {
    return this.instanceRepository.hasUserLikedInstance(instanceId, userId);
  }

  async toggleInstanceFavorite(
    instanceId: number,
    userId: string,
  ): Promise<{ favorited: boolean; favorites: number }> {
    // Get the instance to check if it exists
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);

    if (!instance) {
      throw new Error("Instance not found");
    }

    // Check if user already has this favorited
    const alreadyFavorited = await this.instanceRepository.hasUserFavoritedInstance(instanceId, userId);

    // If trying to add favorite (not remove), check limits
    if (!alreadyFavorited) {
      // Get user to check role
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Count current favorites
      const favoritedInstances = await this.instanceRepository.findFavoritedInstancesByUserId(userId);
      const currentCount = favoritedInstances.length;

      // Check limit based on role (supporters have unlimited)
      if (user.role === "user" && currentCount >= MAX_FAVORITES_USER) {
        throw new Error(`Maximum favorite limit reached (${MAX_FAVORITES_USER}). Upgrade to Supporter for unlimited favorites!`);
      }
    }

    const result = await this.instanceRepository.ToggleFavoriteInstance(instanceId, userId);

    // Only notify if favoriting someone else's guide (users can favorite their own)
    if (instance.userId !== userId) {
      // Create or update notification (async, don't wait)
      if (result.favorited) {
        // Favorite was added
        this.notificationService.createOrUpdateFavoriteNotification(instance.userId, instanceId)
          .catch(error => console.error("Failed to create favorite notification:", error));
      } else {
        // Favorite was removed
        this.notificationService.decrementOrDeleteAggregatedNotification(instance.userId, instanceId, "favorite")
          .catch(error => console.error("Failed to decrement favorite notification:", error));
      }
    }

    return result;
  }

  async hasUserFavoritedInstance(
    instanceId: number,
    userId: string,
  ): Promise<boolean> {
    return this.instanceRepository.hasUserFavoritedInstance(instanceId, userId);
  }

  async getFavoritedInstancesByUserId(
    userId: string,
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findFavoritedInstancesByUserId(userId);
  }

  async registerView(instanceId: number): Promise<void> {
    // Verify instance exists
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);
    if (!instance) {
      throw new Error("Instance not found");
    }

    // Increment in cache (will be flushed periodically)
    this.viewCountCache.increment(instanceId);
  }

  async getTotalViewsByUserId(userId: string): Promise<number> {
    return this.instanceRepository.getTotalViewsByUserId(userId);
  }

  async getLatestCreatedInstances(
    limit: number,
  ): Promise<ArchetypeInstanceWithDetails[]> {
    return this.instanceRepository.findLatestCreatedInstances(limit);
  }

  /**
   * Cleanup method to flush remaining views and stop the cache
   * Should be called on application shutdown
   */
  async shutdown(): Promise<void> {
    await this.viewCountCache.stop();
  }
}
