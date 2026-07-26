import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  testMatch: /release-base-path\.spec\.ts/,
  projects: baseConfig.projects?.filter((project) => project.name === 'desktop-chrome' || project.name === 'mobile-chrome'),
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5191/goldrush/' },
  webServer: {
    command: 'GR_RELEASE=e1 GR_BASE=/goldrush/ npm run build:release && GR_RELEASE=e1 GR_BASE=/goldrush/ npx vite preview --host 127.0.0.1 --port 5191',
    url: 'http://127.0.0.1:5191/goldrush/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
