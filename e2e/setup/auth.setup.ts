import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page, request }) => {
  const email = process.env.E2E_EMAIL ?? "investiotesting@investio.com";
  const password = process.env.E2E_PASSWORD ?? "Testing12345!";

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const checkRes = await request.post("/api/auth/check-user", { data: { email } });
  if (checkRes.ok()) {
    const { exists } = await checkRes.json();
    if (!exists) {
      await request.post("/api/auth/register", {
        data: { email, name: "Investio Test", password },
      });
    }
  }

  await page.goto("/chat", { waitUntil: "domcontentloaded" }).catch(() => {});

  await page.goto("/login");
  await expect(page.locator("[data-test-id='email-input']")).toBeVisible({ timeout: 15_000 });
  await page.locator("[data-test-id='email-input']").fill(email);
  await page.locator("[data-test-id='continue-button']").click();

  await expect(page.locator("[data-test-id='password-input']")).toBeVisible({ timeout: 15_000 });
  await page.locator("[data-test-id='password-input']").fill(password);
  await page.locator("[data-test-id='sign-in-button']").click();

  await page.waitForURL(/dashboard|chat/, { timeout: 60_000 });

  await page.context().storageState({ path: authFile });
});
