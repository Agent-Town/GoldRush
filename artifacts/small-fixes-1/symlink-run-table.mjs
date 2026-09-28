#!/usr/bin/env node
/**
 * symlink-run-table.mjs: the read-only ones of the thirteen F-LS1-2 scripts, each run by its real
 * path and by a file symlink in a scratch dir, side by side (small-fixes-1, 2026-09-25). Evidence,
 * not a gate.
 *
 * usage: node artifacts/small-fixes-1/symlink-run-table.mjs <scripts-dir> <label> [--scripts a.mjs,b.mjs]
 * (--scripts replaces the default list, e.g. to measure the OTHER main-module spellings of F-SF1-2)
 * Per script: rc and output bytes (stdout+stderr) by the real path and by the symlink; verdict SAME
 * (identical rc and identical output) or SILENT (the symlinked run exited 0 having printed nothing,
 * the F-LS1-2 defect) or DIFFERENT.
 * Skipped by design: phone-hud-entry-census (launches a browser and writes evidence), stream-curate
 * (writes assets/stream/loop-manifest.json), test-accounts (starts servers; it IS a functions gate,
 * run by its real path as `npm run test:accounts`).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [dirArg, label = 'run'] = process.argv.slice(2).filter((arg, i, all) => arg !== '--scripts' && all[i - 1] !== '--scripts');
const listAt = process.argv.indexOf('--scripts');
const SCRIPTS = resolve(dirArg ?? 'scripts');
const DEFAULT_RUNNABLE = [
  'authorable-candidates.mjs',
  'claimed-spec-harness-guard.mjs',
  'desk-birth-guard.mjs',
  'desk-carryforward-guard.mjs',
  'desk-declaration-guard.mjs',
  'dry-board-probe.mjs',
  'ghost-ladder-row-guard.mjs',
  'master-shipped-classifier.mjs',
  'source-pointer-guard.mjs',
  'stale-ready-for-gates-guard.mjs',
];
const RUNNABLE = listAt === -1 ? DEFAULT_RUNNABLE : process.argv[listAt + 1].split(',').filter(Boolean);
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'sf1-symlink-table-')));
const links = [];
const run = (file) => {
  const r = spawnSync(process.execPath, [file], { cwd: resolve(SCRIPTS, '..'), encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL', maxBuffer: 64 << 20 });
  return { rc: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};
console.log(`symlink-run-table (${label}): ${SCRIPTS}`);
console.log('script | real: rc, bytes | symlinked: rc, bytes | verdict');
try {
  for (const name of RUNNABLE) {
    const real = join(SCRIPTS, name);
    const link = join(scratch, name.replace(/\.mjs$/, '.link.mjs'));
    symlinkSync(real, link);
    links.push(link);
    const a = run(real);
    const b = run(link);
    const verdict = a.rc === b.rc && a.out === b.out ? 'SAME' : b.rc === 0 && b.out.length === 0 ? 'SILENT' : 'DIFFERENT';
    console.log(`${name} | ${a.rc}, ${a.out.length} B | ${b.rc}, ${b.out.length} B | ${verdict}`);
  }
} finally {
  for (const link of links) {
    try { unlinkSync(link); } catch { /* gone */ }
  }
  rmSync(scratch, { recursive: true, force: true });
}
