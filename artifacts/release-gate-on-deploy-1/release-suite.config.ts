// THE RELEASE SUITE, MEASURABLE ON A TREE WHOSE `build:release` IS RED.
//
// `playwright.release.config.ts` starts its server with
// `GR_RELEASE=e1 npm run build:release && npx vite preview --port 5190`, so while the strict
// assertion exits 1 the `&&` never reaches the preview, the webServer dies early, and every one of
// the 30 rows fails as an instrument failure rather than a measurement. That is exactly the tree
// this task was written for (F-SEF2-2), and it is why the 26/30 in the master could only have been
// measured against a server started separately.
//
// So this config changes ONE thing and nothing else: the server is a plain `vite preview` over a
// dist/ the caller built beforehand with `GR_RELEASE=e1 npm run build` (identical to
// `build:release` minus the assertion). Same spec, same two projects, same assertions, same port
// 5190 the owning config declares, same `process.cwd()` so the suite's own dist assertion reads
// the dist the caller built. Astra measured the pre-task 26/30 the same way
// (artifacts/sol/map-art-campaign-2/run-10/entry-framing/release.config.ts, on its own port).
//
// Usage, from the root of the tree being measured (the drain lock owns the port and the vite
// dependency cache, so the server must live and die inside one locked command):
//   GR_RELEASE=e1 npm run build
//   npx vite preview --host 127.0.0.1 --port 5190 --strictPort &
//   npx playwright test -c artifacts/release-gate-on-deploy-1/release-suite.config.ts --workers=1
//
// This is an instrument, not a gate: nothing in the repo runs it, `npm run test:release` keeps
// using the owning config, and no assertion or fixture was weakened to produce a number.
import release from '../../playwright.release.config';
import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  ...release,
  // Playwright resolves a relative `testDir` against the CONFIG file's directory, so the base
  // config's './e2e' would become artifacts/release-gate-on-deploy-1/e2e and collect zero tests
  // (`playwright.release.config.ts:6-9` records the same class of vacuous pass). Anchor it to the
  // tree the caller is standing in, which is also the tree whose dist/ is being served.
  testDir: resolve('e2e'),
  // Same trap, second surface, and it is a hard error rather than a silent zero: the inherited
  // './scripts/external-server-guard.mjs' resolves against this directory and playwright exits
  // MODULE_NOT_FOUND before collecting anything (measured 2026-09-24). Kept rather than dropped:
  // it is inert unless GR_CAPTURE_EXTERNAL_SERVER=1, and this harness deliberately serves a
  // production build, which is the one thing that guard refuses.
  globalSetup: resolve('scripts/external-server-guard.mjs'),
  webServer: undefined,
});
