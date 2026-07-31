import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  // The base config ignores this spec on purpose (F-1296-3) and that ignore rides in on the spread
  // above — measured s1301: without this line THIS config collects 0 tests and `npm run test:release`
  // passes vacuously. The owning config must re-open what the base one closes.
  testIgnore: ['**/*.rig.ts'],
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
