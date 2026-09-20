#!/usr/bin/env node
// s1257 — graft the 15 lane-touched paths of dd08bc1a (lane/m3) onto clean main.
// Zero MAIN-MOVED files were found (git log 7307d588..main over these paths = empty),
// so a path-scoped checkout is exact. Verifies the applied delta is byte-identical
// to the branch's own tree for every path.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const git = (...a) => execFileSync('git', a, { cwd: repo, maxBuffer: 1e9 });

const BRANCH = 'lane/m3';
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

// Guard: the runner commit must touch exactly these paths and no others.
const actual = git('show', '--pretty=format:', '--name-only', 'dd08bc1a')
  .toString().split('\n').map((s) => s.trim()).filter(Boolean).sort();
const expected = [...PATHS].sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error('ABORT — runner commit path set does not match the graft list');
  console.error('  only in commit:', actual.filter((p) => !expected.includes(p)));
  console.error('  only in list  :', expected.filter((p) => !actual.includes(p)));
  process.exit(1);
}

git('checkout', BRANCH, '--', ...PATHS);

const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16);
let bad = 0;
for (const p of PATHS) {
  const want = git('show', `${BRANCH}:${p}`);
  const gotPath = resolve(repo, p);
  if (!existsSync(gotPath)) { console.error('MISSING', p); bad++; continue; }
  const got = readFileSync(gotPath);
  const ok = want.length === got.length && sha(want) === sha(got);
  if (!ok) bad++;
  console.log(ok ? 'OK  ' : 'DIFF', String(got.length).padStart(8), sha(got), p);
}
console.log(bad === 0 ? '\nGRAFT BYTE-IDENTICAL to ' + BRANCH + ' for all ' + PATHS.length + ' paths'
                      : '\n' + bad + ' MISMATCHES');
process.exit(bad === 0 ? 0 : 1);
