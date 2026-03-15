import { test as setup, expect } from "@playwright/test";
import path from "path";

/**
 * Global authentication setup.
 *
 * Logs in once and saves the browser storage state so every test project can
 * pick up the session instead of repeating the login flow.
 *
 * Requires the following env vars (set them in a local .env.test file):
 *   E2E_EMAIL    – valid test-account email
 *   E2E_PASSWORD – test-account password
 */

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? "test@investio.dev";
  const password = process.env.E2E_PASSWORD ?? "password";

  await page.goto("/login");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({ path: authFile });
});
