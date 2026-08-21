import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.e2pl.config';

/**
 * The same scratch server as `playwright.e2pl.config.ts`, pointed at the drain-evidence boot probe
 * that lives beside its battery in `artifacts/e2-pressure-line/` rather than in the standing suite.
 * Kept as a separate config because the probe is EVIDENCE, not a suite member: it must not start
 * running in the tree's ordinary `npx playwright test` and it must not be silently forgotten either.
 */
export default defineConfig({
  ...baseConfig,
  testDir: './artifacts/e2-pressure-line',
  testIgnore: [],
  testMatch: undefined,
});
