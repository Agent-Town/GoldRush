import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

// F-BEAUTY-2 (beauty2/pools) capture + gate config. Its own vite on 5261 (Mistake #12: never gate
// on a port another worktree's live task owns — 5261 was probed free at session start and belongs
// to this solo-writer shift). reuseExistingServer is true because the shift keeps one nohup'd dev
// server alive across many probe runs; it is started from THIS worktree, so reuse cannot serve a
// different tree's code.
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5261' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5261 --strictPort',
    url: 'http://127.0.0.1:5261',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
