import { defineConfig } from '@playwright/test';
import release from './release.config';
export default defineConfig({ ...release, testDir: import.meta.dirname, testMatch: /release-control\.spec\.ts/, grep: /first player reaches textured town actors/ });
