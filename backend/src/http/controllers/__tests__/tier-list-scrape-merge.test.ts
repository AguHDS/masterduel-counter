import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";

// Mock the external scrapers so the scrape flow never hits the network
// Decks returned by the mocks include an imageUrl, so resolveImageForDeck is skipped
const scraperMocks = vi.hoisted(() => ({
  masterduel: vi.fn(),
  tcg: vi.fn(),
  ocg: vi.fn(),
}));

vi.mock("@/infrastructure/adapters/externalServices/MasterDuelMetaScraper.js", () => ({
  MasterDuelMetaScraper: class {
    scrapeTierList = scraperMocks.masterduel;
  },
}));
vi.mock("@/infrastructure/adapters/externalServices/YgoMetaTcgScraper.js", () => ({
  YgoMetaTcgScraper: class {
    scrapeTierList = scraperMocks.tcg;
  },
}));
vi.mock("@/infrastructure/adapters/externalServices/YgoMetaOcgScraper.js", () => ({
  YgoMetaOcgScraper: class {
    scrapeTierList = scraperMocks.ocg;
  },
}));

interface SeedEntry {
  deckName: string;
  tier?: number;
  position?: number;
  source?: "scraped" | "manual";
  isActive?: boolean;
  linkedArchetypeId?: number | null;
  linkedArchetypeName?: string | null;
  imageManuallySet?: boolean;
  imageOffsetY?: number;
}

async function seedEntry(data: SeedEntry) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.tierListEntry.create({
    data: {
      deckName: data.deckName,
      tier: data.tier ?? 1,
      format: "masterduel",
      position: data.position ?? 0,
      source: data.source ?? "scraped",
      isActive: data.isActive ?? true,
      linkedArchetypeId: data.linkedArchetypeId ?? null,
      linkedArchetypeName: data.linkedArchetypeName ?? null,
      imageManuallySet: data.imageManuallySet ?? false,
      imageOffsetY: data.imageOffsetY ?? 0,
    },
  });
  await prisma.$disconnect();
}

async function findEntry(deckName: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const row = await prisma.tierListEntry.findFirst({ where: { deckName } });
  await prisma.$disconnect();
  return row;
}

const IMG = "http://example.com/card.jpg";

