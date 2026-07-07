import { defineConfig, devices } from '@playwright/test';

// s96 fire scratch config: own vite dev on 5236 to dodge live-runner 5188.
// Delete after the fire.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:5236',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: 'chromium',
  },
  webServer: {
    command: 'npm run dev -- --port 5236 --strictPort',
    url: 'http://127.0.0.1:5236',
    reuseExistingServer: false,
    timeout: 30_000,
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
