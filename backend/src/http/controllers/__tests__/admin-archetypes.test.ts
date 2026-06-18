import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "archetypesadmin";
const TEST_EMAIL = "archadmin@ex.com";
const TEST_PASSWORD = "TestPass123!";
const FAKE_TURNSTILE = "test-turnstile-token";

async function registerAndLogin(app: Express, user: string, email: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send({
    user,
    email,
    password: TEST_PASSWORD,
    turnstileToken: FAKE_TURNSTILE,
  });
  await agent.post("/api/auth/login").send({ user, password: TEST_PASSWORD });
  return agent;
}

describe("Admin Archetypes API", () => {
  let app: Express;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminAgent: any;
  let fixtureArchetypeId: number;

  beforeAll(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Create a fixture archetype
    const archetype = await prisma.archetype.upsert({
      where: { name: "TestArchetypeAdmin" },
      create: { name: "TestArchetypeAdmin" },
      update: { registered: false },
    });
    fixtureArchetypeId = archetype.id;

    await prisma.$disconnect();

    // Import app
    const { app: expressApp } = await import("@/index.js");
    app = expressApp;

    // Create admin user
    await registerAndLogin(app, TEST_USER, TEST_EMAIL);
    const prisma2 = new PrismaClient();
    const adminUser = await prisma2.user.findFirstOrThrow({ where: { name: TEST_USER } });
    await prisma2.user.update({ where: { id: adminUser.id }, data: { role: "admin" } });
    await prisma2.$disconnect();

    adminAgent = await registerAndLogin(app, TEST_USER, TEST_EMAIL);
  });

  beforeEach(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Clean up archetypes created by tests (except fixture)
    await prisma.archetype.deleteMany({
      where: {
        id: { not: fixtureArchetypeId },
        name: { not: "TestArchetypeAdmin" },
      },
    });

    // Clean up tier list entries
    await prisma.tierListEntry.deleteMany();

    await prisma.$disconnect();
  });

  describe("GET /api/admin/archetypes", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/admin/archetypes");
      expect(res.status).toBe(401);
    });

    it("should find fixture archetype by search", async () => {
      const res = await adminAgent.get("/api/admin/archetypes?search=TestArchetypeAdmin");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.archetypes.length).toBeGreaterThanOrEqual(1);
      expect(res.body.archetypes.some((a: { name: string }) => a.name === "TestArchetypeAdmin")).toBe(true);
    });
  });

  describe("POST /api/admin/archetypes", () => {
    it("should create an archetype", async () => {
      const res = await adminAgent.post("/api/admin/archetypes").send({ name: "NewArchetype" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.archetype.name).toBe("NewArchetype");
    });

    it("should return 400 when name is missing", async () => {
      const res = await adminAgent.post("/api/admin/archetypes").send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 409 when archetype already exists", async () => {
      await adminAgent.post("/api/admin/archetypes").send({ name: "DuplicateArchetype" });
      const res = await adminAgent.post("/api/admin/archetypes").send({ name: "DuplicateArchetype" });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/admin/archetypes/:id", () => {
    it("should rename an archetype", async () => {
      const createRes = await adminAgent.post("/api/admin/archetypes").send({ name: "ToRename" });
      const id = createRes.body.archetype.id;

      const res = await adminAgent.put(`/api/admin/archetypes/${id}`).send({ name: "Renamed" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.archetype.name).toBe("Renamed");
    });

    it("should return 409 when renaming to an existing name", async () => {
      const { body: a } = await adminAgent.post("/api/admin/archetypes").send({ name: "UniqueA" });
      await adminAgent.post("/api/admin/archetypes").send({ name: "UniqueB" });

      const res = await adminAgent.put(`/api/admin/archetypes/${a.archetype.id}`).send({ name: "UniqueB" });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should cascade rename to tier list entries", async () => {
      const createRes = await adminAgent.post("/api/admin/archetypes").send({ name: "CascadeTest" });
      const archetypeId = createRes.body.archetype.id;

      // Create a tier list entry linked to this archetype
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.tierListEntry.create({
        data: {
          deckName: "TestDeck",
          tier: 1,
          format: "masterduel",
          position: 0,
          source: "manual",
          linkedArchetypeId: archetypeId,
          linkedArchetypeName: "CascadeTest",
        },
      });
      await prisma.$disconnect();

      // Rename
      await adminAgent.put(`/api/admin/archetypes/${archetypeId}`).send({ name: "CascadeRenamed" });

      // Verify cascade
      const res = await request(app).get("/api/tier-list");
      const linked = res.body.entries.find((e: { deckName: string }) => e.deckName === "TestDeck");
      expect(linked).toBeDefined();
      expect(linked.linkedArchetypeName).toBe("CascadeRenamed");
    });

    it("should return 400 when name is empty", async () => {
      const res = await adminAgent.put(`/api/admin/archetypes/${fixtureArchetypeId}`).send({ name: "" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/admin/archetypes/:id", () => {
    it("should delete an archetype with no guides", async () => {
      const createRes = await adminAgent.post("/api/admin/archetypes").send({ name: "Deletable" });
      const id = createRes.body.archetype.id;

      const res = await adminAgent.delete(`/api/admin/archetypes/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for non-existent archetype", async () => {
      const res = await adminAgent.delete("/api/admin/archetypes/999999");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
