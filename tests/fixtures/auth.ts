/**
 * Auth test fixtures.
 *
 * Provides helpers to create test users, log in, and clean up after tests.
 * Uses the test database (test.db), never touches the production database.
 *
 * Usage:
 *   import { createTestUser, loginAs } from "../../fixtures/auth";
 *   const { user, cleanup } = await createTestUser();
 *   // ... run test ...
 *   await cleanup();
 */
