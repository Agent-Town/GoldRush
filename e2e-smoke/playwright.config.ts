import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 300_000,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  use: { permissions: ['clipboard-read', 'clipboard-write'] },
  projects: [{ name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } }],
});
