import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const ARCH_NAME = "TestArchetypeNotifs";
const TEST_USER_A = "notifuserA";
const TEST_USER_B = "notifuserB";
const TEST_EMAIL_A = "notifa@example.com";
const TEST_EMAIL_B = "notifb@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990901;
const card2Id = 99990902;

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
    frameType: "spell",
  };
  await prisma.card.upsert({
    where: { id: card1Id },
    create: { id: card1Id, name: "Notif Card 1", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Notif Card 2", type: "Spell Card", desc: "Test", race: "Normal", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  await prisma.notification.deleteMany();
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

// LIST

describe("GET /api/notifications", () => {
  it("should reject unauthenticated request", async () => {
    const res = await request(app).get("/api/notifications");

    expect(res.status).toBe(401);
  });

  it("should return empty list for user with no notifications", async () => {
    const agent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);

    const res = await agent.get("/api/notifications");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notifications).toBeDefined();
  });

  it("should return notifications when user has likes", async () => {
    // User A creates a guide, User B likes it → notification for User A
    const authorAgent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const guide = await createGuide(authorAgent, "Notif Test Guide");

    const likerAgent = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    await likeGuide(likerAgent, guide.id);

    // User A checks notifications
    const res = await authorAgent.get("/api/notifications");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.notifications[0].type).toBe("like");
  });
});

// COUNT

describe("GET /api/notifications/unread-count", () => {
  it("should reject unauthenticated request", async () => {
    const res = await request(app).get("/api/notifications/unread-count");

    expect(res.status).toBe(401);
  });

  it("should return count for authenticated user", async () => {
    const authorAgent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const guide = await createGuide(authorAgent, "Count Test Guide");

    const likerAgent = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    await likeGuide(likerAgent, guide.id);

    const res = await authorAgent.get("/api/notifications/unread-count");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.count).toBe("number");
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });
});

// MARK AS READ

describe("PATCH /api/notifications/:id/read", () => {
  it("should mark own notification as read", async () => {
    const authorAgent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const guide = await createGuide(authorAgent, "Mark Read Guide");

    const likerAgent = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    await likeGuide(likerAgent, guide.id);

    // Get the notification ID
    const list = await authorAgent.get("/api/notifications");
    const notifId = list.body.notifications[0].id;

    const res = await authorAgent.patch(`/api/notifications/${notifId}/read`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.read).toBe(true);
  });

  it("should return 404 for non-existent notification", async () => {
    const agent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);

    const res = await agent.patch("/api/notifications/99999/read");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("should return 403 for another user's notification", async () => {
    // User A gets a notification from User B liking their guide
    const authorAgent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const guide = await createGuide(authorAgent, "Owned Notif Guide");

    const likerAgent = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    await likeGuide(likerAgent, guide.id);

    // Get the notification ID (belongs to user A)
    const list = await authorAgent.get("/api/notifications");
    const notifId = list.body.notifications[0].id;

    // User B tries to mark user A's notification as read
    const res = await likerAgent.patch(`/api/notifications/${notifId}/read`);

    expect(res.status).toBe(403);
  });
});

// MARK ALL AS READ

describe("PATCH /api/notifications/read-all", () => {
  it("should reject unauthenticated request", async () => {
    const res = await request(app).patch("/api/notifications/read-all");

    expect(res.status).toBe(401);
  });

  it("should mark all notifications as read", async () => {
    const authorAgent = await registerAndLogin(TEST_USER_A, TEST_EMAIL_A);
    const guide = await createGuide(authorAgent, "Mark All Guide");

    const likerAgent = await registerAndLogin(TEST_USER_B, TEST_EMAIL_B);
    await likeGuide(likerAgent, guide.id);

    const res = await authorAgent.patch("/api/notifications/read-all");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify unread count is now 0
    const count = await authorAgent.get("/api/notifications/unread-count");
    expect(count.body.count).toBe(0);
  });
});
