// Use the owning release harness on this task's only authorized port.
// Assertions, project devices and test selection remain the release config's.
import releaseConfig from '../../../../playwright.release.config';
import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  ...releaseConfig,
  testDir: path.resolve('e2e'),
  globalSetup: path.resolve('scripts/external-server-guard.mjs'),
  use: { ...releaseConfig.use, baseURL: 'http://127.0.0.1:5303' },
  webServer: undefined, // The already-built E1 preview is explicitly started on 5303.
});
