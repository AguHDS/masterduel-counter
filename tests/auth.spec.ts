import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display sign in button on homepage", async ({ page }) => {
    await page.goto("/");
    // TODO: Add assertions once test data is in place
  });
});
