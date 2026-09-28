// worktree-vite-cache-1: the DEFAULT config (`playwright.config.ts`), unchanged except where it must be to
// run beside the lanes: its `webServer` runs the same `npm run dev` on this task's port 5326 instead of
// vite.config.ts's 5188 (a lane's port), with the default config's 20 s readiness timeout and no reuse.
// So playwright's own webServer path (spawn vite from the checkout, wait for the URL, stop it) is what
// boots the server here, on whatever vite cache the checkout holds. testDir, globalSetup, outputDir and
// the server's cwd are re-resolved from the repo root because relative paths in a spread config resolve
// against this folder (the pattern of artifacts/canyon-works-traversal-1/playwright.boards.config.ts).
import path from 'node:path';
import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const baseURL = 'http://127.0.0.1:5326';

export default defineConfig({
  ...base,
  testDir: path.join(ROOT, 'e2e'),
  globalSetup: path.join(ROOT, 'scripts/external-server-guard.mjs'),
  outputDir: path.join(ROOT, 'test-results', 'wvc1-webserver'),
  use: { ...base.use, baseURL },
  webServer: {
    command: 'npm run dev -- --port 5326 --strictPort',
    cwd: ROOT,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
