import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// s181 drain scratch config: self-boot the production bundle on a free port
// (5241) to gate the lane/m3 drain (e3-power-graph-core) without touching
// live lane ports. Delete after the fire.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5241' },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 5241',
    url: 'http://127.0.0.1:5241',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
