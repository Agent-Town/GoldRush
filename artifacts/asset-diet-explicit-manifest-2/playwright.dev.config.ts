import { defineConfig } from '@playwright/test';
import path from 'node:path';
import base from '../../playwright.config';

const root = path.resolve(import.meta.dirname, '../..');
export default defineConfig({
  ...base,
  testDir: path.join(root, 'e2e'),
  outputDir: path.join(import.meta.dirname, 'dev-results'),
  updateSnapshots: 'none',
  reporter: [['list'], ['json', { outputFile: path.join(import.meta.dirname, 'dev-results.json') }]],
  globalSetup: path.join(root, 'scripts/external-server-guard.mjs'),
  use: { ...base.use, baseURL: 'http://127.0.0.1:5197' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5197 --strictPort',
    cwd: root,
    url: 'http://127.0.0.1:5197',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
