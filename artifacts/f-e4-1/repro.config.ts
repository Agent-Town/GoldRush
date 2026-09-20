import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'repro.spec.ts',
  timeout: 100_000,
  workers: 2,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:5284', trace: 'off' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5284 --strictPort',
    url: 'http://127.0.0.1:5284',
    reuseExistingServer: false,
    timeout: 20_000,
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel: 'chromium' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 }, channel: 'chromium' } },
  ],
});
