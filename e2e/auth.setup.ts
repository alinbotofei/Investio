import { test as setup, expect } from "@playwright/test";
import path from "path";

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
