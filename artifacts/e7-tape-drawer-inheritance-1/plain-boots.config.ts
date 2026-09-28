import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';
import path from 'node:path';

export default defineConfig({
  ...base,
  testDir: '.',
  testMatch: 'plain-boots.spec.ts',
  testIgnore: [],
  globalSetup: path.resolve('scripts/external-server-guard.mjs'),
  webServer: { ...base.webServer, cwd: process.cwd() },
  outputDir: './plain-boots-results',
});
