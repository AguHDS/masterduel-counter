import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const TEST_USER = "servermgmtadmin";
const TEST_EMAIL = "srvadmin@ex.com";
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

describe("Server Management API", () => {
  let app: Express;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminAgent: any;
  let tempDir: string;

  beforeAll(async () => {
    // Isolate the server state from the real backend/data dir
    tempDir = mkdtempSync(join(tmpdir(), "mdc-http-"));
    process.env.SERVER_STATE_DIR = tempDir;

    const { app: expressApp } = await import("@/index.js");
    app = expressApp;

    await registerAndLogin(app, TEST_USER, TEST_EMAIL);
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const adminUser = await prisma.user.findFirstOrThrow({ where: { name: TEST_USER } });
    await prisma.user.update({ where: { id: adminUser.id }, data: { role: "admin" } });
    await prisma.$disconnect();

    adminAgent = await registerAndLogin(app, TEST_USER, TEST_EMAIL);
  });

  afterAll(() => {
    delete process.env.SERVER_STATE_DIR;
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("GET /api/status", () => {
    it("should return maintenance flag publicly (no auth)", async () => {
      const res = await request(app).get("/api/status");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.maintenance).toBe(false);
      expect(res.body.message).toBeNull();
    });
  });

  describe("PUT /api/admin/server/maintenance", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).put("/api/admin/server/maintenance").send({ enabled: true });
      expect(res.status).toBe(401);
    });

    it("should enable maintenance and the public status should reflect it", async () => {
      const res = await adminAgent
        .put("/api/admin/server/maintenance")
        .send({ enabled: true, message: "testing" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const status = await request(app).get("/api/status");
      expect(status.body.maintenance).toBe(true);
      expect(status.body.message).toBe("testing");

      // revert to keep other tests clean
      await adminAgent.put("/api/admin/server/maintenance").send({ enabled: false });
    });
  });

  describe("GET /api/admin/server/state", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/admin/server/state");
      expect(res.status).toBe(401);
    });

    it("should return maintenance + no running task for admin", async () => {
      const res = await adminAgent.get("/api/admin/server/state");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.maintenance).toBeDefined();
      expect(res.body.task).toBeNull();
      expect(Array.isArray(res.body.logTail)).toBe(true);
    });
  });

  describe("POST /api/admin/server/restart", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).post("/api/admin/server/restart");
      expect(res.status).toBe(401);
    });

    it("should refuse restart outside production (test env)", async () => {
      const res = await adminAgent.post("/api/admin/server/restart");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("only available in production");
    });
  });

  describe("POST /api/admin/server/tasks", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).post("/api/admin/server/tasks").send({ type: "populate-archetypes" });
      expect(res.status).toBe(401);
    });

    it("should return 400 for an unknown task type", async () => {
      const res = await adminAgent.post("/api/admin/server/tasks").send({ type: "not-a-real-task" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});