import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import baseConfig from '../../vite.config.ts';

export default defineConfig(async (env) => ({
  ...await baseConfig(env),
  root: fileURLToPath(new URL('../..', import.meta.url)),
  cacheDir: '/tmp/gold-rush-m2-palisade-vite-cache',
}));
