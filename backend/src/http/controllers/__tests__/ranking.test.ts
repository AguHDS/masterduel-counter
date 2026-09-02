import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER_A = "rankuserA";
const TEST_USER_B = "rankuserB";
const TEST_EMAIL_A = "ranka@example.com";
const TEST_EMAIL_B = "rankb@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

const ARCH_NAME = "TestArchetypeRanking";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990501;
const card2Id = 99990502;

function prevMonthString(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toISOString().slice(0, 7);
}

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const archetype = await prisma.archetype.upsert({
    where: { name: ARCH_NAME },
    create: { name: ARCH_NAME },
    update: { registered: false },
  });
  archetypeId = archetype.id;

  const cardBase = {
    imageUrl: "http://loc/c.jpg",
    imageUrlSmall: "http://loc/cs.jpg",
    imageUrlCropped: "http://loc/cc.jpg",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "Rank Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Rank Card 2", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  await prisma.monthlyGuideRanking.deleteMany();
  await prisma.monthlyUserRanking.deleteMany();
  await prisma.guideMonthlyViews.deleteMany();
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
  await prisma.guideRequest.deleteMany();
  await prisma.initialHand.deleteMany();
  await prisma.archetypeInstance.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.archetype.update({ where: { id: archetypeId }, data: { registered: false } });
  await prisma.$disconnect();
});

async function registerAndLogin(user: string, email: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({ user, email, password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
  await agent.post("/api/auth/login").send({ user, password: TEST_PASSWORD });
  return agent;
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

async function likeGuide(liker: request.Agent, instanceId: number) {
  return liker.post(`/api/archetypes/${archetypeId}/instances/${instanceId}/like`);
}

async function setupRankingData() {
  const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
  const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);

  const guideA = await createGuide(userA, "Rank Guide A");
  const guideB = await createGuide(userB, "Rank Guide B");

  await likeGuide(userA, guideB.id);
  await likeGuide(userB, guideA.id);

  return { userA, userB, guideA, guideB };
}

// ALL-TIME RANKING

describe("All-time Ranking", () => {
  it("should return user ranking", async () => {
    await setupRankingData();

    const res = await request(app).get("/api/ranking");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.ranking)).toBe(true);
    expect(res.body.ranking.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it("should return guide ranking", async () => {
    await setupRankingData();

    const res = await request(app).get("/api/ranking/guides");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.ranking)).toBe(true);
    expect(res.body.ranking.length).toBeGreaterThanOrEqual(1);
  });

  it("should paginate results", async () => {
    await setupRankingData();

    const page1 = await request(app).get("/api/ranking/guides?page=1&limit=1");
    const page2 = await request(app).get("/api/ranking/guides?page=2&limit=1");

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
  });

  it("should return empty ranking when no data exists", async () => {
    const res = await request(app).get("/api/ranking");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.ranking)).toBe(true);
    expect(res.body.ranking.length).toBe(0);
  });
});

// TRENDING RANKING

describe("Trending Ranking", () => {
  it("should return trending guides for current month", async () => {
    const { guideA, guideB } = await setupRankingData();

    const res = await request(app).get("/api/ranking/trending/guides");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.ranking)).toBe(true);

    const ids = res.body.ranking.map((g: { id: number }) => g.id);
    expect(ids.includes(guideA.id) || ids.includes(guideB.id)).toBe(true);
  });

  it("should return trending users for current month", async () => {
    await setupRankingData();

    const res = await request(app).get("/api/ranking/trending/users");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.ranking)).toBe(true);
  });

  it("should filter out guides without minimum requirements", async () => {
    const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);

    const guideA = await createGuide(userA, "Qualified Guide");
    await likeGuide(userB, guideA.id);

    await createGuide(userB, "Unqualified Guide");

    const res = await request(app).get("/api/ranking/trending/guides");

    expect(res.status).toBe(200);
    const titles = res.body.ranking.map((g: { guideTitle: string }) => g.guideTitle);
    expect(titles).not.toContain("Unqualified Guide");
  });

  it("should filter out users without minimum requirements", async () => {
    // User with a guide but 0 likes → should NOT appear in trending users
    const agent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    await createGuide(agent, "Zero Like Guide");

    const res = await request(app).get("/api/ranking/trending/users");

    expect(res.status).toBe(200);
    const names = res.body.ranking.map(
      (u: { authorName: string }) => u.authorName,
    );
    expect(names).not.toContain(TEST_USER_A);
  });

  it("should reject invalid month format", async () => {
    const res = await request(app).get("/api/ranking/trending/guides?month=invalid");

    expect(res.status).toBe(400);
  });

  it("should return empty ranking for past month with no data", async () => {
    const res = await request(app).get("/api/ranking/trending/guides?month=2020-01");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.ranking)).toBe(true);
  });

  it("should not leak historical views for old guides without a baseline", async () => {
    const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    const guide = await createGuide(userA, "Old Guide No Baseline");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    // Backdate guide to 2 months ago and give it 110 accumulated views
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    await prisma.archetypeInstance.update({
      where: { id: guide.id },
      data: { createdAt: twoMonthsAgo, views: 110 },
    });
    // One like so it qualifies for trending
    await likeGuide(userB, guide.id);
    await prisma.$disconnect();

    const res = await request(app).get("/api/ranking/trending/guides");
    const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
    expect(entry).toBeDefined();
    expect(entry.monthlyViews).toBe(0); // no baseline -> no leak
  });

  it("should compute accurate monthly views using the baseline", async () => {
    const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    const guide = await createGuide(userA, "Baseline Guide");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    await prisma.archetypeInstance.update({
      where: { id: guide.id },
      data: { createdAt: twoMonthsAgo, views: 110 },
    });
    // Baseline from previous month: guide had 100 views at start of this month
    await prisma.guideMonthlyViews.create({
      data: { guideId: guide.id, month: prevMonthString(), totalViews: 100 },
    });
    await likeGuide(userB, guide.id);
    await prisma.$disconnect();

    const res = await request(app).get("/api/ranking/trending/guides");
    const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
    expect(entry).toBeDefined();
    expect(entry.monthlyViews).toBe(10); // 110 - 100
  });

  it("should count all views for guides created this month", async () => {
    const userA = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const userB = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    const guide = await createGuide(userA, "New Guide This Month");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.archetypeInstance.update({
      where: { id: guide.id },
      data: { views: 5 },
    });
    await likeGuide(userB, guide.id);
    await prisma.$disconnect();

    const res = await request(app).get("/api/ranking/trending/guides");
    const entry = res.body.ranking.find((g: { id: number }) => g.id === guide.id);
    expect(entry).toBeDefined();
    expect(entry.monthlyViews).toBe(5);
  });
});

// ACHIEVEMENTS & HISTORY

describe("Trending Achievements & History", () => {
  it("should return trending history for a user", async () => {
    await setupRankingData();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirstOrThrow({ where: { name: TEST_USER_A } });

    const res = await request(app).get(`/api/ranking/user/${user.id}/trending-history`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    await prisma.$disconnect();
  });

  it("should return trending achievements for a user", async () => {
    await setupRankingData();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirstOrThrow({ where: { name: TEST_USER_A } });

    const res = await request(app).get(`/api/ranking/user/${user.id}/trending-achievements`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    await prisma.$disconnect();
  });

  it("should return best trending for a guide", async () => {
    const { guideA } = await setupRankingData();

    const res = await request(app).get(`/api/ranking/guide/${guideA.id}/best-trending`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
