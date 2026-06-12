import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "draftuser";
const TEST_EMAIL = "draftuser@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;
let archetypeId: number = 0;
const card1Id = 99990301;
const card2Id = 99990302;

// SETUP

beforeAll(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const archetype = await prisma.archetype.upsert({
    where: { name: "TestArchetypeDrafts" },
    create: { name: "TestArchetypeDrafts" },
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
    create: { id: card1Id, name: "Draft Card 1", ...cardBase },
    update: {},
  });
  await prisma.card.upsert({
    where: { id: card2Id },
    create: { id: card2Id, name: "Draft Card 2", ...cardBase },
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

async function saveDraft(
  agent: request.Agent,
  overrides: Record<string, unknown> = {},
) {
  return agent.post(`/api/archetypes/${archetypeId}/draft`).send({
    guideType: "COUNTER",
    title: "Draft Guide",
    headerCardId: card1Id,
    cardPairs: [{ topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] }],
    ...overrides,
  });
}

async function publishDraft(agent: request.Agent, draftInstanceId: number, title: string) {
  return agent.post(`/api/archetypes/${archetypeId}/register`).send({
    guideType: "COUNTER",
    title,
    headerCardId: card1Id,
    cardPairs: [{ topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] }],
    draftInstanceId,
  });
}

// DRAFT TESTS

describe("Drafts", () => {
  // SAVE

  describe("POST /api/archetypes/:id/draft", () => {
    it("should save a new draft", async () => {
      const agent = await registerAndLogin();
      const res = await saveDraft(agent);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.draft).toBeDefined();
      expect(res.body.draft.isDraft).toBe(true);
    });

    it("should allow up to 3 drafts", async () => {
      const agent = await registerAndLogin();
      await saveDraft(agent, { title: "Draft 1" });
      await saveDraft(agent, { title: "Draft 2" });
      const res = await saveDraft(agent, { title: "Draft 3" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject 4th draft", async () => {
      const agent = await registerAndLogin();
      await saveDraft(agent, { title: "Draft 1" });
      await saveDraft(agent, { title: "Draft 2" });
      await saveDraft(agent, { title: "Draft 3" });

      const res = await saveDraft(agent, { title: "Draft 4" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/more than three|draft/i);
    });

    it("should update an existing draft via draftInstanceId", async () => {
      const agent = await registerAndLogin();
      const draft = await saveDraft(agent, { title: "Original Title" });
      const draftId = draft.body.draft.id;

      const res = await saveDraft(agent, {
        title: "Updated Draft Title",
        draftInstanceId: draftId,
      });

      expect(res.status).toBe(200);
      expect(res.body.draft.title).toBe("Updated Draft Title");
    });

    it("should reject updating another user's draft", async () => {
      const user1 = await registerAndLogin("userdraft1", "userdraft1@ex.com");
      const draft = await saveDraft(user1, { title: "User1 Draft" });
      const draftId = draft.body.draft.id;

      const user2 = await registerAndLogin("userdraft2", "userdraft2@ex.com");
      const res = await saveDraft(user2, {
        title: "Hijacked",
        draftInstanceId: draftId,
      });

      expect(res.status).toBe(403);
    });

    it("should reject saving draft without auth", async () => {
      const res = await request(app)
        .post(`/api/archetypes/${archetypeId}/draft`)
        .send({ guideType: "COUNTER" });

      expect(res.status).toBe(401);
    });
  });

  // DELETE

  describe("DELETE /api/archetypes/draft/:draftId", () => {
    it("should delete own draft", async () => {
      const agent = await registerAndLogin();
      const draft = await saveDraft(agent);
      const draftId = draft.body.draft.id;

      const res = await agent.delete(`/api/archetypes/draft/${draftId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const get = await request(app).get(`/api/instances/${draftId}`);
      expect(get.status).toBe(404);
    });

    it("should reject deleting another user's draft", async () => {
      const user1 = await registerAndLogin("deldraft1", "deldraft1@ex.com");
      const draft = await saveDraft(user1);
      const draftId = draft.body.draft.id;

      const user2 = await registerAndLogin("deldraft2", "deldraft2@ex.com");
      const res = await user2.delete(`/api/archetypes/draft/${draftId}`);

      expect(res.status).toBe(403);
    });

    it("should reject deleting a published guide (not a draft)", async () => {
      const agent = await registerAndLogin();
      // Create a published guide (not a draft)
      const create = await agent
        .post(`/api/archetypes/${archetypeId}/register`)
        .send({
          guideType: "COUNTER",
          title: "Published Not Draft",
          headerCardId: card1Id,
          cardPairs: [{ topCardIds: [card1Id], bottomCardIds: [{ cardId: card2Id }] }],
        });
      const publishedId = create.body.instance.id;

      // Try to delete the published guide via draft endpoint
      const res = await agent.delete(`/api/archetypes/draft/${publishedId}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not a draft/i);
    });

    it("should return 404 for nonexistent draft", async () => {
      const agent = await registerAndLogin();
      const res = await agent.delete("/api/archetypes/draft/99999");

      expect(res.status).toBe(404);
    });
  });

  // PUBLISH

  describe("Publish draft via POST /api/archetypes/:id/register", () => {
    it("should publish a draft and delete the draft record", async () => {
      const agent = await registerAndLogin();
      const draft = await saveDraft(agent, { title: "To Publish" });
      const draftId = draft.body.draft.id;

      const res = await publishDraft(agent, draftId, "Now Published");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.instance.isDraft).toBe(false);

      // Draft record should be deleted (publishing removes the draft)
      const get = await request(app).get(`/api/instances/${draftId}`);
      expect(get.status).toBe(404);
    });
  });
});
