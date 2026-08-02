import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

// THE CLAIM BEAUTY SHIFT gate config. Its own vite on 5249 (Mistake #12: never gate
// on a port another worktree's live task owns) so the named suites can be re-run per
// upgrade while the board harness keeps its own server on 5247.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5249' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5249 --strictPort',
    url: 'http://127.0.0.1:5249',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
