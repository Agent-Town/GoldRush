// The existing release spec and Chrome projects on this lane's only authorized port.
// E1 dist is prebuilt. assert-release-build is recorded separately: its existing
// motor-hauler asset hold must remain red while browser diagnostics still run.
import releaseConfig from '../../../../../playwright.release.config';
import { defineConfig } from '@playwright/test';
import path from 'node:path';
const root = process.cwd();
export default defineConfig({
  ...releaseConfig,
  testDir: path.join(root, 'e2e'),
  globalSetup: path.join(root, 'scripts/external-server-guard.mjs'),
  use: { ...releaseConfig.use, baseURL: 'http://127.0.0.1:5312' },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 5312 --strictPort',
    cwd: root,
    url: 'http://127.0.0.1:5312',
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
