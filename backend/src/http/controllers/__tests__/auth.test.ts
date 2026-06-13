// Betterauth flows (like change passwrd) don't need to be tested
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import type { Express } from "express";

const TEST_USER = "testuser123";
const TEST_EMAIL = "testuser123@example.com";
const TEST_PASSWORD = "password123";
const FAKE_TURNSTILE = "test-turnstile-token";

let app: Express;

beforeAll(async () => {
  const { app: expressApp } = await import("@/index.js");
  app = expressApp;
});

// Clean database before starting each test
beforeEach(async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    // Clean in FK-safe order
    await prisma.instanceFavorite.deleteMany();
    await prisma.instanceLike.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.archetypeInstance.deleteMany();
    await prisma.customDeck.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  } finally {
    await prisma.$disconnect();
  }
});

async function registerUser(
  user: string = TEST_USER,
  email: string = TEST_EMAIL,
  password: string = TEST_PASSWORD,
) {
  return request(app)
    .post("/api/auth/register")
    .send({ user, email, password, turnstileToken: FAKE_TURNSTILE });
}

async function loginAndGetAgent(
  user: string = TEST_USER,
  password: string = TEST_PASSWORD,
) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ user, password });
  return agent;
}

// REGISTER

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe(TEST_USER);
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it("should reject duplicate username", async () => {
    await registerUser();
    const res = await registerUser(TEST_USER, "other@example.com");

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Username already taken");
  });

  it("should reject duplicate email", async () => {
    await registerUser();
    const res = await registerUser("otheruser", TEST_EMAIL);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Email already taken");
  });

  it("should reject empty username", async () => {
    const res = await registerUser("");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Username cannot be empty");
  });

  it("should reject username over 25 characters", async () => {
    const res = await registerUser("a".repeat(26));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot exceed 25|at most/i);
  });

  it("should reject invalid email", async () => {
    const res = await registerUser("validuser", "notanemail");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email|invalid/i);
  });

  it("should reject password shorter than 8 characters", async () => {
    const res = await registerUser("validuser", "valid@email.com", "1234567");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8|password/i);
  });

  it("should reject missing CAPTCHA token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ user: TEST_USER, email: TEST_EMAIL, password: TEST_PASSWORD });
    // No turnstileToken in body

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/CAPTCHA/i);
  });
});

// LOGIN

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await registerUser();
  });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ user: TEST_USER, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe(TEST_USER);
    // Should set session cookie
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ user: TEST_USER, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|incorrect/i);
  });

  it("should reject nonexistent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ user: "nonexistent", password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });

  it("should reject empty fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ user: "", password: "" });

    expect(res.status).toBe(400);
  });
});

// LOGOUT

describe("POST /api/logout", () => {
  beforeEach(async () => {
    await registerUser();
  });

  it("should logout and clear cookies", async () => {
    const agent = await loginAndGetAgent();

    const res = await agent.post("/api/logout");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify session is cleared by checking cookie
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });

  it("should not crash when logging out without session", async () => {
    const res = await request(app).post("/api/logout");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// CHANGE USERNAME

describe("POST /api/auth/change-username", () => {
  const NEW_USERNAME = "newusername456";

  beforeEach(async () => {
    await registerUser();
  });

  it("should change username when authenticated", async () => {
    const agent = await loginAndGetAgent();

    const res = await agent
      .post("/api/auth/change-username")
      .send({ username: NEW_USERNAME });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.username).toBe(NEW_USERNAME);

    // Verify can login with old credentials but username changed
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ user: NEW_USERNAME, password: TEST_PASSWORD });
    expect(loginRes.status).toBe(200);
  });

  it("should reject without authentication", async () => {
    const res = await request(app)
      .post("/api/auth/change-username")
      .send({ username: NEW_USERNAME });

    expect(res.status).toBe(401);
  });

  it("should reject username already taken", async () => {
    // Create second user
    await registerUser("seconduser", "second@example.com");
    const agent = await loginAndGetAgent();

    const res = await agent
      .post("/api/auth/change-username")
      .send({ username: "seconduser" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken/i);
  });

  it("should reject same username as current", async () => {
    const agent = await loginAndGetAgent();

    const res = await agent
      .post("/api/auth/change-username")
      .send({ username: TEST_USER });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/different/i);
  });

  it("should reject empty username", async () => {
    const agent = await loginAndGetAgent();

    const res = await agent
      .post("/api/auth/change-username")
      .send({ username: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot be empty/i);
  });
});

// VERIFY EMAIL

describe("GET /api/auth/verify-email", () => {
  it("should reject missing token", async () => {
    const res = await request(app).get("/api/auth/verify-email");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/token is required/i);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "invalid-token" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });
});
