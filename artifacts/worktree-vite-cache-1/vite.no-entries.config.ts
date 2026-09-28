// worktree-vite-cache-1, the control arm for scope item 2 ("does the scan need more than cacheDir?"): the
// cured vite.config.ts with ONLY `optimizeDeps.entries` taken away, so a cold boot shows what the per-checkout
// cache alone gives: vite's default `**/*.html` scan, which follows `assets/pilots` into the art store's
// `hero-3d/compare.html` and dies on [TSCONFIG_ERROR]. Used only by boot-probe.mjs `--config`, never by a gate.
import { defineConfig, type UserConfig } from 'vite';
import baseConfig from '../../vite.config';

export default defineConfig(async (env) => {
  const resolved = (typeof baseConfig === 'function' ? await baseConfig(env) : await baseConfig) as UserConfig;
  return { ...resolved, optimizeDeps: { ...resolved.optimizeDeps, entries: undefined } };
});
