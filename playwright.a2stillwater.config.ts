import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * A2 (Stillwater noise-hunt) agent-worktree scratch config: self-boot a dev server on a free port
 * (5275) so this branch can gate without touching the default 5188, the A3 scratch (5273/5274),
 * or any live lane port — two sibling agents build E9 maps concurrently and Codex holds lane-a.
 * Same projects/viewports as the default config, so a pass here means what a pass there means.
 */
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5275' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5275 --strictPort',
    url: 'http://127.0.0.1:5275',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
