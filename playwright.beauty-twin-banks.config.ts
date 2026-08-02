import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// Beauty shift scratch config (e1-twin-banks, 2026-08-02): six beauty shifts run in
// parallel worktrees, so this one owns port 5266 and collects ONLY its own spec — a
// shared 5188 dev server would cross-contaminate boards between shifts (Mistake #12,
// gate contamination). The spec itself is a normal tree spec and still runs under the
// default config; this config exists to render boards without fighting for the port.
export default defineConfig({
  ...baseConfig,
  testIgnore: [],
  // GR_BEAUTY_SPECS lets this same private server gate the adjacent suites the shift touches
  // (e1-twin-banks, terrain3d, tile-identity) without borrowing the shared 5188 dev server.
  testMatch: (process.env.GR_BEAUTY_SPECS ?? '**/beauty-twin-banks.spec.ts').split(','),
  timeout: 180_000,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5266' },
  // Drop the webkit project: its own testMatch pulls in 058-device-tiers, which needs the
  // release harness this config never starts (the same trap F-1296-3 named).
  projects: baseConfig.projects?.filter((project) => project.name !== 'desktop-webkit'),
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5266 --strictPort',
    url: 'http://127.0.0.1:5266',
    reuseExistingServer: false,
    timeout: 90_000,
  },
});
