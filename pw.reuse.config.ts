import base from './playwright.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({
  ...base,
  use: { ...(base as any).use, baseURL: 'http://127.0.0.1:5189' },
  webServer: {
    command: 'npx vite --port 5189 --strictPort',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
