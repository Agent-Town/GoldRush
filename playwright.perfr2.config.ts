import { defineConfig, devices } from '@playwright/test';

// perf-r2 measurement harness. Deliberately NOT the default battery: the default config's
// `testIgnore` drops `**/*.rig.ts`, so this rig can carry machine-specific measurement without
// ever becoming red-inventory debt (the F-1440-2 cure, applied at the config layer).
// Port 5247: four sibling shifts hold 5233/5241/5271/5272/5281/5282/5301/5344 on this box.
const baseURL = process.env.GR_PERFR2_BASE_URL ?? 'http://127.0.0.1:5247';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/perf-r2-census.rig.ts'],
  timeout: 900_000,
  workers: 1,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.GR_PERFR2_EXTERNAL_SERVER === '1' ? undefined : {
    command: 'npx vite --host 127.0.0.1 --port 5247 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
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
