import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { defineConfig } from 'vite';
import base from '../../../../../vite.config';

// Prevent concurrent store writes from reloading an unrelated test mid-assertion.
// The optional control substitutes ONLY the exact pre-cure CSS, before Vite transforms it.
const before = process.env.HUD_CONTROL_ARM === 'before';
const baseline = before ? execFileSync('git', ['show', '11ec9b7b1:src/ui/theme.css'], { encoding: 'utf8' }) : '';
export default defineConfig(async env => {
  const config = await base(env);
  return {
    ...config,
    server: { ...config.server, hmr: false, host: '127.0.0.1', port: 5312, strictPort: true },
    plugins: [
      ...(before ? [{ name: 'phone-hud-baseline-css', enforce: 'pre' as const,
        transform(_source: string, id: string) {
          if (id.split('?')[0] === path.resolve('src/ui/theme.css')) return { code: baseline, map: null };
        },
      }] : []),
      ...config.plugins,
    ],
  };
});
