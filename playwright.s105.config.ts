import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// s105 fire scratch config — lanes occupy the default 5188 dev port, so drain
// the main-slot 042-anim gate against a dedicated scratch dev server on 5199.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5199' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5199 --strictPort',
    url: 'http://127.0.0.1:5199',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
