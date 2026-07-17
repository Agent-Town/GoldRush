import { defineConfig, devices } from '@playwright/test';

// pb/01-02 scratch config: ports 5207 and 5233 were found occupied by FOREIGN
// trees (neither served the playbook seam), so per the gate-contamination rule
// this task gates on its own scratch port 5241. Identical to
// playwright.scratch.config.ts otherwise. Delete after the drain.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:5241',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: 'chromium',
  },
  webServer: {
    command: 'echo reuse',
    url: 'http://127.0.0.1:5241',
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
  ],
});
