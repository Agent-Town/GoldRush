import { defineConfig, devices } from '@playwright/test';

// Ceremony-engineer scratch config: self-starts vite on 5241 so the fixed 5188
// dev port (lane runners) is never touched. Gate battery for engine/ceremonies.
const baseURL = 'http://127.0.0.1:5241';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5241 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel: 'chromium' },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], browserName: 'chromium', viewport: { width: 390, height: 844 }, channel: 'chromium' },
    },
  ],
});
