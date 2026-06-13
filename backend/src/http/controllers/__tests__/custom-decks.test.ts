import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "deckuser";
const TEST_EMAIL = "deckuser@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
const card1Id = 99990701;
const card2Id = 99990702;

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const cardBase = {
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
    frameType: "spell",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "Deck Card 1", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Deck Card 2", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.customDeck.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

async function registerAndLogin(user = TEST_USER, email = TEST_EMAIL) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({ user, email, password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
  await agent.post("/api/auth/login").send({ user, password: TEST_PASSWORD });

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const dbUser = await prisma.user.findFirstOrThrow({ where: { name: user } });
  await prisma.$disconnect();
  return { agent, userId: dbUser.id };
}

async function createDeck(agent: request.Agent, userId: string, overrides: Record<string, unknown> = {}) {
  return agent.post(`/api/users/${userId}/custom-decks`).send({
    title: "Test Deck",
    mainDeckCards: [card1Id],
    extraDeckCards: [card2Id],
    ...overrides,
  });
}

// CREATE

describe("POST /api/users/:userId/custom-decks", () => {
  it("should create a deck", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await createDeck(agent, userId);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.deck).toBeDefined();
    expect(res.body.deck.title).toBe("Test Deck");
  });

  it("should reject title over 100 characters", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await createDeck(agent, userId, { title: "a".repeat(101) });

    expect(res.status).toBe(400);
  });

  it("should reject non-array mainDeckCards", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await createDeck(agent, userId, { mainDeckCards: "not-array", extraDeckCards: [card2Id] });

    expect(res.status).toBe(400);
  });

  it("should reject > 60 cards in main deck", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await createDeck(agent, userId, { mainDeckCards: Array.from({ length: 61 }, (_, i) => i + 1000) });

    expect(res.status).toBe(400);
  });

  it("should reject without auth", async () => {
    const res = await request(app)
      .post("/api/users/any/custom-decks")
      .send({ title: "No Auth", mainDeckCards: [card1Id], extraDeckCards: [card2Id] });

    expect(res.status).toBe(401);
  });

  it("should reject 11th deck for regular user", async () => {
    const { agent, userId } = await registerAndLogin();

    // Insert 10 decks directly via Prisma
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    for (let i = 0; i < 10; i++) {
      await prisma.customDeck.create({
        data: {
          userId,
          title: `Max Deck ${i}`,
          mainDeckCards: JSON.stringify([card1Id]),
          extraDeckCards: JSON.stringify([]),
        },
      });
    }

    const res = await createDeck(agent, userId);

    expect(res.status).toBe(403);
    await prisma.$disconnect();
  });

  it("should allow supporter to create up to 30 decks", async () => {
    const { agent, userId } = await registerAndLogin("deckSupporter", "decksupp@example.com");

    // Promote to supporter
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const dbUser = await prisma.user.findFirstOrThrow({ where: { name: "deckSupporter" } });
    await prisma.user.update({ where: { id: dbUser.id }, data: { role: "supporter" } });

    // Insert 30 decks
    for (let i = 0; i < 30; i++) {
      await prisma.customDeck.create({
        data: {
          userId: dbUser.id,
          title: `Supporter Deck ${i}`,
          mainDeckCards: JSON.stringify([card1Id]),
          extraDeckCards: JSON.stringify([]),
        },
      });
    }

    // 31st should be rejected
    const res = await createDeck(agent, userId);

    expect(res.status).toBe(403);
    await prisma.$disconnect();
  });
});

// LIST

describe("GET /api/users/:userId/custom-decks", () => {
  it("should list decks for a user", async () => {
    const { agent, userId } = await registerAndLogin();
    await createDeck(agent, userId);

    const res = await request(app).get(`/api/users/${userId}/custom-decks`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.decks)).toBe(true);
    expect(res.body.decks.length).toBeGreaterThanOrEqual(1);
  });
});

// GET SINGLE

describe("GET /api/users/:userId/custom-decks/:deckId", () => {
  it("should get own deck", async () => {
    const { agent, userId } = await registerAndLogin();
    const create = await createDeck(agent, userId);
    const deckId = create.body.deck.id;

    const res = await agent.get(`/api/users/${userId}/custom-decks/${deckId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deck.title).toBe("Test Deck");
  });

  it("should return 404 for non-existent deck", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await agent.get(`/api/users/${userId}/custom-decks/99999`);

    expect(res.status).toBe(404);
  });
});

// UPDATE

describe("PUT /api/users/:userId/custom-decks/:deckId", () => {
  it("should update deck title", async () => {
    const { agent, userId } = await registerAndLogin();
    const create = await createDeck(agent, userId);
    const deckId = create.body.deck.id;

    const res = await agent
      .put(`/api/users/${userId}/custom-decks/${deckId}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.deck.title).toBe("Updated Title");
  });

  it("should reject update without auth", async () => {
    const res = await request(app)
      .put("/api/users/any/custom-decks/1")
      .send({ title: "Hack" });

    expect(res.status).toBe(401);
  });
});

// DELETE

describe("DELETE /api/users/:userId/custom-decks/:deckId", () => {
  it("should delete own deck", async () => {
    const { agent, userId } = await registerAndLogin();
    const create = await createDeck(agent, userId);
    const deckId = create.body.deck.id;

    const res = await agent.delete(`/api/users/${userId}/custom-decks/${deckId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deleted
    const get = await agent.get(`/api/users/${userId}/custom-decks/${deckId}`);
    expect(get.status).toBe(404);
  });

  it("should reject delete without auth", async () => {
    const res = await request(app).delete("/api/users/any/custom-decks/1");

    expect(res.status).toBe(401);
  });
});

// REORDER

describe("PUT /api/users/:userId/custom-decks-reorder", () => {
  it("should reorder decks", async () => {
    const { agent, userId } = await registerAndLogin();
    const deck1 = await createDeck(agent, userId, { title: "First" });
    const deck2 = await createDeck(agent, userId, { title: "Second" });

    const res = await agent
      .put(`/api/users/${userId}/custom-decks-reorder`)
      .send({
        deckOrders: [
          { deckId: deck1.body.deck.id, displayOrder: 1 },
          { deckId: deck2.body.deck.id, displayOrder: 0 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject invalid deckOrders", async () => {
    const { agent, userId } = await registerAndLogin();

    const res = await agent
      .put(`/api/users/${userId}/custom-decks-reorder`)
      .send({ deckOrders: "not-an-array" });

    expect(res.status).toBe(400);
  });
});
