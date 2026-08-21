import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// A10 scratch config (2026-08-21). Self-boots a DEV server on an unused 527x port so this
// worktree's gate never touches the live lane ports or 5188/5233, and so a concurrent sibling
// agent's gate cannot collide with this one. Dev, not preview: `er01-e9-census` runtime-imports
// `/src/*.ts` through Vite's SSR module graph, which a production preview bundle cannot serve.
// Same projects and viewports as the default config, so a pass here means what a pass there means.
// Delete once the slice is drained.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5279' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5279 --strictPort',
    url: 'http://127.0.0.1:5279',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
