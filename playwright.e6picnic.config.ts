import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * E6 PICNIC ADMISSION agent-worktree scratch config: self-boot a dev server on a free port (5274)
 * so this branch can gate without touching the default 5188, the A3 scratch 5273, or any live lane
 * port — a sibling agent worktree and a lane runner were both live during this work (Mistake #12).
 * Same projects/viewports as the default config, so a pass here means what a pass there means.
 */
export default defineConfig({
  ...baseConfig,
  // The door-probe lives beside its evidence in `artifacts/e6-picnic/` rather than in the standing
  // suite (it is drain evidence, not a permanent gate), so this config can be aimed at it without
  // a second config file — the same seam `playwright.a3-scratch.config.ts` uses.
  testDir: process.env.GR_E6P_TESTDIR ?? './e2e',
  testIgnore: process.env.GR_E6P_TESTDIR ? [] : baseConfig.testIgnore,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5274' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5274 --strictPort',
    url: 'http://127.0.0.1:5274',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
