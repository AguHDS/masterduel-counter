import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "guidecruduser";
const TEST_EMAIL = "guidecrud@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990001;
const card2Id = 99990002;

// SETUP

beforeAll(async () => {
  // 1: Create DB fixtures FIRST (before importing app)
  // This ensures cards/archetype exist when the app's PrismaClient connects
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Create test archetype
  const archetype = await prisma.archetype.upsert({
    where: { name: "TestArchetypeCrud" },
    create: { name: "TestArchetypeCrud" },
    update: { registered: false },
  });
  archetypeId = archetype.id;

  // Create test cards
  const cardBase = {
    imageUrl: "http://localhost/card.jpg",
    imageUrlSmall: "http://localhost/card_small.jpg",
    imageUrlCropped: "http://localhost/card_cropped.jpg",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "Test Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Test Card 2", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  // 2: Now import the app (its PrismaClient will connect to the same test.db)
  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Clean guides-related data
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

  // Reset archetype registered flag
  await prisma.archetype.update({
    where: { id: archetypeId },
    data: { registered: false },
  });

  await prisma.$disconnect();
});

async function registerAndLogin() {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ user: TEST_USER, email: TEST_EMAIL, password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
  await agent
    .post("/api/auth/login")
    .send({ user: TEST_USER, password: TEST_PASSWORD });
  return agent;
}

const COUNTER_GUIDE_BODY = {
  guideType: "COUNTER",
  title: "Test Counter Guide",
  headerCardId: 99990001,
  cardPairs: [
    {
      topCardIds: [99990001],
      bottomCardIds: [{ cardId: 99990002, effectiveness: "EFFECTIVE" }],
    },
  ],
};

const DECK_GUIDE_BODY = {
  guideType: "DECK",
  title: "Test Deck Guide",
  headerCardId: 99990001,
  initialHands: [
    {
      cardIds: [99990001, 99990002],
      description: "Best opening hand",
    },
  ],
};

// CRUD TESTS

describe("Guide CRUD", () => {
  // Create
  describe("POST /api/archetypes/:id/register", () => {
    it("should create a COUNTER guide", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.instance).toBeDefined();
      expect(res.body.instance.guideType).toBe("COUNTER");
      expect(res.body.instance.title).toBe("Test Counter Guide");
    });

    it("should create a DECK guide", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(DECK_GUIDE_BODY);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.instance.guideType).toBe("DECK");
      expect(res.body.instance.title).toBe("Test Deck Guide");
    });

    it("should reject without authentication", async () => {
      const res = await request(app)
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);

      expect(res.status).toBe(401);
    });

    it("should reject invalid guideType", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ ...COUNTER_GUIDE_BODY, guideType: "INVALID" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/must be either/i);
    });

    it("should reject COUNTER guide without cardPairs", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ guideType: "COUNTER", title: "No pairs" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cardPairs must be an array/i);
    });

    it("should reject DECK guide without initialHands", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ guideType: "DECK", title: "No hands" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/initialHands must be an array/i);
    });

    it("should reject empty cardPairs array", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ guideType: "COUNTER", title: "Empty pairs", cardPairs: [] });

      expect(res.status).toBeLessThan(500);
    });

    it("should reject empty title", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ ...COUNTER_GUIDE_BODY, title: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title|Title/i);
    });

    it("should reject cardPair with invalid card ID", async () => {
      const agent = await registerAndLogin();

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({
          guideType: "COUNTER",
          title: "Bad card",
          headerCardId: 99990001,
          cardPairs: [{ topCardIds: [0] }],
        });

      expect(res.status).toBe(400);
    });
  });

  // READ

  describe("GET /api/instances/:instanceId", () => {
    it("should return a guide by ID", async () => {
      const agent = await registerAndLogin();
      const create = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);
      const instanceId = create.body.instance.id;

      const res = await request(app).get(`/api/instances/${instanceId}`);

      expect(res.status).toBe(200);
      expect(res.body.instance).toBeDefined();
      expect(res.body.instance.title).toBe("Test Counter Guide");

      const cardPairs = res.body.cardPairs;
      expect(Array.isArray(cardPairs)).toBe(true);
      expect(cardPairs.length).toBeGreaterThan(0);
    });

    it("should return 404 for nonexistent guide", async () => {
      const res = await request(app).get("/api/instances/99999");

      expect(res.status).toBe(404);
    });
  });

  // UPDATE

  describe("Guide update (re-save with instanceId)", () => {
    it("should update an existing guide", async () => {
      const agent = await registerAndLogin();
      const create = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);
      const instanceId = create.body.instance.id;

      const res = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ ...COUNTER_GUIDE_BODY, title: "Updated Title", instanceId });

      expect(res.status).toBe(200);
      expect(res.body.instance.title).toBe("Updated Title");
    });

    it("should reject update from different user", async () => {
      const agent1 = await registerAndLogin();
      const create = await agent1
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);
      const instanceId = create.body.instance.id;

      const agent2 = request.agent(app);
      await agent2
        .post("/api/auth/register")
        .send({ user: "seconduser2", email: "second2@example.com", password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
      await agent2
        .post("/api/auth/login")
        .send({ user: "seconduser2", password: TEST_PASSWORD });

      const res = await agent2
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({ ...COUNTER_GUIDE_BODY, title: "Hacked", instanceId });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not your|ownership|unauthorized|own/i);
    });
  });

  // DELETE

  describe("DELETE /api/instances/:instanceId", () => {
    it("should delete own guide", async () => {
      const agent = await registerAndLogin();
      const create = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);
      const instanceId = create.body.instance.id;

      const res = await agent.delete(`/api/instances/${instanceId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const get = await request(app).get(`/api/instances/${instanceId}`);
      expect(get.status).toBe(404);
    });

    it("should reject deleting another user's guide", async () => {
      const agent1 = await registerAndLogin();
      const create = await agent1
        .post(`/api/archetypes/${archetypeId}/register`)
        .send(COUNTER_GUIDE_BODY);
      const instanceId = create.body.instance.id;

      const agent2 = request.agent(app);
      await agent2
        .post("/api/auth/register")
        .send({ user: "anotheruser", email: "another@example.com", password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
      await agent2
        .post("/api/auth/login")
        .send({ user: "anotheruser", password: TEST_PASSWORD });

      const res = await agent2.delete(`/api/instances/${instanceId}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not your|ownership|unauthorized|own/i);
    });
  });
});
