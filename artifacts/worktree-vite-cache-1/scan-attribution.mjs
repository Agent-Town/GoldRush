// scan-attribution.mjs (worktree-vite-cache-1): which entry makes vite's dependency scan fail?
// For each entry set it boots a middleware-mode vite server on THIS checkout's vite.config.ts with a
// PRIVATE scratch cacheDir (so the shared `node_modules/.vite` is never touched), overrides only
// `optimizeDeps.entries`, and waits for the scan's verdict: the "(!) Failed to run dependency scan"
// error (with its first rolldown error line) or a `deps/_metadata.json` listing optimized deps.
//   node scan-attribution.mjs <root> <scratchDir> <label>=<entry,entry,...> [<label>=...]
// An entry set of `*` means vite's default (no `entries`: the `**/*.html` glob from the root).
import fs from 'node:fs';
import path from 'node:path';
import { createLogger, createServer } from 'vite';

const [root, scratch, ...sets] = process.argv.slice(2);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const set of sets) {
  const [label, list] = set.split('=');
  const entries = list === '*' ? undefined : list.split(',');
  const cacheDir = path.join(scratch, `cache-${label}`);
  const logger = createLogger('info');
  const captured = [];
  for (const level of ['info', 'warn', 'error']) {
    const original = logger[level].bind(logger);
    logger[level] = (message, options) => { captured.push(`${level}: ${String(message)}`); original(message, options); };
  }
  const started = Date.now();
  const server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    cacheDir,
    optimizeDeps: entries ? { entries } : {},
    appType: 'custom',
    customLogger: logger,
    server: { middlewareMode: true, watch: null, hmr: false },
  });
  let verdict = 'timeout (90 s)';
  while (Date.now() - started < 90_000) {
    const failure = captured.find((line) => line.includes('Failed to run dependency scan'));
    if (failure) {
      const reason = failure.split('\n').find((line) => /\[[A-Z_]+\]/.test(line)) ?? failure.split('\n')[0];
      verdict = `SCAN FAILED: ${reason.replace(/\u001b\[[0-9;]*m/g, '').trim()}`;
      break;
    }
    try {
      const metadata = JSON.parse(fs.readFileSync(path.join(cacheDir, 'deps', '_metadata.json'), 'utf8'));
      const optimized = Object.keys(metadata.optimized ?? {});
      if (optimized.length) { verdict = `scan ok: ${optimized.length} deps pre-bundled (${optimized.slice(0, 6).join(', ')}${optimized.length > 6 ? ', ...' : ''})`; break; }
    } catch { /* not yet written */ }
    await sleep(250);
  }
  await server.close();
  console.log(`${label} [${entries ? entries.join(', ') : 'default **/*.html glob'}] -> ${verdict} in ${Date.now() - started} ms`);
}
