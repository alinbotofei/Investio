import { test, expect } from "@playwright/test";

test.describe("Ticker page — AAPL", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ticker/AAPL");
    await page.waitForLoadState("domcontentloaded");
  });

  test("loads and shows the symbol heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /AAPL/i }).first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("shows the back to dashboard button", async ({ page }) => {
    await expect(
      page.locator("[data-test-id='back-to-dashboard']")
    ).toBeVisible({ timeout: 20_000 });
  });

  test("back button navigates away from ticker", async ({ page }) => {
    await page.goto("/dashboard");
    await page.goto("/ticker/AAPL");
    await page.locator("[data-test-id='back-to-dashboard']").waitFor({
      state: "visible",
      timeout: 20_000,
    });
    await page.locator("[data-test-id='back-to-dashboard']").click();
    await page.waitForURL(/dashboard|chat/, { timeout: 10_000 });
    await expect(page).toHaveURL(/dashboard|chat/);
  });

  test("shows the watchlist toggle", async ({ page }) => {
    await expect(
      page.locator("[data-test-id='watchlist-toggle']")
    ).toBeVisible({ timeout: 20_000 });
  });

  test("shows the trading chart canvas", async ({ page }) => {
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 });
  });
});
