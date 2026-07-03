import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// Same suite, but against the production bundle (catches base-path/asset bugs).
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5189' },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 5189',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
