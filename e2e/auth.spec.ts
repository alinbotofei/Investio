import { test, expect } from "@playwright/test";

/**
 * Authentication flow tests.
 *
 * These run WITHOUT the stored session so they use the default project
 * (no storageState) — they test the login/signup pages themselves.
 *
 * NOTE: override the project in playwright.config.ts if you want to
 *       run these without browser-state inheritance.
 */

test.describe("Login page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders the login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("shows validation error for empty submission", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const emailInput = page.getByLabel(/email/i);
    const validationMessage = await emailInput.evaluate(
      (el) => (el as HTMLInputElement).validationMessage
    );
    expect(validationMessage).not.toBe("");
  });

  test("shows error for wrong credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("nobody@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const error = page.getByText(/invalid|incorrect|wrong|not found/i);
    await expect(error).toBeVisible({ timeout: 8_000 });
  });

  test("navigates to signup page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /sign up|create account|register/i }).click();
    await expect(page).toHaveURL(/signup|register/i);
  });
});

test.describe("Signup page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders the signup form", async ({ page }) => {
    await page.goto("/auth/signup");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up|create|register/i })).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.goto("/auth/signup");

    await page.getByLabel(/email/i).fill("newuser@investio.dev");

    const passwordFields = page.getByLabel(/password/i);
    await passwordFields.first().fill("securepassword123");
    if ((await passwordFields.count()) > 1) {
      await passwordFields.nth(1).fill("differentpassword");
      await page.getByRole("button", { name: /sign up|create|register/i }).click();

      const error = page.getByText(/match|confirm/i);
      await expect(error).toBeVisible({ timeout: 5_000 });
    }
  });

  test("has a link back to login", async ({ page }) => {
    await page.goto("/auth/signup");

    await page.getByRole("link", { name: /log in|sign in|already/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Authenticated redirect", () => {
  test("redirects /login to /dashboard when already logged in", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  });
});
