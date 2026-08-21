import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * E2 PRESSURE-LINE (owner ruling 2026-08-21) agent-worktree scratch config: self-boot a dev server
 * on a free port (5278) so this branch can gate without touching the default 5188 or any live lane
 * port — fires and three sibling agents run concurrently. Same projects/viewports as the default
 * config, so a pass here means what a pass there means.
 *
 * A DEV SERVER, NOT A PREVIEW (F-1457-1 and the harness-spec lesson): specs that runtime-import
 * `/src/*.ts` 404 against a production preview build, and the reds read like tree reds.
 */
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5278' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5278 --strictPort',
    url: 'http://127.0.0.1:5278',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
