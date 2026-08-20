import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// A8-LEGIBILITY scratch config (2026-08-20). Self-boots a DEV server on an unused 527x port so
// this worktree's gate never touches the live lane ports or 5188/5233. Dev, not preview: this
// spec's siblings runtime-import `/src/*.ts` through the page, which a production preview bundle
// cannot serve (see the harness-spec lesson in the drain notes). Delete once the slice is drained.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5274' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5274 --strictPort',
    url: 'http://127.0.0.1:5274',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
