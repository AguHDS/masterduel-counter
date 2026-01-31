import { PrismaClient } from "@prisma/client";
import {
  RecommendedDeck,
  RecommendedDeckCreateDTO,
  RecommendedDeckUpdateDTO,
} from "../../domain/RecommendedDeck";
import { RecommendedDeckRepository } from "../../domain/ports/RecommendedDeckRepository";

export class PrismaRecommendedDeckRepository implements RecommendedDeckRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: RecommendedDeckCreateDTO): Promise<RecommendedDeck> {
    const deck = await this.prisma.recommendedDeck.create({
      data: {
        instanceId: data.instanceId,
        title: data.title,
        mainDeckCards: JSON.stringify(data.mainDeckCards),
        extraDeckCards: JSON.stringify(data.extraDeckCards),
      },
    });

    return this.mapToRecommendedDeck(deck);
  }

  async findByInstanceId(instanceId: number): Promise<RecommendedDeck | null> {
    const deck = await this.prisma.recommendedDeck.findUnique({
      where: { instanceId },
    });

    if (!deck) return null;

    return this.mapToRecommendedDeck(deck);
  }

  async update(
    instanceId: number,
    data: RecommendedDeckUpdateDTO
  ): Promise<RecommendedDeck> {
    const updateData: { title?: string; mainDeckCards?: string; extraDeckCards?: string } = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.mainDeckCards !== undefined) {
      updateData.mainDeckCards = JSON.stringify(data.mainDeckCards);
    }
    if (data.extraDeckCards !== undefined) {
      updateData.extraDeckCards = JSON.stringify(data.extraDeckCards);
    }

    const deck = await this.prisma.recommendedDeck.update({
      where: { instanceId },
      data: updateData,
    });

    return this.mapToRecommendedDeck(deck);
  }

  async delete(instanceId: number): Promise<void> {
    await this.prisma.recommendedDeck.delete({
      where: { instanceId },
    });
  }

  private mapToRecommendedDeck(deck: {
    id: number;
    instanceId: number;
    title: string | null;
    mainDeckCards: string;
    extraDeckCards: string;
    createdAt: Date;
    updatedAt: Date;
  }): RecommendedDeck {
    return {
      id: deck.id,
      instanceId: deck.instanceId,
      title: deck.title || undefined,
      mainDeckCards: JSON.parse(deck.mainDeckCards),
      extraDeckCards: JSON.parse(deck.extraDeckCards),
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
