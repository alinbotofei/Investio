import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_EMAIL || "investiotesting@investio.com";
const HAS_DB = !!process.env.DATABASE_URL;

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("email step renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("[data-test-id='email-input']")).toBeVisible();
    await expect(page.locator("[data-test-id='continue-button']")).toBeVisible();
  });

  test("advances to password step for existing user", async ({ page }) => {
    await page.goto("/login");
    await page.locator("[data-test-id='email-input']").fill(TEST_EMAIL);

    const checkResPromise = page.waitForResponse(
      (r) => r.url().includes("/api/auth/check-user")
    );
    await page.locator("[data-test-id='continue-button']").click();
    const checkRes = await checkResPromise;
    expect(checkRes.ok()).toBe(true);
    const { exists } = await checkRes.json();
    expect(exists).toBe(true);

    await expect(
      page.locator("[data-test-id='password-input']")
    ).toBeVisible({ timeout: 15_000 });
  });

  test("redirects to signup for unknown email", async ({ page }) => {
    test.skip(!HAS_DB, "Requires DATABASE_URL to differentiate known vs unknown users");
    const email = `unknown${Date.now()}@test.com`;
    await page.goto("/login");
    await page.locator("[data-test-id='email-input']").fill(email);
    await page.locator("[data-test-id='continue-button']").click();
    await page.waitForURL(/signup/, { timeout: 10_000 });
    await expect(page).toHaveURL(
      new RegExp(`signup.*email=${encodeURIComponent(email)}`)
    );
  });

  test("shows error for wrong password", async ({ page }) => {
    test.skip(!HAS_DB, "Requires DATABASE_URL to reject invalid passwords");
    await page.goto("/login");
    await page.locator("[data-test-id='email-input']").fill(TEST_EMAIL);

    const checkResPromise = page.waitForResponse(
      (r) => r.url().includes("/api/auth/check-user")
    );
    await page.locator("[data-test-id='continue-button']").click();
    await checkResPromise;

    await page
      .locator("[data-test-id='password-input']")
      .waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("[data-test-id='password-input']").fill("wrongpassword");
    await page.locator("[data-test-id='sign-in-button']").click();
    await expect(
      page.getByText(/invalid password|incorrect/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Signup", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders all form fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator("[data-test-id='signup-name-input']")).toBeVisible();
    await expect(page.locator("[data-test-id='signup-email-input']")).toBeVisible();
    await expect(
      page.locator("[data-test-id='signup-password-input']")
    ).toBeVisible();
    await expect(
      page.locator("[data-test-id='signup-confirm-password-input']")
    ).toBeVisible();
    await expect(
      page.locator("[data-test-id='signup-submit-button']")
    ).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.locator("[data-test-id='signup-name-input']").fill("Test User");
    await page
      .locator("[data-test-id='signup-email-input']")
      .fill(`user${Date.now()}@test.com`);
    await page.locator("[data-test-id='signup-password-input']").fill("Password1!");
    await page
      .locator("[data-test-id='signup-confirm-password-input']")
      .fill("Different1!");
    await page.locator("[data-test-id='signup-submit-button']").click();
    await expect(
      page.getByText(/passwords do not match/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});

