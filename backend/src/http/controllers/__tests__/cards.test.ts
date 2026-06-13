import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;
const cachedCardId = 99990601;

// SETUPS

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Create a fully-cached test card (with frameType so services return local data)
  await prisma.card.upsert({
    where: { id: cachedCardId },
    create: {
      id: cachedCardId,
      name: "Cache Test Card",
      type: "Spell Card",
      desc: "A test card for caching",
      race: "Normal",
      attribute: null,
      atk: null,
      def: null,
      level: null,
      imageUrl: "http://loc/card.jpg",
      imageUrlSmall: "http://loc/card_small.jpg",
      imageUrlCropped: "http://loc/card_cropped.jpg",
      frameType: "spell",
    },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  // Don't delete the cached test card
  await prisma.cardPairBottom.deleteMany();
  await prisma.cardPairTop.deleteMany();
  await prisma.archetypeCardPair.deleteMany();
  await prisma.comboStepLeftSubCard.deleteMany();
  await prisma.comboStepSubCard.deleteMany();
  await prisma.comboStepMainCard.deleteMany();
  await prisma.comboStep.deleteMany();
  await prisma.recommendedDeck.deleteMany();
  await prisma.monthlyGuideRanking.deleteMany();
  await prisma.monthlyUserRanking.deleteMany();
  await prisma.instanceFavorite.deleteMany();
  await prisma.instanceLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.guideViewTracking.deleteMany();
  await prisma.guideRequest.deleteMany();
  await prisma.initialHand.deleteMany();
  await prisma.archetypeInstance.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// CONFIRM CARDS

describe("POST /api/cards/confirm", () => {
  it("should confirm existing cached cards", async () => {
    const res = await request(app)
      .post("/api/cards/confirm")
      .send({ cardIds: [cachedCardId] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject non-array cardIds", async () => {
    const res = await request(app)
      .post("/api/cards/confirm")
      .send({ cardIds: "not-an-array" });

    expect(res.status).toBe(400);
  });

  it("should reject invalid card ID in array", async () => {
    const res = await request(app)
      .post("/api/cards/confirm")
      .send({ cardIds: [0, -1, "abc"] });

    expect(res.status).toBe(400);
  });

  it("should reject > 200 cardIds", async () => {
    const ids = Array.from({ length: 201 }, (_, i) => i + 1);

    const res = await request(app)
      .post("/api/cards/confirm")
      .send({ cardIds: ids });

    expect(res.status).toBe(400);
  });
});

// SELECT CARD

describe("POST /api/cards/select", () => {
  it("should select an existing cached card", async () => {
    const res = await request(app)
      .post("/api/cards/select")
      .send({ cardId: cachedCardId });

    expect(res.status).toBe(200);
    expect(res.body.card).toBeDefined();
    expect(res.body.card.id).toBe(cachedCardId);
    expect(res.body.card.name).toBe("Cache Test Card");
    expect(res.body.card.frameType).toBe("spell");
  });

  it("should reject missing cardId", async () => {
    const res = await request(app)
      .post("/api/cards/select")
      .send({});

    expect(res.status).toBe(400);
  });
});

// GET CARD DETAILS

describe("GET /api/cards/:cardId", () => {
  it("should return details for an existing card", async () => {
    const res = await request(app).get(`/api/cards/${cachedCardId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(cachedCardId);
    expect(res.body.name).toBe("Cache Test Card");
    expect(res.body.type).toBe("Spell Card");
  });

  it("should reject invalid card ID", async () => {
    const res = await request(app).get("/api/cards/abc");

    expect(res.status).toBe(400);
  });
});
