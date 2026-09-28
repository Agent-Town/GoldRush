import { defineConfig, devices } from '@playwright/test';

/**
 * Evidence-only config for F-RB2-2 (a): the two disembark cases, shot at 1280 and 390 against the
 * implementer's own dev server on port 5305. Deliberately NOT part of the default gate — the rule
 * itself is pinned by `scripts/regatta-boat-steer.test.mjs` and `e2e/e5-regatta-boat.spec.ts`; this
 * config exists so the screenshots in this directory can be reproduced exactly.
 *
 *   npx vite --port 5305 --strictPort --host 127.0.0.1
 *   npx playwright test --config artifacts/f-rb2-2-gangway-reach/pw.config.ts --workers=1 --reporter=line
 */
export default defineConfig({
  testDir: '.',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: {
    baseURL: process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5305',
    trace: 'off',
    screenshot: 'off',
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
