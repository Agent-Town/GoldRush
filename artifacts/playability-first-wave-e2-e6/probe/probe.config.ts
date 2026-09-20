import { defineConfig, devices } from '@playwright/test';

/**
 * Diagnostic-only config for the playability-first-wave probe. It never gates anything: the gate is
 * `e2e/playability-smoke.spec.ts` under the repo's own config. This one exists so the probe can live
 * under `artifacts/playability-first-wave-e2-e6/**` (the task's firewall) instead of in `e2e/`.
 */
const baseURL = process.env.GR_PROBE_BASE_URL ?? 'http://127.0.0.1:5380';

export default defineConfig({
  testDir: '.',
  timeout: 300_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL, trace: 'off', screenshot: 'off', video: 'off' },
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
