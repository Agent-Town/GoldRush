// Run the unchanged release-door suite on the task's only authorized server port.
import release from '../../../../../playwright.release.config';
import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
export default defineConfig({
  ...release,
  testDir: resolve('e2e'),
  globalSetup: undefined,
  use: { ...release.use, baseURL: 'http://127.0.0.1:5303' },
  webServer: {
    cwd: process.cwd(),
    command: 'npx vite preview --host 127.0.0.1 --port 5303 --strictPort'
      + (process.env.GR_ENTRY_RELEASE_BASELINE === '1'
        ? ' --outDir artifacts/sol/map-art-campaign-2/run-10/entry-framing/release-baseline-control/dist' : ''),
    url: 'http://127.0.0.1:5303',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
