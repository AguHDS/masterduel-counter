import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "profileuser";
const TEST_USER2 = "profileuser2";
const TEST_EMAIL = "profile@example.com";
const TEST_EMAIL2 = "profile2@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990801;
const card2Id = 99990802;

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const archetype = await prisma.archetype.upsert({
    where: { name: "TestArchetypeProfile" },
    create: { name: "TestArchetypeProfile" },
    update: { registered: false },
  });
  archetypeId = archetype.id;

  const cardBase = {
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
    frameType: "spell",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "Profile Card 1", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Profile Card 2", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
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
  await prisma.instanceFavorite.deleteMany();
  await prisma.instanceLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.guideViewTracking.deleteMany();
  await prisma.guideRequest.deleteMany();
  await prisma.customDeck.deleteMany();
  await prisma.initialHand.deleteMany();
  await prisma.archetypeInstance.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.archetype.update({ where: { id: archetypeId }, data: { registered: false } });
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

async function createGuide(agent: request.Agent, title: string) {
  const res = await agent.post(`/api/archetypes/${archetypeId}/register`).send({
    guideType: "COUNTER",
    title,
    headerCardId: card1Id,
    cardPairs: [{ topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] }],
  });
  return res.body.instance;
}

// SEARCH USERS

describe("GET /api/profile/search", () => {
  it("should find users by name", async () => {
    await registerAndLogin(TEST_USER, TEST_EMAIL);
    await registerAndLogin(TEST_USER2, TEST_EMAIL2);

    const res = await request(app).get(`/api/profile/search?q=${TEST_USER}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body.users[0].username).toBe(TEST_USER);
  });

  it("should reject empty search query", async () => {
    const res = await request(app).get("/api/profile/search?q=");

    expect(res.status).toBe(400);
  });
});

// GET PROFILE

describe("GET /api/profile/:userId", () => {
  it("should return profile for existing user", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app).get(`/api/profile/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.userName).toBe(TEST_USER);
  });

  it("should return null profile for non-existent userId", async () => {
    const res = await request(app).get("/api/profile/nonexistent-user-id-123456");

    expect(res.status).toBe(200);
    expect(res.body.profile).toBeNull();
  });
});

// UPDATE BIO

describe("PUT /api/profile/:userId/bio", () => {
  it("should update bio", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/bio`)
      .send({ bio: "Hello, this is my bio" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.bio).toBe("Hello, this is my bio");
  });

  it("should reject bio over 1000 characters", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/bio`)
      .send({ bio: "a".repeat(1001) });

    expect(res.status).toBe(400);
  });

  it("should reject non-string bio", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/bio`)
      .send({ bio: 123 });

    expect(res.status).toBe(400);
  });
});

// UPDATE FAVORITES

describe("PUT /api/profile/:userId/favorites", () => {
  it("should update favorite card and decks", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/favorites`)
      .send({
        favoriteCardId: card1Id,
        favoriteDecks: JSON.stringify([{ deckId: 1 }, { deckId: 2 }, null, null, null, null]),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.favoriteCardId).toBe(card1Id);

    const savedDecks = JSON.parse(res.body.profile.favoriteDecks);
    expect(savedDecks[0].deckId).toBe(1);
    expect(savedDecks[1].deckId).toBe(2);
  });

  it("should reject invalid favoriteDecks JSON", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/favorites`)
      .send({
        favoriteCardId: card1Id,
        favoriteDecks: "not valid json {{{",
      });

    expect(res.status).toBe(400);
  });

  it("should reject invalid favoriteCardId", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .put(`/api/profile/${userId}/favorites`)
      .send({
        favoriteCardId: -5,
        favoriteDecks: JSON.stringify([{ deckId: 1 }]),
      });

    expect(res.status).toBe(400);
  });
});

// FAVORITED GUIDES

describe("GET /api/profile/:userId/favoritedGuides", () => {
  it("should return empty array for user with no favorites", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app).get(`/api/profile/${userId}/favoritedGuides`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.guides)).toBe(true);
    expect(res.body.guides.length).toBe(0);
  });

  it("should return favorited guides", async () => {
    const { agent: authorAgent } = await registerAndLogin("authorprof", "authorprof@ex.com");
    const guide = await createGuide(authorAgent, "Favorited Profile Guide");

    const { agent: likerAgent, userId } = await registerAndLogin("likerprof", "likerprof@ex.com");

    // Favorite the guide
    await likerAgent.post(`/api/archetypes/${archetypeId}/instances/${guide.id}/favorite`);

    const res = await request(app).get(`/api/profile/${userId}/favoritedGuides`);

    expect(res.status).toBe(200);
    expect(res.body.guides.length).toBeGreaterThanOrEqual(1);
    expect(res.body.guides[0].title).toBe("Favorited Profile Guide");
  });
});

// SEARCH USER GUIDES

describe("GET /api/users/:userId/instances/search", () => {
  it("should search user guides by title", async () => {
    const { agent, userId } = await registerAndLogin();
    await createGuide(agent, "My Unique Search Title");

    const res = await request(app)
      .get(`/api/users/${userId}/instances/search`)
      .query({ title: "Unique" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBe("My Unique Search Title");
  });

  it("should reject missing title", async () => {
    const { userId } = await registerAndLogin();

    const res = await request(app)
      .get(`/api/users/${userId}/instances/search`);

    expect(res.status).toBe(400);
  });

  it("should return 404 for empty userId path", async () => {
    const res = await request(app)
      .get("/api/users//instances/search")
      .query({ title: "test" });

    // Express handles double-slash differently; this matches no route
    expect(res.status).toBe(404);
  });
});
