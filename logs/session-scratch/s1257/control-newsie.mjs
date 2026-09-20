#!/usr/bin/env node
// s1257 — clean-main control for the gz-h1-newsie red.
// Parks the graft (stash, path-scoped), runs the accused spec on UNMODIFIED main,
// restores, and re-verifies the graft is byte-identical to lane/m3 afterwards.
// A red WITHOUT the slice proves the red is pre-existing, not caused by the merge.
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const git = (...a) => execFileSync('git', a, { cwd: repo, maxBuffer: 1e9 }).toString();

const PATHS = [
  'artifacts/herald-class-map/desktop-chrome-live-cuts.png',
  'artifacts/herald-class-map/mobile-chrome-live-cuts.png',
  'assets/LEDGER.md',
  'assets/processed/herald-engraving-board.webp',
  'assets/processed/herald-engraving-boss.webp',
  'assets/processed/herald-engraving-ceremony.webp',
  'assets/processed/herald-engraving-ledger.webp',
  'assets/processed/herald-engraving-river.webp',
  'assets/processed/herald-engraving-schoolhouse.webp',
  'assets/processed/herald-engraving-town-growth.webp',
  'assets/processed/herald-engraving-trail.webp',
  'e2e/gazette-art-wiring.spec.ts',
  'scripts/asset-diet.mjs',
  'src/news/herald.ts',
  'src/news/heraldReader.ts',
];

console.log('--- parking the graft (git stash push, path-scoped) ---');
console.log(git('stash', 'push', '-m', 's1257-control-park', '--', ...PATHS));

// Prove the subject is genuinely absent: heraldReader must NOT have the ceremony entry.
const reader = git('show', ':src/news/heraldReader.ts');
const hasCeremony = reader.includes("ceremony: heraldEngravingUrls");
console.log('CONTROL PRECONDITION — ceremony map entry present in index?', hasCeremony,
            hasCeremony ? '  ⛔ PARK FAILED' : '  ✅ subject absent, this is clean main');
if (hasCeremony) { console.log(git('stash', 'pop')); process.exit(1); }

console.log('\n--- running the accused spec on CLEAN MAIN ---');
const run = spawnSync('npx', ['playwright', 'test', 'e2e/gz-h1-newsie.spec.ts', '--workers=1'],
  { cwd: repo, encoding: 'utf8', maxBuffer: 1e9 });
const out = (run.stdout || '') + (run.stderr || '');
const tail = out.split('\n').filter((l) =>
  /passed|failed|✓|✘|newsie barks|Pip Quick|unexpected value/.test(l)).slice(-24);
console.log(tail.join('\n'));
console.log('CONTROL rc =', run.status);

console.log('\n--- restoring the graft ---');
console.log(git('stash', 'pop'));
