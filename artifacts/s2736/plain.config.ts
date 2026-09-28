import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';
import { fileURLToPath } from 'node:url';
export default defineConfig({ ...base, globalSetup:fileURLToPath(new URL('../../scripts/external-server-guard.mjs',import.meta.url)), testDir:'.',testMatch:'plain.spec.ts',use:{...base.use,trace:'off',video:'off'},outputDir:process.env.GR_AUDIO_RESULTS });
