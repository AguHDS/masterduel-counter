import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "requser";
const TEST_EMAIL = "requser@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

const ARCH_NAME = "TestArchetypeRequests";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990401;
const card2Id = 99990402;
const NONEXISTENT_ARCH_ID = 99999;

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
    create: { id: card1Id, name: "Req Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Req Card 2", ...cardBase },
    update: {},
  });
  await prisma.$disconnect();

  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Clean FK-children first, then parents
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
  await prisma.guideRequest.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.archetype.update({
    where: { id: archetypeId },
    data: { registered: false },
  });
  await prisma.$disconnect();
});

async function registerAndLogin(user = TEST_USER, email = TEST_EMAIL) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({
      user,
      email,
      password: TEST_PASSWORD,
      turnstileToken: FAKE_TURNSTILE,
    });
  await agent.post("/api/auth/login").send({ user, password: TEST_PASSWORD });
  return agent;
}

async function createRequest(
  agentOrApp: request.Agent | request.SuperTest<request.Test>,
  overrides: Record<string, unknown> = {},
) {
  const body = {
    title: "Test Guide Request",
    archetypeId,
    guideType: "COUNTER" as const,
    ...overrides,
  };
  if (agentOrApp && "post" in agentOrApp) {
    return (agentOrApp as request.Agent).post("/api/guide-requests").send(body);
  }
  return request(app).post("/api/guide-requests").send(body);
}

async function createGuide(agent: request.Agent, title: string) {
  const res = await agent.post(`/api/archetypes/${archetypeId}/register`).send({
    guideType: "COUNTER",
    title,
    headerCardId: card1Id,
    cardPairs: [
      { topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] },
    ],
  });
  return res.body.instance;
}

// CREATE

