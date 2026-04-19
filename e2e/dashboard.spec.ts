import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("heading", { name: "Investment Dashboard" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows the Investment Dashboard heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Investment Dashboard" })
    ).toBeVisible();
  });

  test("displays the watchlist section", async ({ page }) => {
    await expect(page.getByText(/my watchlist/i).first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test("AI assistant input accepts text", async ({ page }) => {
    const input = page.locator("[data-test-id='dashboard-chat-input']");
    await expect(input).toBeVisible({ timeout: 8_000 });
    await input.fill("What is the price of AAPL?");
    await expect(input).toHaveValue("What is the price of AAPL?");
  });

  test("AI assistant send navigates to chat with context", async ({ page }) => {
    await page.locator("[data-test-id='dashboard-chat-input']").fill("AAPL analysis");
    await page.locator("[data-test-id='dashboard-chat-send']").click();
    await page.waitForURL(/chat/, { timeout: 10_000 });
    await expect(page).toHaveURL(/chat/);
  });

  test("shows market overview content", async ({ page }) => {
    await expect(
      page.getByText(/top movers|stocks|market|cryptocurrency/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
