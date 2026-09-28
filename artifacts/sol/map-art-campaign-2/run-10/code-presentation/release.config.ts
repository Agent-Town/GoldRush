// The owning release harness, with only its server port relocated to this task's authorized 5312.
// Build/assertion receipts are separate: a red release assertion remains a gate hold.
import release from '../../../../../playwright.release.config';
import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
export default defineConfig({
  ...release,
  testDir: resolve('e2e'),
  outputDir: resolve('artifacts/sol/map-art-campaign-2/run-10/code-presentation/release-results'),
  globalSetup: undefined,
  use: { ...release.use, baseURL: 'http://127.0.0.1:5312' },
  webServer: { command: 'npx vite preview --host 127.0.0.1 --port 5312 --strictPort', cwd: process.cwd(), url: 'http://127.0.0.1:5312', reuseExistingServer: false, timeout: 30000 },
});
