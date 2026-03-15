import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 * Run: npx playwright test
 * UI mode: npx playwright test --ui
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
