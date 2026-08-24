import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

describe("Tier List API", () => {
  let app: Express;

  beforeAll(async () => {
    // Create an archetype fixture (needed for guide count enrichment queries)
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.archetype.upsert({
      where: { name: "TestTierArchetype" },
      create: { name: "TestTierArchetype" },
      update: { registered: false },
    });
    await prisma.$disconnect();

    const { app: expressApp } = await import("@/index.js");
    app = expressApp;
  });

  beforeEach(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.tierListEntry.deleteMany();
    await prisma.tierListConfig.deleteMany();

    await prisma.$disconnect();
  });

  describe("GET /api/tier-list", () => {
    it("should return empty entries when no data exists", async () => {
      const res = await request(app).get("/api/tier-list");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toEqual([]);
    });

    it("should return empty entries for specific format", async () => {
      const res = await request(app).get("/api/tier-list?format=tcg");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toEqual([]);
    });

    it("should return saved entries with correct data", async () => {
      const saveRes = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [
            { deckName: "Deck A", tier: 1, position: 0 },
            { deckName: "Deck B", tier: 2, position: 0 },
          ],
        });
      expect(saveRes.status).toBe(200);

      const res = await request(app).get("/api/tier-list");
      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(2);
      expect(res.body.entries[0].deckName).toBe("Deck A");
      expect(res.body.entries[0].tier).toBe(1);
      expect(res.body.entries[0].source).toBe("manual");
      expect(res.body.entries[0].counterGuideCount).toBe(0);
      expect(res.body.entries[0].deckGuideCount).toBe(0);
      expect(res.body.entries[1].deckName).toBe("Deck B");
      expect(res.body.entries[1].tier).toBe(2);
    });
  });

  describe("POST /api/tier-list/save", () => {
    it("should return 400 when format is missing", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({ entries: [{ deckName: "Test", tier: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when entries is not an array", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({ format: "masterduel", entries: null });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when tier is negative", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{ deckName: "Test", tier: -1 }],
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when deckName is missing", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{ tier: 1 }],
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should save entries and default source to manual", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{ deckName: "Custom Deck", tier: 1, position: 0 }],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0].deckName).toBe("Custom Deck");
      expect(res.body.entries[0].source).toBe("manual");
    });

    it("should do full replacement on second save", async () => {
      // Save 3 entries
      await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [
            { deckName: "A", tier: 1 },
            { deckName: "B", tier: 2 },
            { deckName: "C", tier: 3 },
          ],
        });

      // Save 2 different entries (full replacement)
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [
            { deckName: "X", tier: 1 },
            { deckName: "Y", tier: 2 },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(2);
      const names = res.body.entries.map((e: { deckName: string }) => e.deckName);
      expect(names).toContain("X");
      expect(names).toContain("Y");
      expect(names).not.toContain("A");
      expect(names).not.toContain("B");
      expect(names).not.toContain("C");
    });

    it("should accept optional linkedArchetype fields", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{
            deckName: "HEROs",
            tier: 1,
            linkedArchetypeId: 999,
            linkedArchetypeName: "HERO",
          }],
        });
      expect(res.status).toBe(200);
      expect(res.body.entries[0].linkedArchetypeId).toBe(999);
      expect(res.body.entries[0].linkedArchetypeName).toBe("HERO");
    });

    it("should accept tier 4 entries", async () => {
      const res = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{ deckName: "Trending Deck", tier: 4, position: 0 }],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0].tier).toBe(4);
    });
  });

  describe("Cross-format sync", () => {
    it("should propagate image and linked archetype changes to the same deck in other formats", async () => {
      const mdSave = await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{
            deckName: "Deck X",
            tier: 1,
            position: 0,
            imageUrl: "img1",
            linkedArchetypeId: 1,
            linkedArchetypeName: "A",
            source: "scraped",
          }],
        });
      expect(mdSave.status).toBe(200);
      const mdId = mdSave.body.entries[0].id;

      await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "tcg",
          entries: [{ deckName: "Deck X", tier: 1, position: 0, source: "scraped" }],
        });

      await request(app)
        .post("/api/tier-list/save")
        .send({
          format: "masterduel",
          entries: [{
            id: mdId,
            deckName: "Deck X",
            tier: 1,
            position: 0,
            imageUrl: "img2",
            linkedArchetypeId: 2,
            linkedArchetypeName: "B",
            source: "scraped",
          }],
        });

      const tcgRes = await request(app).get("/api/tier-list?format=tcg");
      expect(tcgRes.status).toBe(200);
      const tcgEntry = tcgRes.body.entries.find((e: { deckName: string }) => e.deckName === "Deck X");
      expect(tcgEntry).toBeDefined();
      expect(tcgEntry.imageUrl).toBe("img2");
      expect(tcgEntry.linkedArchetypeId).toBe(2);
      expect(tcgEntry.linkedArchetypeName).toBe("B");
    });
  });

  describe("Tier List Config", () => {
    it("should return null config when none exists", async () => {
      const res = await request(app).get("/api/tier-list/config");
      expect(res.status).toBe(200);
      expect(res.body.config).toBeNull();
    });

    it("should create config on PUT and enable scraping", async () => {
      const putRes = await request(app)
        .put("/api/tier-list/config")
        .send({ format: "masterduel", scrapingEnabled: true });
      expect(putRes.status).toBe(200);
      expect(putRes.body.config.scrapingEnabled).toBe(true);
      expect(putRes.body.config.format).toBe("masterduel");

      const getRes = await request(app).get("/api/tier-list/config");
      expect(getRes.status).toBe(200);
      expect(getRes.body.config.scrapingEnabled).toBe(true);
    });

    it("should disable scraping when scrapingEnabled is false", async () => {
      await request(app)
        .put("/api/tier-list/config")
        .send({ format: "masterduel", scrapingEnabled: true });

      const res = await request(app)
        .put("/api/tier-list/config")
        .send({ format: "masterduel", scrapingEnabled: false });
      expect(res.status).toBe(200);
      expect(res.body.config.scrapingEnabled).toBe(false);
    });
  });

  describe("PUT /api/tier-list/entries/reorder", () => {
    it("should return 400 when positions array is missing", async () => {
      const res = await request(app)
        .put("/api/tier-list/entries/reorder")
        .send({ format: "masterduel" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
