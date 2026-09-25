// canyon-works-traversal-1: the repo's vite config, unchanged, with a private dependency-optimizer
// cache. node_modules in a scratch worktree is a symlink to the primary checkout's, so every worktree's
// dev server shares node_modules/.vite; a neighbour's re-optimisation answered this task's first desktop
// acceptance boot with "504 (Outdated Optimize Dep)" and Game.ts never loaded. The cache directory is
// supplied by the caller (CW1_VITE_CACHE_DIR, a scratch path) and is required.
import { defineConfig, type UserConfig } from 'vite';
import baseConfig from '../../vite.config';

export default defineConfig(async (env) => {
  const cacheDir = process.env.CW1_VITE_CACHE_DIR;
  if (!cacheDir) throw new Error('CW1_VITE_CACHE_DIR must name a private scratch cache directory');
  const resolved = (typeof baseConfig === 'function' ? await baseConfig(env) : await baseConfig) as UserConfig;
  return { ...resolved, cacheDir };
});
