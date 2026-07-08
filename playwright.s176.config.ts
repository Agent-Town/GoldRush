import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// s176 drain scratch config: self-boot the production bundle on a free port
// (5234 family) to gate the pressure-economy drain without touching lane ports.
// Delete after the fire.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5234' },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 5234',
    url: 'http://127.0.0.1:5234',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
