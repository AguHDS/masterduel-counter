import { CardService } from "@/application/ports/CardService";
import { CardSearchResult, CardPreviewDTO, Card } from "@/domain/Card";
import { CardRepository } from "@/domain/ports/CardRepository";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService";
import { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService";

export class CardServiceImpl implements CardService {
  constructor(
    private cardRepository: CardRepository,
    private cardApiService: CardApiService,
    private imageStorageService: ImageStorageService,
  ) {}

  async searchCards(query: string): Promise<CardSearchResult[]> {
    const cards = await this.cardApiService.searchCardByNameFromExternalApi(query);

    return cards.map((card) => ({
      id: card.id,
      name: card.name,
      imageUrlExternal: card.card_images?.[0]?.image_url,
      imageUrlSmallExternal: card.card_images?.[0]?.image_url_small,
    }));
  }

  async selectCard(cardId: number): Promise<CardPreviewDTO> {
    // Check if card already exists in database
    const existingCard = await this.cardRepository.findById(cardId);

    if (existingCard) {
      return {
        id: existingCard.id,
        name: existingCard.name,
        imageUrl: existingCard.imageUrl,
        imageUrlSmall: existingCard.imageUrlSmall,
        imageUrlCropped: existingCard.imageUrlCropped,
      };
    }

    // Card doesn't exist - download from API and upload to Cloudinary
    const cardData = await this.cardApiService.findCardByIdFromExternalApi(cardId);

    if (!cardData) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    if (!cardData.card_images || cardData.card_images.length === 0) {
      throw new Error(`Card ${cardId} has no images`);
    }

    const imageData = cardData.card_images[0];

    // Download all three image variants from YGOPRODeck API
    const [imageBuffer, imageSmallBuffer, imageCroppedBuffer] =
      await Promise.all([
        this.cardApiService.downloadCardImageFromExternalApi(imageData.image_url),
        this.cardApiService.downloadCardImageFromExternalApi(imageData.image_url_small),
        this.cardApiService.downloadCardImageFromExternalApi(imageData.image_url_cropped),
      ]);

    // Generate public IDs for Cloudinary
    const publicIdBase = `card-${cardId}`;
    const publicIdSmallBase = `card-${cardId}-small`;
    const publicIdCroppedBase = `card-${cardId}-cropped`;

    // Upload all images to Cloudinary
    const [uploadResult, uploadResultSmall, uploadResultCropped] =
      await Promise.all([
        this.imageStorageService.uploadImageToCloudinary(imageBuffer, publicIdBase),
        this.imageStorageService.uploadImageToCloudinary(
          imageSmallBuffer,
          publicIdSmallBase,
        ),
        this.imageStorageService.uploadImageToCloudinary(
          imageCroppedBuffer,
          publicIdCroppedBase,
        ),
      ]);

    // Create card entity with isTemporary=true
    // Will be marked permanent when confirmSelectedCards is called
    const card: Card = {
      id: cardId,
      name: cardData.name,
      imageUrl: uploadResult.url,
      imageUrlSmall: uploadResultSmall.url,
      imageUrlCropped: uploadResultCropped.url,
      cloudinaryPublicId: uploadResult.publicId,
      cloudinaryPublicIdSmall: uploadResultSmall.publicId,
      cloudinaryPublicIdCropped: uploadResultCropped.publicId,
      isTemporary: true, // Marked as temporary - will be confirmed later
      createdAt: new Date().toISOString(),
    };

    await this.cardRepository.save(card);

    return {
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      imageUrlSmall: card.imageUrlSmall,
      imageUrlCropped: card.imageUrlCropped,
    };
  }

  async confirmSelectedCards(cardIds: number[]): Promise<void> {
    // Cards selected in UI exist only in browser memory until this method is called
    // This method:
    // 1. Creates non-existent cards as isTemporary=true (downloads images, uploads to Cloudinary)
    // 2. Marks all cards as isTemporary=false (permanent)
    //
    // FAILSAFE: If server crashes between step 1 and 2, some cards remain temporary.
    // Cron job will clean cards where isTemporary=true AND createdAt > 24h

    // Step 1: Create cards that don't exist yet (download from API -> upload to Cloudinary)
    for (const cardId of cardIds) {
      const existingCard = await this.cardRepository.findById(cardId);

      if (!existingCard) {
        try {
          await this.selectCard(cardId); // Creates as temporary
        } catch (error) {
          throw new Error(`Failed to create card ${cardId}` + (error instanceof Error ? `: ${error.message}` : ""));
        }
      }
    }

    // Step 2: Mark all cards as permanent (not temporary anymore)
    for (const cardId of cardIds) {
      await this.cardRepository.updateToPermanent(cardId);
    }

    // Note: 
    // The cron job will handle cleanup of cards older than 24h that remain temporary
    // This prevents accidental deletion of cards being edited in other instances
  }

  async cleanupTemporaryCards(): Promise<number> {
    // FAILSAFE CLEANUP: Remove temporary cards older than 24 hours
    // These are cards created during confirmSelectedCards that failed to be marked permanent
    // IMPORTANT: Cards selected in UI but never saved DON'T create DB records (only in browser memory)
    // This cleanup handles:
    // - Server crashes DURING confirmSelectedCards (between create and mark permanent)
    // - Network errors during the save process
    // - Bugs in the confirmation process
    // - Manual database operations

    const temporaryCards = await this.cardRepository.findTemporaryOlderThan(24);
    console.log(
      `[cleanupTemporaryCards] Found ${temporaryCards.length} temporary cards older than 24 hours`,
    );
    if (temporaryCards.length === 0) {
      console.log(
        `[cleanupTemporaryCards] No cleanup needed - all cards properly confirmed`,
      );
      return 0;
    }

    let deletedCount = 0;

    for (const card of temporaryCards) {
      try {
        // Delete from Cloudinary
        await this.imageStorageService.deleteImageFromCloudinary(card.cloudinaryPublicId);
        await this.imageStorageService.deleteImageFromCloudinary(
          card.cloudinaryPublicIdSmall,
        );
        await this.imageStorageService.deleteImageFromCloudinary(
          card.cloudinaryPublicIdCropped,
        );
        // Delete from database
        await this.cardRepository.deleteById(card.id);
        deletedCount++;
        console.log(
          `[cleanupTemporaryCards] Successfully deleted temporary card ${card.id} (${card.name})`,
        );
      } catch (error) {
        console.error(
          `[cleanupTemporaryCards] Failed to cleanup card ${card.id}:`,
          error,
        );
      }
    }

    console.log(
      `[cleanupTemporaryCards] Cleanup complete: ${deletedCount}/${temporaryCards.length} card(s) deleted`,
    );

    return deletedCount;
  }
}
