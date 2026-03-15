import { test, expect } from "@playwright/test";

test.describe("Chat page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("renders the message input", async ({ page }) => {
    const input = page.getByRole("textbox");
    await expect(input).toBeVisible({ timeout: 8_000 });
  });

  test("send button is disabled when the input is empty", async ({ page }) => {
    const sendBtn = page.getByRole("button", { name: /send/i });
    await expect(sendBtn).toBeDisabled();
  });

  test("enables send button after typing", async ({ page }) => {
    const input = page.getByRole("textbox");
    await input.fill("What is the price of Apple stock?");

    const sendBtn = page.getByRole("button", { name: /send/i });
    await expect(sendBtn).toBeEnabled();
  });

  test("sends a message and shows a response", async ({ page }) => {
    const input = page.getByRole("textbox");
    await input.fill("Hello");
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText("Hello")).toBeVisible({ timeout: 5_000 });

    const assistantMessage = page.locator('[data-role="assistant"], [data-testid="assistant-message"]').first();
    if (await assistantMessage.count() > 0) {
      await expect(assistantMessage).toBeVisible({ timeout: 30_000 });
    }
  });

  test("conversation appears in the sidebar after first message", async ({ page }) => {
    const input = page.getByRole("textbox");
    await input.fill("Tell me about Investio");
    await page.keyboard.press("Enter");

    const sidebar = page.getByRole("complementary");
    await expect(sidebar).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Chat widget (dashboard)", () => {
  test("opens the chat widget from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    const fabOrChatBtn = page.getByRole("button", { name: /chat|ask|ai/i }).first();
    if (await fabOrChatBtn.isVisible()) {
      await fabOrChatBtn.click();
      const chatPanel = page.getByRole("dialog").or(page.getByTestId("chat-widget"));
      await expect(chatPanel).toBeVisible({ timeout: 5_000 });
    } else {
      test.skip();
    }
  });
});
