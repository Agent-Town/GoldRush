import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Harness for `boot-probe.spec.ts` (A7 drain evidence, 2026-08-20).
 *
 * It needs its own config for two reasons, both deliberate:
 *   - the default config's `testDir: './e2e'` does not sweep `artifacts/`, and should not — this
 *     probe is evidence for one drain, not a standing suite;
 *   - SCRATCH PORT 5237, so running it can never collide with a live gate on the default port
 *     (Mistake #12, "The Gate Contamination").
 *
 * Kept beside the probe rather than in the repo root so the evidence stays re-runnable by
 * anyone reading the review, without adding another `playwright.*.config.ts` to the root.
 *
 * Usage: npx playwright test --config artifacts/e8-low-orbit/boot-probe.config.ts
 */
const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const baseURL = 'http://127.0.0.1:5237';

export default defineConfig({
  testDir: HERE,
  timeout: 120_000,
  workers: 1,
  expect: { timeout: 10_000 },
  use: { baseURL, trace: 'off', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5237 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    cwd: ROOT,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel: 'chromium' },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, channel: 'chromium' },
    },
  ],
});
