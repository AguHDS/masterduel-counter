import {
  Guide,
  GuideCreateDTO,
  GuideUpdateDTO,
  GuideListItem,
  RegisterGuideDTO,
} from "@/domain/Guide.js";
import { GuideInstanceServicePort } from "../ports/GuideApplicationPort.js";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";
import { GuideCardPairRepository } from "@/domain/ports/GuideCardPairRepository.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";
import { ViewCountCache } from "@/infrastructure/adapters/ViewCountCache.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";

const MAX_FAVORITES_USER = 20;

export class GuideApplicationService implements GuideInstanceServicePort {
  private viewCountCache: ViewCountCache;

  constructor(
    private instanceRepository: GuideRepository,
    private cardPairRepository: GuideCardPairRepository,
    private archetypeRepository: ArchetypeRepository,
    private notificationService: NotificationApplicationPort,
    private userRepository: UserRepository,
  ) {
    // Initialize view count cache with flush callback
    this.viewCountCache = new ViewCountCache((instanceId, count) =>
      this.instanceRepository.incrementViewCount(instanceId, count)
    );
  }

  /** Creates or updates a guide */
  async createOrUpdateGuide(
    data: GuideCreateDTO,
  ): Promise<Guide> {
    // Always create new guide
    return this.instanceRepository.createArchetypeInstance(data);
  }

  async getGuideById(id: number): Promise<Guide | null> {
    return this.instanceRepository.findArchetypeInstanceById(id);
  }

  /** Used for Archetype guide list  */
  async getGuidesByArchetypeId(
    archetypeId: number,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> {
    return this.instanceRepository.findArchetypeInstanceByArchetypeId(archetypeId, sortBy);
  }

  /** Get all archetype guides created by a user (for user profile) */
  async getGuideListByUserId(
    userId: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> {
    return this.instanceRepository.findArchetypeInstanceByUserId(userId, sortBy);
  }

  /** Search guide items by archetype ID and title */
  async searchGuideItemList(
    archetypeId: number,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> {
    return this.instanceRepository.searchGuideItemList(archetypeId, title, sortBy);
  }

  /** Search guide items created by a user (for user profile) */
  async searchGuideItemListProfile(
    userId: string,
    title: string,
    sortBy: "likes" | "updated" = "updated",
  ): Promise<GuideListItem[]> {
    return this.instanceRepository.searchGuideItemListProfile(userId, title, sortBy);
  }

  /** Updates a guide */
  async updateGuide(
    id: number,
    userId: string,
    data: GuideUpdateDTO,
  ): Promise<Guide> {
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

  async registerGuide(
    data: RegisterGuideDTO,
  ): Promise<Guide> {
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

    let instance: Guide;

    if (instanceId) {
      // Update existing instance
      instance = await this.updateGuide(instanceId, userId, {
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    } else {
      // Create new instance
      instance = await this.createOrUpdateGuide({
        archetypeId,
        userId,
        title,
        headerCardId,
        generalTip: generalTip || null,
      });
    }

    // Delete existing pairs and create new ones
    await this.cardPairRepository.deleteCardPairsByGuideId(instance.id);

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

  /** Deletes a guide */
  async deleteGuide(id: number, userId: string): Promise<void> {
    // Verify ownership
    const instance = await this.instanceRepository.findArchetypeInstanceById(id);
    if (!instance) {
      throw new Error("Guide not found");
    }

    if (instance.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own guides");
    }

    await this.instanceRepository.deleteArchetypeInstanceById(id);
  }

  /** Toggle like on a guide */
  async toggleLikeGuide(
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

  /** Check if a user has liked a guide */
  async hasUserLikedGuide(
    instanceId: number,
    userId: string,
  ): Promise<boolean> {
    return this.instanceRepository.hasUserLikedGuide(instanceId, userId);
  }

  /** Toggle favorite on a guide */
  async toggleFavoriteGuide(
    instanceId: number,
    userId: string,
  ): Promise<{ favorited: boolean; favorites: number }> {
    // Get the instance to check if it exists
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);

    if (!instance) {
      throw new Error("Instance not found");
    }

    // Check if user already has this favorited
    const alreadyFavorited = await this.instanceRepository.hasUserFavoritedGuide(instanceId, userId);

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

    const result = await this.instanceRepository.toggleFavoriteGuide(instanceId, userId);

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

  /** Check if a user has favorited a guide */
  async hasUserFavoritedGuide(
    instanceId: number,
    userId: string,
  ): Promise<boolean> {
    return this.instanceRepository.hasUserFavoritedGuide(instanceId, userId);
  }

  /** Get all favorited guides by a user (for user profile) */
  async getFavoritedGuidesByUserId(
    userId: string,
  ): Promise<GuideListItem[]> {
    return this.instanceRepository.findFavoritedInstancesByUserId(userId);
  }

  /** Register a view for a guide */
  async registerView(instanceId: number): Promise<void> {
    // Verify instance exists
    const instance = await this.instanceRepository.findArchetypeInstanceById(instanceId);
    if (!instance) {
      throw new Error("Instance not found");
    }

    // Increment in cache (will be flushed periodically)
    this.viewCountCache.increment(instanceId);
  }

  /** Get the total views that a user's guides have received (for user profile) */
  async getTotalViewsByUserId(userId: string): Promise<number> {
    return this.instanceRepository.getTotalViewsByUserId(userId);
  }

  /** Get the latest created guides (for guide list) */
  async getLastedCreatedGuides(
    limit: number,
  ): Promise<GuideListItem[]> {
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
