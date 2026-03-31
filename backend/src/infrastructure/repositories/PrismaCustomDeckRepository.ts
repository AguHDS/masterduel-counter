import { PrismaClient } from "@prisma/client";
import {
  CustomDeck,
  CustomDeckCreateDTO,
  CustomDeckUpdateDTO,
} from "@/domain/CustomDeck.js";
import { CustomDeckRepository } from "@/domain/ports/CustomDeckRepository.js";

export class PrismaCustomDeckRepository implements CustomDeckRepository {
  constructor(private prisma: PrismaClient) {}

  async createDeck(data: CustomDeckCreateDTO): Promise<CustomDeck> {
    const deck = await this.prisma.customDeck.create({
      data: {
        userId: data.userId,
        title: data.title,
        mainDeckCards: JSON.stringify(data.mainDeckCards),
        extraDeckCards: JSON.stringify(data.extraDeckCards),
        sideDeckCards: JSON.stringify(data.sideDeckCards || []),
        headerCardId: data.headerCardId,
        isPublic: data.isPublic ?? false,
      },
    });

    return this.mapToCustomDeck(deck);
  }

  async getDecksByUserId(userId: string): Promise<CustomDeck[]> {
    const decks = await this.prisma.customDeck.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return decks.map(this.mapToCustomDeck);
  }

  async getDeckById(deckId: number, userId: string): Promise<CustomDeck | null> {
    const deck = await this.prisma.customDeck.findFirst({
      where: {
        id: deckId,
        userId: userId,
      },
    });

    if (!deck) return null;

    return this.mapToCustomDeck(deck);
  }

  async updateDeck(
    deckId: number,
    userId: string,
    data: CustomDeckUpdateDTO
  ): Promise<CustomDeck> {
    const updateData: { title?: string; mainDeckCards?: string; extraDeckCards?: string; sideDeckCards?: string; headerCardId?: number | null; isPublic?: boolean } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.mainDeckCards !== undefined) {
      updateData.mainDeckCards = JSON.stringify(data.mainDeckCards);
    }
    if (data.extraDeckCards !== undefined) {
      updateData.extraDeckCards = JSON.stringify(data.extraDeckCards);
    }
    if (data.sideDeckCards !== undefined) {
      updateData.sideDeckCards = JSON.stringify(data.sideDeckCards);
    }
    if (data.headerCardId !== undefined) {
      updateData.headerCardId = data.headerCardId;
    }
    if (data.isPublic !== undefined) {
      updateData.isPublic = data.isPublic;
    }

    const deck = await this.prisma.customDeck.update({
      where: {
        id: deckId,
        userId: userId,
      },
      data: updateData,
    });

    return this.mapToCustomDeck(deck);
  }

  async deleteDeck(deckId: number, userId: string): Promise<void> {
    await this.prisma.customDeck.delete({
      where: {
        id: deckId,
        userId: userId,
      },
    });
  }

  async countDecksByUserId(userId: string): Promise<number> {
    return this.prisma.customDeck.count({
      where: { userId },
    });
  }

  private mapToCustomDeck(deck: {
    id: number;
    userId: string;
    title: string;
    mainDeckCards: string;
    extraDeckCards: string;
    sideDeckCards: string;
    headerCardId: number | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CustomDeck {
    return {
      id: deck.id,
      userId: deck.userId,
      title: deck.title,
      mainDeckCards: JSON.parse(deck.mainDeckCards),
      extraDeckCards: JSON.parse(deck.extraDeckCards),
      sideDeckCards: JSON.parse(deck.sideDeckCards),
      headerCardId: deck.headerCardId ?? undefined,
      isPublic: deck.isPublic,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
