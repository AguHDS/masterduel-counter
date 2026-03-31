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
    // Get the highest displayOrder for this user and increment by 1
    const maxOrder = await this.prisma.customDeck.findFirst({
      where: { userId: data.userId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const deck = await this.prisma.customDeck.create({
      data: {
        userId: data.userId,
        title: data.title,
        mainDeckCards: JSON.stringify(data.mainDeckCards),
        extraDeckCards: JSON.stringify(data.extraDeckCards),
        sideDeckCards: JSON.stringify(data.sideDeckCards || []),
        headerCardId: data.headerCardId,
        isPublic: data.isPublic ?? false,
        displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
      },
    });

    return this.mapToCustomDeck(deck);
  }

  async getDecksByUserId(userId: string): Promise<CustomDeck[]> {
    const decks = await this.prisma.customDeck.findMany({
      where: { userId },
      orderBy: { displayOrder: "asc" },
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
    const updateData: { title?: string; mainDeckCards?: string; extraDeckCards?: string; sideDeckCards?: string; headerCardId?: number | null; isPublic?: boolean; displayOrder?: number } = {};

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
    if (data.displayOrder !== undefined) {
      updateData.displayOrder = data.displayOrder;
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

  async reorderDecks(userId: string, deckOrders: { deckId: number; displayOrder: number }[]): Promise<void> {
    // Use transaction to update all decks at once
    await this.prisma.$transaction(
      deckOrders.map((order) =>
        this.prisma.customDeck.update({
          where: { id: order.deckId, userId },
          data: { displayOrder: order.displayOrder },
        })
      )
    );
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
    displayOrder: number;
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
      displayOrder: deck.displayOrder,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
