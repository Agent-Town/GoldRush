import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// s194 drain scratch config: self-boot the production bundle on a free port
// (5244) to gate the lane/polish drain (tr-01 continuous-ground) without
// touching live lane ports (lane-b 057, lane-d gt-04). Delete after the fire.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5244' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5244 --strictPort',
    url: 'http://127.0.0.1:5244',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
