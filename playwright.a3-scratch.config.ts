import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * A3 (Echo Canyon broadcast mirror) agent-worktree scratch config: self-boot a dev server on a
 * free port (5273) so this branch can gate without touching the default 5188 or any live lane
 * port — Codex runs concurrently on lane-c. Same projects/viewports as the default config, so a
 * pass here means the same thing a pass there does.
 */
export default defineConfig({
  ...baseConfig,
  // The drain-evidence boot probe lives beside its prover in `artifacts/e7-echo-canyon/` rather
  // than in the standing suite, so this config can be pointed at it without a second file.
  testDir: process.env.GR_A3_TESTDIR ?? './e2e',
  testIgnore: process.env.GR_A3_TESTDIR ? [] : baseConfig.testIgnore,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5273' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5273 --strictPort',
    url: 'http://127.0.0.1:5273',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
