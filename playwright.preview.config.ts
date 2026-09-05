import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

// F-DEPLOY-1 (2026-09-05): the port is overridable so the deploy's budget probe can run on its
// own scratch port while a lane's playwright holds 5189 — a fixed port turned a production deploy
// into a fail-closed ABORT on the wrong cause.
const previewPort = process.env.GR_PREVIEW_PORT ?? '5189';
const previewCommand = process.env.GR_ASSET_DIET_REUSE_BUILD === '1'
  ? `npx vite preview --host 127.0.0.1 --port ${previewPort}`
  : `npm run build && npx vite preview --host 127.0.0.1 --port ${previewPort}`;

// Same suite, but against the production bundle (catches base-path/asset bugs).
export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: `http://127.0.0.1:${previewPort}` },
  webServer: {
    command: previewCommand,
    url: `http://127.0.0.1:${previewPort}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
