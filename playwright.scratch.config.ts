import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5217';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.GR_CAPTURE_EXTERNAL_SERVER === '1' ? undefined : {
    command: 'npx vite --host 127.0.0.1 --port 5217 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20_000,
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
    {
      name: 'webkit',
      testMatch: /(?:safari-swap|never-trap)\.spec\.ts/,
      grep: /Safari swap|town building and Pan Monument|plain boot/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
    },
  ],
});
