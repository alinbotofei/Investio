import { test, expect } from "@playwright/test";

test.describe("User journeys", () => {
  test("navigates from dashboard to chat via AI assistant", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Investment Dashboard" })
    ).toBeVisible({ timeout: 10_000 });

    await page.locator("[data-test-id='dashboard-chat-input']").fill("Analyze AAPL");
    await page.locator("[data-test-id='dashboard-chat-send']").click();
    await page.waitForURL(/chat/, { timeout: 10_000 });
    await expect(page.locator("[data-test-id='chat-input']")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("navigates to a ticker page and returns", async ({ page }) => {
    await page.goto("/dashboard");
    await page.goto("/ticker/AAPL");
    await expect(
      page.getByRole("heading", { name: /AAPL/i }).first()
    ).toBeVisible({ timeout: 20_000 });

    await page.locator("[data-test-id='back-to-dashboard']").click();
    await page.waitForURL(/dashboard|chat/, { timeout: 10_000 });
    await expect(page).toHaveURL(/dashboard|chat/);
  });

  test("sidebar links navigate between pages", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("[data-test-id='nav-chat']").click();
    await page.waitForURL(/chat/, { timeout: 10_000 });
    await expect(page).toHaveURL(/chat/);

    await page.locator("[data-test-id='nav-dashboard']").click();
    await page.waitForURL(/dashboard/, { timeout: 10_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("unauthenticated access to /dashboard redirects to login", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL(/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/login/);
  });
});
