import { defineConfig, devices } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const envTestPath = path.resolve(__dirname, ".env.test");
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    const value = rest.join("=");
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

const authDir = path.resolve(__dirname, "e2e/.auth");
const authFile = path.resolve(authDir, "user.json");
if (!fs.existsSync(authFile)) {
  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(authFile, '{"cookies":[],"origins":[]}');
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/setup/auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testMatch: "**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