describe("POST /api/guide-requests", () => {
  it("should create a request as anonymous", async () => {
    const res = await createRequest(request(app));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.requesterId).toBeNull();
    expect(res.body.data.requesterAlias).toMatch(/^Anonymous-/);
    expect(res.body.data.status).toBe("OPEN");
  });

  it("should create a request as authenticated user", async () => {
    const agent = await registerAndLogin();
    const res = await createRequest(agent);

    expect(res.status).toBe(201);
    expect(res.body.data.requesterId).toBeDefined();
    expect(res.body.data.requesterAlias).toBe(TEST_USER);
  });

  it("should reject empty title", async () => {
    const res = await createRequest(request(app), { title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it("should reject title over 100 characters", async () => {
    const res = await createRequest(request(app), { title: "a".repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/100/i);
  });

  it("should reject invalid guideType", async () => {
    const res = await createRequest(request(app), { guideType: "INVALID" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/COUNTER|DECK/i);
  });

  it("should reject missing archetypeId", async () => {
    const res = await request(app).post("/api/guide-requests").send({
      title: "Test",
      guideType: "COUNTER",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/archetypeId/i);
  });

  it("should return 500 for non-existent archetype", async () => {
    const res = await request(app).post("/api/guide-requests").send({
      title: "Test",
      guideType: "COUNTER",
      archetypeId: NONEXISTENT_ARCH_ID,
    });

    expect(res.status).toBe(500);
  });
});

// LISTING

describe("GET /api/guide-requests", () => {
  it("should list all requests", async () => {
    await createRequest(request(app));

    const res = await request(app).get("/api/guide-requests");

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by status", async () => {
    await createRequest(request(app));

    const res = await request(app).get("/api/guide-requests?status=OPEN");

    expect(res.status).toBe(200);
    for (const item of res.body.data.items) {
      expect(item.status).toBe("OPEN");
    }
  });

  it("should reject invalid status", async () => {
    const res = await request(app).get("/api/guide-requests?status=INVALID");

    expect(res.status).toBe(400);
  });

  it("should return counts", async () => {
    await createRequest(request(app));

    const res = await request(app).get("/api/guide-requests/counts");

    expect(res.status).toBe(200);
    expect(res.body.data.OPEN).toBeGreaterThanOrEqual(1);
    expect(res.body.data.ALL).toBeGreaterThanOrEqual(1);
  });

  it("should return recent requests", async () => {
    await createRequest(request(app));

    const res = await request(app).get("/api/guide-requests/recent");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

//GET BY ID

describe("GET /api/guide-requests/:id", () => {
  it("should return an existing request", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const res = await request(app).get(`/api/guide-requests/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("should return 404 for non-existent request", async () => {
    const res = await request(app).get("/api/guide-requests/99999");

    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid id", async () => {
    const res = await request(app).get("/api/guide-requests/abc");

    expect(res.status).toBe(400);
  });
});

// TAKE

describe("POST /api/guide-requests/:id/take", () => {
  it("should take an OPEN request", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const agent = await registerAndLogin("taker1", "taker1@ex.com");
    const res = await agent.post(`/api/guide-requests/${id}/take`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status changed
    const get = await request(app).get(`/api/guide-requests/${id}`);
    expect(get.body.data.status).toBe("TAKEN");
  });

  it("should reject taking an already TAKEN request", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const user1 = await registerAndLogin("taker2a", "taker2a@ex.com");
    await user1.post(`/api/guide-requests/${id}/take`);

    const user2 = await registerAndLogin("taker2b", "taker2b@ex.com");
    const res = await user2.post(`/api/guide-requests/${id}/take`);

    expect(res.status).toBe(409);
  });

  it("should reject without authentication", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const res = await request(app).post(`/api/guide-requests/${id}/take`);

    expect(res.status).toBe(401);
  });
});

// CANCEL TAKE

describe("POST /api/guide-requests/:id/cancel-take", () => {
  it("should cancel own take", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const agent = await registerAndLogin("canceler", "canceler@ex.com");
    await agent.post(`/api/guide-requests/${id}/take`);

    const res = await agent.post(`/api/guide-requests/${id}/cancel-take`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status reverted
    const get = await request(app).get(`/api/guide-requests/${id}`);
    expect(get.body.data.status).toBe("OPEN");
  });

  it("should reject cancel by another user", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const taker = await registerAndLogin("takerC", "takerc@ex.com");
    await taker.post(`/api/guide-requests/${id}/take`);

    const other = await registerAndLogin("otherC", "otherc@ex.com");
    const res = await other.post(`/api/guide-requests/${id}/cancel-take`);

    expect(res.status).toBe(403);
  });

  it("should reject cancel on non-TAKEN request", async () => {
    const create = await createRequest(request(app));
    const id = create.body.data.id;

    const agent = await registerAndLogin("cancelopen", "cancelopen@ex.com");
    const res = await agent.post(`/api/guide-requests/${id}/cancel-take`);

    expect(res.status).toBe(403);
  });
});

// FULFILL

describe("POST /api/guide-requests/:id/fulfill", () => {
  it("should fulfill a TAKEN request with a guide instance", async () => {
    // Create request
    const create = await createRequest(request(app));
    const reqId = create.body.data.id;

    // Take the request
    const fulfiller = await registerAndLogin("fulfiller1", "fulfiller1@ex.com");
    await fulfiller.post(`/api/guide-requests/${reqId}/take`);

    // Create a guide
    const guide = await createGuide(fulfiller, "Fulfilled Guide");

    // Fulfill
    const res = await fulfiller
      .post(`/api/guide-requests/${reqId}/fulfill`)
      .send({ instanceId: guide.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status
    const get = await request(app).get(`/api/guide-requests/${reqId}`);
    expect(get.body.data.status).toBe("COMPLETED");
    expect(get.body.data.fulfilledInstanceId).toBe(guide.id);
  });

  it("should increase fulfilled requests count for the user", async () => {
    // Create request
    const create = await createRequest(request(app));
    const reqId = create.body.data.id;

    // Take and fulfill
    const fulfiller = await registerAndLogin("fulfiller2", "fulfiller2@ex.com");
    await fulfiller.post(`/api/guide-requests/${reqId}/take`);

    const guide = await createGuide(fulfiller, "Fulfilled Guide 2");
    await fulfiller
      .post(`/api/guide-requests/${reqId}/fulfill`)
      .send({ instanceId: guide.id });

    // Check DB directly for fulfilled count
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const fulfilledCount = await prisma.guideRequest.count({
      where: { fulfilledById: { not: null } },
    });
    expect(fulfilledCount).toBeGreaterThanOrEqual(1);

    // Verify the specific request was fulfilled
    const req = await prisma.guideRequest.findUniqueOrThrow({
      where: { id: reqId },
    });
    expect(req.fulfilledById).toBeDefined();
    expect(req.fulfilledInstanceId).toBe(guide.id);
    await prisma.$disconnect();
  });

  it("should reject fulfilling already COMPLETED request", async () => {
    const create = await createRequest(request(app));
    const reqId = create.body.data.id;

    const fulfiller = await registerAndLogin("fulfiller3", "fulfiller3@ex.com");
    await fulfiller.post(`/api/guide-requests/${reqId}/take`);
    const guide = await createGuide(fulfiller, "Fulfilled Guide 3");
    await fulfiller
      .post(`/api/guide-requests/${reqId}/fulfill`)
      .send({ instanceId: guide.id });

    // Try again
    const res = await fulfiller
      .post(`/api/guide-requests/${reqId}/fulfill`)
      .send({ instanceId: guide.id });

    expect(res.status).toBe(409);
  });

  it("should reject fulfilling without instanceId", async () => {
    const create = await createRequest(request(app));
    const reqId = create.body.data.id;

    const fulfiller = await registerAndLogin("fulfiller4", "fulfiller4@ex.com");
    await fulfiller.post(`/api/guide-requests/${reqId}/take`);

    const res = await fulfiller
      .post(`/api/guide-requests/${reqId}/fulfill`)
      .send({});

    expect(res.status).toBe(400);
  });
});
