import { defineConfig } from '@playwright/test';
import path from 'node:path';
import base from './playwright.preview.config';

export default defineConfig({
  ...base,
  outputDir: path.join(import.meta.dirname, 'test-results/desktop-budget'),
  reporter: [['list'], ['json', { outputFile: path.join(import.meta.dirname, 'desktop-budget-results.json') }]],
  use: { ...base.use, trace: 'off' },
});
