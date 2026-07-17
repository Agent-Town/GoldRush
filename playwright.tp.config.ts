import { defineConfig, devices } from '@playwright/test';

// TP-01/02 scratch config (tp/01-02 worktree): self-starts vite on 5232 (or
// reuses one) so lane ports stay untouched. Delete after the drain.
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:5232',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Full-binary headless: the default headless shell SIGSEGVs on this sandbox image (see playwright.config.ts).
    channel: 'chromium',
  },
  webServer: {
    command: 'npx vite --port 5232 --strictPort',
    url: 'http://127.0.0.1:5232',
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
