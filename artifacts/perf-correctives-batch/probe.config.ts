import baseConfig from '../../playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  testDir: '.',
  testMatch: ['probe.spec.ts'],
  globalSetup: undefined,
  timeout: 120_000,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5306', trace: 'off' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5306 --strictPort',
    cwd: '../..',
    url: 'http://127.0.0.1:5306',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: 'desktop-chrome', use: { ...(baseConfig.projects?.[0]?.use ?? {}) } }],
});
