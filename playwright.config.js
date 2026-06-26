// Playwright config — end-to-end tests run the real site in a real browser.
// Specs live in e2e/ and are named *.e2e.js so `bun test` (which matches
// *.test.js) never tries to load them with the wrong runner.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // Serve the static site for the duration of the run.
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "ignore",
  },
  projects: [
    {
      name: "desktop",
      // Use the system Chrome instead of downloading a browser.
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
  ],
});
