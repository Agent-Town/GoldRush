// The e2e gate for hero-slot-clip-split, on this worktree's own scratch port (5305). The base
// config hard-codes 5188 and starts its own `npm run dev` there, which four concurrent
// implementers on this host cannot share — Mistake #12, the gate contamination. Same projects,
// same specs, one worker, no trace.
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import baseConfig from '../../playwright.config';

const port = process.env.GR_HERO_GATE_PORT ?? '5305';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  ...baseConfig,
  testDir: '../../e2e',
  // Relative paths in the base config resolve against ITS directory; from here they would resolve
  // against artifacts/hero-slot-clip-split/ and the loader dies with MODULE_NOT_FOUND before a
  // single test runs. Re-anchor to the repo root.
  globalSetup: fileURLToPath(new URL('../../scripts/external-server-guard.mjs', import.meta.url)),
  use: { ...baseConfig.use, baseURL, trace: 'off' },
  workers: 1,
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
