import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "listuser";
const TEST_EMAIL = "list@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
let secondArchetypeId: number = 0;
const card1Id = 99990201;
const card2Id = 99990202;

// ──── SETUP ───────────────────────────────────────────

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const a1 = await prisma.archetype.upsert({
    where: { name: "TestArchetypeList" },
    create: { name: "TestArchetypeList" },
    update: { registered: false },
  });
  archetypeId = a1.id;

  const a2 = await prisma.archetype.upsert({
    where: { name: "TestArchetypeList2" },
    create: { name: "TestArchetypeList2" },
    update: { registered: false },
  });
  secondArchetypeId = a2.id;

  const cardBase = {
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "List Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "List Card 2", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.comboStepLeftSubCard.deleteMany();
  await prisma.comboStepSubCard.deleteMany();
  await prisma.comboStepMainCard.deleteMany();
  await prisma.comboStep.deleteMany();
  await prisma.cardPairBottom.deleteMany();
  await prisma.cardPairTop.deleteMany();
  await prisma.archetypeCardPair.deleteMany();
  await prisma.recommendedDeck.deleteMany();
  await prisma.instanceFavorite.deleteMany();
  await prisma.instanceLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.guideViewTracking.deleteMany();
  await prisma.initialHand.deleteMany();
  await prisma.archetypeInstance.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.archetype.update({ where: { id: archetypeId }, data: { registered: false } });
  await prisma.archetype.update({ where: { id: secondArchetypeId }, data: { registered: false } });
  await prisma.$disconnect();
});

async function registerAndLogin() {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({ user: TEST_USER, email: TEST_EMAIL, password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
  await agent.post("/api/auth/login").send({ user: TEST_USER, password: TEST_PASSWORD });
  return agent;
}

async function createGuide(
  agent: request.Agent,
  archId: number,
  title: string,
  guideType: "COUNTER" | "DECK" = "COUNTER",
) {
  const base: Record<string, unknown> = {
    guideType,
    title,
    headerCardId: card1Id,
  };
  if (guideType === "COUNTER") {
    base.cardPairs = [{ topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] }];
  } else {
    base.initialHands = [{ cardIds: [card1Id, card2Id] }];
  }
  const res = await agent.post(`/api/archetypes/${archId}/register`).send(base);
  return res.body.instance;
}

// ──── LISTING TESTS ───────────────────────────────────

describe("Guide Listing & Search", () => {
  it("should list guides by archetype", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "List Guide A");
    await createGuide(agent, archetypeId, "List Guide B");

    const res = await request(app).get(`/api/archetypes/${archetypeId}/instances`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it("should filter by type=deck", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "Counter One", "COUNTER");
    await createGuide(agent, archetypeId, "Deck One", "DECK");

    const res = await request(app).get(`/api/archetypes/${archetypeId}/instances?type=deck`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].guideType).toBe("DECK");
  });

  it("should sort by likes", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "Guide A");
    await createGuide(agent, archetypeId, "Guide B");

    const res = await request(app).get(`/api/archetypes/${archetypeId}/instances?sortBy=likes`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should search guides by title", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "Blue-Eyes Combo");
    await createGuide(agent, archetypeId, "Dark Magician Setup");

    const res = await request(app)
      .get(`/api/archetypes/${archetypeId}/instances/search`)
      .query({ title: "Blue" });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toContain("Blue");
  });

  it("should reject search without title", async () => {
    const res = await request(app).get(`/api/archetypes/${archetypeId}/instances/search`);

    expect(res.status).toBe(400);
  });

  it("should list latest guides", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "Latest 1");
    await createGuide(agent, archetypeId, "Latest 2");
    await createGuide(agent, archetypeId, "Latest 3");

    const res = await request(app).get("/api/guides/latest?limit=2");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should list all guides with search", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "Dragon Link");
    await createGuide(agent, archetypeId, "Swordsoul Tenyi");

    const res = await request(app).get("/api/guides?search=Dragon");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should list user's guides (not owner)", async () => {
    const agent = await registerAndLogin();
    await createGuide(agent, archetypeId, "My Guide");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirstOrThrow({ where: { name: TEST_USER } });
    await prisma.$disconnect();

    const res = await request(app).get(`/api/users/${user.id}/instances`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});
