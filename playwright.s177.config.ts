import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// s177 drain scratch config: self-boot the production bundle on a free port
// (5237) to gate the lane/polish drain (SS-01 + tile-identity) without touching
// lane ports. Delete after the fire.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5237' },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 5237',
    url: 'http://127.0.0.1:5237',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
