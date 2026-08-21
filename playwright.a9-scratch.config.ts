import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * A9 (Devil's Alley scheduled relocation) agent-worktree scratch config: self-boot a dev server on
 * a free port (5276) so this branch can gate without touching the default 5188 or any live lane
 * port — Codex and sibling agents run concurrently. Same projects/viewports as the default config,
 * so a pass here means the same thing a pass there does.
 *
 * A DEV SERVER, NOT A PREVIEW (F-1457-1 and the harness-spec lesson): specs that runtime-import
 * `/src/*.ts` 404 against a production preview build, and the reds read like tree reds.
 */
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5276' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5276 --strictPort',
    url: 'http://127.0.0.1:5276',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
