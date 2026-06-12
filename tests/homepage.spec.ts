import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display main search and latest guides", async ({ page }) => {
    await page.goto("/");
    // TODO: Verify homepage renders correctly
  });
});
