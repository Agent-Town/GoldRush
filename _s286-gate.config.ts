import { defineConfig, devices } from '@playwright/test';

// s286 post-hoc gate — scratch config, port 5199 external server (5188 held by lane-d worktree).
// Untracked debris; delete after gating (rm deny-listed for fires).
const baseURL = 'http://127.0.0.1:5199';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: undefined,
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
