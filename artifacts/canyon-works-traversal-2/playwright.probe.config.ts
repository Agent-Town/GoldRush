// canyon-works-traversal-2: the default config, pointed at this folder's probes only (the canyon-works-traversal-1 pattern).
// The globalSetup (the external-server guard) is re-resolved from the repo root because a relative path in a spread config
// would resolve against this folder. desktop-webkit is not a probe viewport.
import path from 'node:path';
import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

export default defineConfig({
  ...base,
  testDir: path.join(import.meta.dirname, 'probes'),
  testMatch: ['**/*.probe.ts'],
  testIgnore: [],
  globalSetup: path.join(ROOT, 'scripts/external-server-guard.mjs'),
  projects: (base.projects ?? []).filter((project) => project.name === 'desktop-chrome' || project.name === 'mobile-chrome'),
});
