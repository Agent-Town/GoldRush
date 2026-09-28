/**
 * test-truth-2 probe harness: the repo's own playwright config (same projects, same devices, same
 * external-server guard), pointed at this directory's *.probe.ts files. Measurement only: nothing
 * here asserts a game property; every probe writes its numbers to ./out for the report.
 *
 *   GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5323 \
 *     npx playwright test -c artifacts/test-truth-2/probes/probe.config.ts --workers=1
 */
import path from 'node:path';
import { defineConfig } from '@playwright/test';
import base from '../../../playwright.config';

const ROOT = path.resolve(import.meta.dirname, '../../..');

export default defineConfig({
  ...base,
  testDir: import.meta.dirname,
  testMatch: ['**/*.probe.ts'],
  testIgnore: [],
  globalSetup: path.join(ROOT, 'scripts/external-server-guard.mjs'),
  outputDir: path.join(ROOT, 'test-results/test-truth-2-probes'),
  timeout: 180_000,
});
