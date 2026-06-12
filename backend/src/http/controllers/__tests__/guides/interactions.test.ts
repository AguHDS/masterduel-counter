import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "itestuser";
const TEST_EMAIL = "itest@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990101;
const card2Id = 99990102;

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const archetype = await prisma.archetype.upsert({
    where: { name: "TestArchetypeInteractions" },
    create: { name: "TestArchetypeInteractions" },
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
    create: { id: card1Id, name: "Interaction Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Interaction Card 2", ...cardBase },
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
  await prisma.$disconnect();
});

async function registerAndLogin(user = TEST_USER, email = TEST_EMAIL) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({ user, email, password: TEST_PASSWORD, turnstileToken: FAKE_TURNSTILE });
  await agent.post("/api/auth/login").send({ user, password: TEST_PASSWORD });
  return agent;
}

async function createGuide(agent: request.Agent) {
  const res = await agent
    .post(`/api/archetypes/${archetypeId}/register`)
    .send({
      guideType: "COUNTER",
      title: "Interaction Test Guide",
      headerCardId: card1Id,
      cardPairs: [
        { topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] },
      ],
    });
  return res.body.instance;
}

const LIKE_URL = (instId: number) =>
  `/api/archetypes/${archetypeId}/instances/${instId}/like`;
const FAV_URL = (instId: number) =>
  `/api/archetypes/${archetypeId}/instances/${instId}/favorite`;

// Likes

describe("Likes", () => {
  it("should like another user's guide", async () => {
    const author = await registerAndLogin("author1", "author1@ex.com");
    const guide = await createGuide(author);

    const liker = await registerAndLogin();
    const res = await liker.post(LIKE_URL(guide.id));

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.likes).toBeGreaterThan(0);
  });

  it("should unlike (toggle off)", async () => {
    const author = await registerAndLogin("author3", "author3@ex.com");
    const guide = await createGuide(author);

    const liker = await registerAndLogin();
    await liker.post(LIKE_URL(guide.id));
    const res = await liker.post(LIKE_URL(guide.id));

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it("should reject liking own guide", async () => {
    const agent = await registerAndLogin();
    const guide = await createGuide(agent);

    const res = await agent.post(LIKE_URL(guide.id));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/cannot like your own/i);
  });

  it("should return like status", async () => {
    const author = await registerAndLogin("author4", "author4@ex.com");
    const guide = await createGuide(author);

    const liker = await registerAndLogin();
    await liker.post(LIKE_URL(guide.id));

    const res = await liker.get(`${LIKE_URL(guide.id)}/status`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
  });
});

// FAVORITES

describe("Favorites", () => {
  it("should favorite a guide", async () => {
    const author = await registerAndLogin("favauthor", "favauthor@ex.com");
    const guide = await createGuide(author);

    const user = await registerAndLogin();
    const res = await user.post(FAV_URL(guide.id));

    expect(res.status).toBe(200);
    expect(res.body.favorited).toBe(true);
    expect(res.body.favorites).toBeGreaterThan(0);
  });

  it("should unfavorite (toggle off)", async () => {
    const author = await registerAndLogin("favauthor2", "favauthor2@ex.com");
    const guide = await createGuide(author);

    const user = await registerAndLogin();
    await user.post(FAV_URL(guide.id));
    const res = await user.post(FAV_URL(guide.id));

    expect(res.status).toBe(200);
    expect(res.body.favorited).toBe(false);
  });

  it("should reject exceeding 20 favorites for regular user", async () => {
    const user = await registerAndLogin("favlimit", "favlimit@ex.com");

    // Create 21 guides and try to favorite them all
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Get user ID from DB
    const dbUser = await prisma.user.findFirstOrThrow({
      where: { name: "favlimit" },
      select: { id: true, role: true }
    });

    // Create 21 archetype instances directly in DB
    const instances = [];
    for (let i = 0; i < 21; i++) {
      const inst = await prisma.archetypeInstance.create({
        data: {
          archetypeId,
          userId: dbUser.id,
          title: `Fav Test Guide ${i}`,
          guideType: "COUNTER",
          headerCardId: card1Id,
        },
      });
      instances.push(inst);
    }

    // Favorite first 20
    for (let i = 0; i < 20; i++) {
      await user.post(FAV_URL(instances[i].id));
    }

    // 21st should fail
    const res = await user.post(FAV_URL(instances[20].id));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Maximum favorite limit|20/);

    await prisma.$disconnect();
  });

  it("should allow admin to exceed 20 favorites", async () => {
    // Create user then promote to admin
    await registerAndLogin("favadmin", "favadmin@ex.com");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const favAdminUser = await prisma.user.findFirstOrThrow({
      where: { name: "favadmin" },
    });
    await prisma.user.update({
      where: { id: favAdminUser.id },
      data: { role: "admin" },
    });

    // Login as admin
    const admin = await registerAndLogin("favadmin", "favadmin@ex.com");

    // Create 25 guides and favorite them all
    for (let i = 0; i < 25; i++) {
      await prisma.archetypeInstance.create({
        data: {
          archetypeId,
          userId: favAdminUser.id,
          title: `Admin Fav ${i}`,
          guideType: "COUNTER",
          headerCardId: card1Id,
        },
      });
    }
    const allInstances = await prisma.archetypeInstance.findMany({
      where: { title: { startsWith: "Admin Fav" } },
    });

    let lastStatus = 200;
    for (const inst of allInstances) {
      const r = await admin.post(FAV_URL(inst.id));
      lastStatus = r.status;
    }

    expect(lastStatus).toBe(200);
    await prisma.$disconnect();
  });

  it("should return favorite status", async () => {
    const author = await registerAndLogin("favstatus", "favstatus@ex.com");
    const guide = await createGuide(author);

    const user = await registerAndLogin();
    await user.post(FAV_URL(guide.id));

    const res = await user.get(`${FAV_URL(guide.id)}/status`);

    expect(res.status).toBe(200);
    expect(res.body.favorited).toBe(true);
  });
});

// VIEWS

describe("Views", () => {
  it("should register a view", async () => {
    const author = await registerAndLogin("viewauth", "viewauth@ex.com");
    const guide = await createGuide(author);

    const res = await request(app).post(`/api/instances/${guide.id}/view`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.counted).toBe(true);
  });

  it("should return counted:false on second view from same agent", async () => {
    const author = await registerAndLogin("viewauth2", "viewauth2@ex.com");
    const guide = await createGuide(author);

    const viewer = request.agent(app);
    await viewer.post(`/api/instances/${guide.id}/view`);
    const res = await viewer.post(`/api/instances/${guide.id}/view`);

    expect(res.status).toBe(200);
    expect(res.body.counted).toBe(false);
  });
});
