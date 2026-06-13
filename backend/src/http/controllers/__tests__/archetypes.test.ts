import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const ARCH_NAME = "TestArchetypeCards";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990651;

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Create archetype for testing
  const archetype = await prisma.archetype.upsert({
    where: { name: ARCH_NAME },
    create: { name: ARCH_NAME },
    update: { registered: false },
  });
  archetypeId = archetype.id;

  // Create a card (for archetype-with-header to have a header card)
  await prisma.card.upsert({
    where: { id: card1Id },
    create: {
      id: card1Id,
      name: "Arch Header Card",
      type: "Monster",
      desc: "A test monster",
      race: "Warrior",
      imageUrl: "http://loc/c.jpg",
      imageUrlSmall: "http://loc/cs.jpg",
      imageUrlCropped: "http://loc/cc.jpg",
      frameType: "normal",
    },
    update: {},
  });

  // Create a guide instance under this archetype with a header card
  // This makes the archetype "registered" and gives with-header something to return
  try {
    await prisma.archetypeInstance.create({
      data: {
        archetypeId: archetype.id,
        userId: "system",
        title: "Arch Test Guide",
        guideType: "COUNTER",
        headerCardId: card1Id,
      },
    });
    await prisma.archetype.update({
      where: { id: archetype.id },
      data: { registered: true },
    });
  } catch {
    // Instance might already exist from previous run
  }

  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
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
  // Re-create essential test data if needed
  await prisma.$disconnect();
});

// WITH HEADER

describe("GET /api/archetypes/:id/with-header", () => {
  it("should return archetype with header card", async () => {
    const res = await request(app).get(`/api/archetypes/${archetypeId}/with-header`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.archetype).toBeDefined();
    expect(res.body.archetype.name).toBe(ARCH_NAME);
  });

  it("should return 404 for non-existent archetype", async () => {
    const res = await request(app).get("/api/archetypes/99999/with-header");

    expect(res.status).toBe(404);
  });

  it("should return 404 for non-existent slug archetype", async () => {
    const res = await request(app).get("/api/archetypes/abc/with-header");

    expect(res.status).toBe(404);
  });
});

// STATS

describe("GET /api/archetypes/stats", () => {
  it("should return general stats", async () => {
    const res = await request(app).get("/api/archetypes/stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject invalid limit", async () => {
    const res = await request(app).get("/api/archetypes/stats?limit=999");

    expect(res.status).toBe(400);
  });

  it("should reject invalid type parameter", async () => {
    const res = await request(app).get("/api/archetypes/stats?type=invalid");

    expect(res.status).toBe(400);
  });
});

// SEARCH

describe("GET /api/searchArchetype", () => {
  it("should find archetype by name", async () => {
    const res = await request(app).get(`/api/searchArchetype?name=${ARCH_NAME}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.archetypes).toBeDefined();
    expect(res.body.data.archetypes.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.archetypes[0].name).toBe(ARCH_NAME);
  });

  it("should reject empty name", async () => {
    const res = await request(app).get("/api/searchArchetype?name=");

    expect(res.status).toBe(400);
  });

  it("should reject name over 100 characters", async () => {
    const longName = "a".repeat(101);
    const res = await request(app).get(`/api/searchArchetype?name=${longName}`);

    expect(res.status).toBe(400);
  });
});
