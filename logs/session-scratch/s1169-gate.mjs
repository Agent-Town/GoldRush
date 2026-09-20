// s1169 drain gate runner — the bash tool's static analyser rejects the
// `ENV=1 npx playwright test --config … --workers=1` form, so we spawn it directly.
// Usage: node logs/session-scratch/s1169-gate.mjs <mode>
//   bundle   — the migrated consumer: must RUN and assert (gate 4b)
//   external — the old overloaded path: must now SKIP (gate 4a)
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
const base = ['playwright', 'test', '--config', 'playwright.preview.config.ts', 'e2e/asset-diet.spec.ts', '--workers=1'];
const env = { ...process.env };

if (mode === 'bundle') {
  env.GR_ASSET_DIET_BUNDLE = '1';
} else if (mode === 'external') {
  // Exactly the pre-cure invocation: the server-duty flag alone must no longer un-skip the suite.
  env.GR_CAPTURE_EXTERNAL_SERVER = '1';
  delete env.GR_ASSET_DIET_BUNDLE;
} else {
  console.error('usage: s1169-gate.mjs bundle|external');
  process.exit(2);
}

const r = spawnSync('npx', base, { env, stdio: 'inherit', cwd: process.cwd() });
console.log(`\n[s1169-gate] mode=${mode} exit=${r.status}`);
process.exit(r.status ?? 1);
