import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  testMatch: /release-build\.spec\.ts/,
  projects: baseConfig.projects?.filter((project) => project.name === 'desktop-chrome' || project.name === 'mobile-chrome'),
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5190' },
  webServer: {
    command: 'GR_RELEASE=e1 npm run build:release && npx vite preview --host 127.0.0.1 --port 5190',
    url: 'http://127.0.0.1:5190',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
