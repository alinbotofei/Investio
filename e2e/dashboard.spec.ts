import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("loads and shows core layout elements", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();

    const marketSection = page.getByText(/market|overview|portfolio/i).first();
    await expect(marketSection).toBeVisible({ timeout: 10_000 });
  });

  test("displays watchlist panel", async ({ page }) => {
    const watchlist = page.getByText(/watchlist/i).first();
    await expect(watchlist).toBeVisible({ timeout: 8_000 });
  });

  test("global search opens and accepts input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|symbol|stock/i).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("AAPL");
      await expect(searchInput).toHaveValue("AAPL");
    } else {
      await page.keyboard.press("Control+k");
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible({ timeout: 3_000 });
      await modal.getByRole("textbox").fill("AAPL");
    }
  });

  test("navigates to a ticker page from the search results", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|symbol|stock/i).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("AAPL");
    } else {
      await page.keyboard.press("Control+k");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible({ timeout: 3_000 });
      await dialog.getByRole("textbox").fill("AAPL");
    }

    const appleResult = page.getByText(/apple/i).first();
    await expect(appleResult).toBeVisible({ timeout: 6_000 });
    await appleResult.click();

    await expect(page).toHaveURL(/ticker\/AAPL/i, { timeout: 10_000 });
  });
});
