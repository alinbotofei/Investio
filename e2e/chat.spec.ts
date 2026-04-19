import { test, expect } from "@playwright/test";

test.describe("Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
  });

  test("renders the message input", async ({ page }) => {
    await expect(
      page.locator("[data-test-id='chat-input']")
    ).toBeVisible({ timeout: 8_000 });
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    await expect(
      page.locator("[data-test-id='chat-send-button']")
    ).toBeDisabled({ timeout: 8_000 });
  });

  test("send button enables after typing", async ({ page }) => {
    await page.locator("[data-test-id='chat-input']").fill("Hello");
    await expect(
      page.locator("[data-test-id='chat-send-button']")
    ).toBeEnabled();
  });

  test("clears input after sending a message", async ({ page }) => {
    const input = page.locator("[data-test-id='chat-input']");
    await input.fill("Hello");
    await page.locator("[data-test-id='chat-send-button']").click();
    await expect(page.getByText("Hello").first()).toBeVisible({ timeout: 8_000 });
  });
});
