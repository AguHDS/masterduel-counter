import { CardService } from "@/application/ports/CardService";
import { CardSearchResult, CardPreviewDTO, Card } from "@/domain/Card";
import { CardRepository } from "@/domain/ports/CardRepository";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService";
import { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService";

export class CardServiceImpl implements CardService {
  constructor(
    private cardRepository: CardRepository,
    private cardApiService: CardApiService,
    private imageStorageService: ImageStorageService
  ) {}

  async searchCards(query: string): Promise<CardSearchResult[]> {
    const cards = await this.cardApiService.searchByName(query);
    
    return cards.map(card => ({
      id: card.id,
      name: card.name,
      imageUrlExternal: card.card_images?.[0]?.image_url,
      imageUrlSmallExternal: card.card_images?.[0]?.image_url_small,
    }));
  }

  async selectCard(cardId: number): Promise<CardPreviewDTO> {
    const existingCard = await this.cardRepository.findById(cardId);
    
    if (existingCard) {
      return {
        id: existingCard.id,
        name: existingCard.name,
        imageUrl: existingCard.imageUrl,
        imageUrlSmall: existingCard.imageUrlSmall,
      };
    }

    const cardData = await this.cardApiService.findById(cardId);
    
    if (!cardData) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    if (!cardData.card_images || cardData.card_images.length === 0) {
      throw new Error(`Card ${cardId} has no images`);
    }

    const imageData = cardData.card_images[0];
    
    const [imageBuffer, imageSmallBuffer] = await Promise.all([
      this.cardApiService.downloadImage(imageData.image_url),
      this.cardApiService.downloadImage(imageData.image_url_small),
    ]);

    const publicIdBase = `card-${cardId}`;
    const publicIdSmallBase = `card-${cardId}-small`;

    const [uploadResult, uploadResultSmall] = await Promise.all([
      this.imageStorageService.uploadImage(imageBuffer, publicIdBase),
      this.imageStorageService.uploadImage(imageSmallBuffer, publicIdSmallBase),
    ]);

    const card: Card = {
      id: cardId,
      name: cardData.name,
      imageUrl: uploadResult.url,
      imageUrlSmall: uploadResultSmall.url,
      cloudinaryPublicId: uploadResult.publicId,
      cloudinaryPublicIdSmall: uploadResultSmall.publicId,
      isTemporary: true,
      createdAt: new Date().toISOString(),
    };

    await this.cardRepository.save(card);

    return {
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl,
      imageUrlSmall: card.imageUrlSmall,
    };
  }

  async confirmSelectedCards(cardIds: number[]): Promise<void> {
    for (const cardId of cardIds) {
      await this.cardRepository.updateToPermament(cardId);
    }

    const allTemporaryCards = await this.cardRepository.findTemporaryOlderThan(0);
    
    const cardsToDelete = allTemporaryCards.filter(
      card => !cardIds.includes(card.id)
    );

    for (const card of cardsToDelete) {
      try {
        await this.imageStorageService.deleteImage(card.cloudinaryPublicId);
        await this.imageStorageService.deleteImage(card.cloudinaryPublicIdSmall);
      } catch (error) {
        console.error(`Failed to delete images for card ${card.id}:`, error);
      }
      
      await this.cardRepository.deleteById(card.id);
    }
  }

  async cleanupTemporaryCards(): Promise<number> {
    const temporaryCards = await this.cardRepository.findTemporaryOlderThan(24);
    
    let deletedCount = 0;
    
    for (const card of temporaryCards) {
      try {
        await this.imageStorageService.deleteImage(card.cloudinaryPublicId);
        await this.imageStorageService.deleteImage(card.cloudinaryPublicIdSmall);
        await this.cardRepository.deleteById(card.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to cleanup card ${card.id}:`, error);
      }
    }
    
    return deletedCount;
  }
}
