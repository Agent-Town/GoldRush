// canyon-works-traversal-1: the default config, pointed at this folder's boards rig only. The
// globalSetup (the external-server guard) is re-resolved from the repo root because a relative path
// in a spread config would resolve against this folder. desktop-webkit is not a board viewport.
import path from 'node:path';
import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

export default defineConfig({
  ...base,
  testDir: import.meta.dirname,
  testMatch: ['boards.rig.ts'],
  testIgnore: [],
  globalSetup: path.join(ROOT, 'scripts/external-server-guard.mjs'),
  outputDir: path.join(ROOT, 'test-results', 'cw1-boards'),
  projects: (base.projects ?? []).filter((project) => project.name === 'desktop-chrome' || project.name === 'mobile-chrome'),
});
