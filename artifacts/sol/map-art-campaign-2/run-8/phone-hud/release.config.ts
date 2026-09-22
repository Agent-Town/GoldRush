import path from 'node:path';
import { defineConfig } from '@playwright/test';
import release from '../../../../../playwright.release.config';
const root = path.resolve(import.meta.dirname, '../../../../..');
// Same release-owned assertions and build, on this task's sole permitted server port.
export default defineConfig({
  ...release,
  testDir: path.join(root, 'e2e'),
  globalSetup: undefined,
  use: { ...release.use, baseURL: 'http://127.0.0.1:5312' },
  webServer: undefined,
});