describe("Tier List scrape merge (config persistence)", () => {
  let app: Express;

  beforeAll(async () => {
    const { app: expressApp } = await import("@/index.js");
    app = expressApp;
  });

  beforeEach(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.tierListEntry.deleteMany();
    await prisma.tierListConfig.deleteMany();
    await prisma.$disconnect();
    vi.clearAllMocks();
  });

  it("should soft-delete a configured entry that falls out of the meta (preserving config), and hard-delete unconfigured ones", async () => {
    await seedEntry({
      deckName: "ConfiguredVolatile",
      tier: 4,
      source: "scraped",
      linkedArchetypeId: 42,
      linkedArchetypeName: "Blue Dragon",
      imageManuallySet: true,
    });
    await seedEntry({ deckName: "PlainFallen", tier: 3, source: "scraped" });
    await seedEntry({ deckName: "ManualFrozen", tier: 3, source: "manual" });

    scraperMocks.masterduel.mockResolvedValue([
      { deckName: "Unrelated", tier: 1, imageUrl: IMG },
    ]);

    const res = await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });
    expect(res.status).toBe(200);

    // Configured entry: still in DB, soft-deleted, config intact
    const configured = await findEntry("ConfiguredVolatile");
    expect(configured).not.toBeNull();
    expect(configured!.isActive).toBe(false);
    expect(configured!.linkedArchetypeId).toBe(42);
    expect(configured!.linkedArchetypeName).toBe("Blue Dragon");
    expect(configured!.imageManuallySet).toBe(true);

    // Unconfigured fallen entry: hard-deleted
    expect(await findEntry("PlainFallen")).toBeNull();

    // Manual entry: untouched
    const manual = await findEntry("ManualFrozen");
    expect(manual).not.toBeNull();
    expect(manual!.isActive).toBe(true);

    // Public list: only the manual + unrelated decks are visible
    const list = await request(app).get("/api/tier-list?format=masterduel");
    const names = list.body.entries.map((e: { deckName: string }) => e.deckName);
    expect(names).toContain("Unrelated");
    expect(names).toContain("ManualFrozen");
    expect(names).not.toContain("ConfiguredVolatile");
    expect(names).not.toContain("PlainFallen");
  });

  it("should reactivate a configured entry when its deck returns to the meta, keeping the config", async () => {
    await seedEntry({
      deckName: "ConfiguredVolatile",
      tier: 4,
      source: "scraped",
      linkedArchetypeId: 42,
      linkedArchetypeName: "Blue Dragon",
      imageManuallySet: true,
    });

    // First scrape: deck is out of the meta -> soft-delete
    scraperMocks.masterduel.mockResolvedValue([{ deckName: "Other", tier: 1, imageUrl: IMG }]);
    await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });

    // Second scrape: deck returns at tier 2
    scraperMocks.masterduel.mockResolvedValue([
      { deckName: "ConfiguredVolatile", tier: 2, imageUrl: IMG },
    ]);
    const res = await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });
    expect(res.status).toBe(200);

    const row = await findEntry("ConfiguredVolatile");
    expect(row).not.toBeNull();
    expect(row!.isActive).toBe(true);
    expect(row!.tier).toBe(2);
    expect(row!.linkedArchetypeId).toBe(42);
    expect(row!.linkedArchetypeName).toBe("Blue Dragon");
    expect(row!.imageManuallySet).toBe(true);
  });

  it("should update the tier of a configured entry that stays in the meta without touching its config", async () => {
    await seedEntry({
      deckName: "LinkedDeck",
      tier: 4,
      source: "scraped",
      linkedArchetypeId: 7,
      linkedArchetypeName: "Yubel",
      imageManuallySet: true,
    });

    scraperMocks.masterduel.mockResolvedValue([
      { deckName: "LinkedDeck", tier: 1, imageUrl: IMG },
    ]);

    const res = await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });
    expect(res.status).toBe(200);

    const row = await findEntry("LinkedDeck");
    expect(row!.isActive).toBe(true);
    expect(row!.tier).toBe(1);
    expect(row!.linkedArchetypeId).toBe(7);
    expect(row!.linkedArchetypeName).toBe("Yubel");
    expect(row!.imageManuallySet).toBe(true);
  });

  it("should NOT update the tier of a manual linked entry that stays in the meta (manual is frozen)", async () => {
    await seedEntry({
      deckName: "ManualLinked",
      tier: 0,
      source: "manual",
      linkedArchetypeId: 7,
      linkedArchetypeName: "Yubel",
    });

    scraperMocks.masterduel.mockResolvedValue([{ deckName: "ManualLinked", tier: 1, imageUrl: IMG }]);

    const res = await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });
    expect(res.status).toBe(200);

    const row = await findEntry("ManualLinked");
    expect(row).not.toBeNull();
    expect(row!.isActive).toBe(true);
    expect(row!.tier).toBe(0);
    expect(row!.linkedArchetypeId).toBe(7);
  });

  it("should NOT reactivate an inactive manual configured entry when its deck returns", async () => {
    await seedEntry({
      deckName: "GoneManual",
      tier: 0,
      source: "manual",
      isActive: false,
      linkedArchetypeId: 42,
      linkedArchetypeName: "Blue Dragon",
      imageManuallySet: true,
    });

    scraperMocks.masterduel.mockResolvedValue([{ deckName: "GoneManual", tier: 1, imageUrl: IMG }]);

    const res = await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });
    expect(res.status).toBe(200);

    const row = await findEntry("GoneManual");
    expect(row).not.toBeNull();
    expect(row!.isActive).toBe(false);
  });

  it("should list soft-deleted entries via /inactive and restore them via save", async () => {
    await seedEntry({ deckName: "DeletedManual", tier: 2, source: "manual", isActive: false });
    await seedEntry({ deckName: "DeletedScraped", tier: 3, source: "scraped", isActive: false });

    const inactive = await request(app).get("/api/tier-list/inactive?format=masterduel");
    expect(inactive.status).toBe(200);
    const names = inactive.body.entries.map((e: { deckName: string }) => e.deckName);
    expect(names).toContain("DeletedManual");
    expect(names).toContain("DeletedScraped");

    const id = (await findEntry("DeletedManual"))!.id;
    const saveRes = await request(app).post("/api/tier-list/save").send({
      format: "masterduel",
      entries: [
        { id, deckName: "DeletedManual", tier: 2, position: 0, imageUrl: null, source: "manual" },
      ],
    });
    expect(saveRes.status).toBe(200);

    const restored = await findEntry("DeletedManual");
    expect(restored!.isActive).toBe(true);

    const inactiveAfter = await request(app).get("/api/tier-list/inactive?format=masterduel");
    const namesAfter = inactiveAfter.body.entries.map((e: { deckName: string }) => e.deckName);
    expect(namesAfter).not.toContain("DeletedManual");
    expect(namesAfter).toContain("DeletedScraped");
  });

  // for entries have images manually positioned using the slider
  it("should soft-delete and reactivate an entry with only imageOffsetY set (no link, no manual image)", async () => {
    await seedEntry({
      deckName: "OffsetOnly",
      tier: 4,
      source: "scraped",
      imageOffsetY: 75,
    });

    // First scrape: deck falls out of meta -> should soft-delete (not hard-delete) because imageOffsetY != 0
    scraperMocks.masterduel.mockResolvedValue([{ deckName: "Other", tier: 1, imageUrl: IMG }]);
    await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });

    const afterFall = await findEntry("OffsetOnly");
    expect(afterFall).not.toBeNull();
    expect(afterFall!.isActive).toBe(false);
    expect(afterFall!.imageOffsetY).toBe(75);

    // Second scrape: deck returns -> should reactivate preserving imageOffsetY
    scraperMocks.masterduel.mockResolvedValue([
      { deckName: "OffsetOnly", tier: 2, imageUrl: IMG },
    ]);
    await request(app).post("/api/tier-list/scrape").send({ format: "masterduel" });

    const afterReturn = await findEntry("OffsetOnly");
    expect(afterReturn).not.toBeNull();
    expect(afterReturn!.isActive).toBe(true);
    expect(afterReturn!.tier).toBe(2);
    expect(afterReturn!.imageOffsetY).toBe(75);
  });
});