import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Gate harness for the A5 drain (2026-08-20).
 *
 * It needs its own config for one reason, and it is Mistake #12 ("The Gate Contamination"):
 * SCRATCH PORT 5275, so running this battery can never collide with a live gate on the default
 * port 5188 or with the sibling A-wave builder measured on 5271-5274.
 *
 * Kept beside the evidence rather than in the repo root so anyone reading the review can re-run
 * it, without adding another `playwright.*.config.ts` to the root.
 *
 * Usage:
 *   npx playwright test --config artifacts/e7-relay-rush/gate.config.ts e7-relay-rush-front
 *   npx playwright test --config artifacts/e7-relay-rush/gate.config.ts er01-e7-census task-025 m1-01 m2-01
 */
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const baseURL = 'http://127.0.0.1:5275';

export default defineConfig({
  testDir: `${ROOT}e2e`,
  timeout: 180_000,
  workers: 1,
  expect: { timeout: 15_000 },
  use: { baseURL, trace: 'off', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5275 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    cwd: ROOT,
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
