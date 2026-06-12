/**
 * Guide test fixtures.
 *
 * Provides helpers to create test guides (counter/deck) via API calls.
 * Uses the test database (test.db), never touches the production database.
 *
 * Usage:
 *   import { createTestGuide } from "../../fixtures/guides";
 *   const { guide, cleanup } = await createTestGuide(page, { type: "DECK" });
 *   // ... run test ...
 *   await cleanup();
 */
