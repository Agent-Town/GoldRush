#!/usr/bin/env node
/**
 * symlink-run-table.mjs: the twenty-three tools of F-SF1-2, each run by its real path and by a file
 * symlink in a scratch dir, side by side, plus a `node -e` import probe (is-main-2, 2026-09-26).
 * Evidence, not a gate. Modelled on artifacts/small-fixes-1/symlink-run-table.mjs.
 *
 * usage: node artifacts/is-main-2/symlink-run-table.mjs <tree-root> <label> [--only a,b]
 *
 * Per tool: rc and output bytes (stdout+stderr) by the real path and by the symlink; verdict SAME
 * (identical rc and identical output), SILENT (the symlinked run exited 0 having printed nothing,
 * the F-SF1-2 defect, while the real-path run printed), or DIFFERENT (both printed, not identical).
 * Then the import probe: `node --input-type=module -e "await import(<url>)"` has no argv[1];
 * IMPORTS (rc 0, only the probe's own line printed) or THROWS (rc not 0).
 *
 * EVERY INVOCATION IS LOCAL AND WRITES NOTHING, each chosen by reading the tool first (the report
 * lists why). No network: ticker-stats runs only --help (without --url it derives the LIVE endpoint
 * and fetches it); second-rider runs with no claim word, so parseArgs refuses before any browser
 * (its default URL is the live Pages site); stream-director runs --showcase --dry-run, whose OBS
 * connection and showcase are stubs; serve.mjs runs with LEDGER_DB_PATH unset, so main() throws its
 * first check before vite loads or any port opens.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const TOOLS = [
  ['server/ledger/serve.mjs', [], { unset: ['LEDGER_DB_PATH'] }],
  ['scripts/ruling-propagation-guard.mjs', []],
  ['scripts/assay-replay-agent.mjs', []],
  ['scripts/blocker-panel-closed-guard.mjs', []],
  ['scripts/desk-state-audit.mjs', []],
  ['scripts/e4-motor-ride.mjs', []],
  ['scripts/e7-playbook-digest.mjs', ['no-such-contract'], { timeout: 900_000 }],
  ['scripts/evidence-budget.mjs', []],
  ['scripts/evidence-readers.mjs', []],
  ['scripts/evidence-offload.mjs', []],
  ['scripts/findings-state-guard.mjs', []],
  ['scripts/gate-battery.mjs', []],
  ['scripts/frontier-registry.mjs', []],
  ['scripts/gazette-backfill-sweep.mjs', []],
  ['scripts/review-evidence-audit.mjs', []],
  ['scripts/spawn-bound-census.mjs', []],
  ['scripts/row-quote-currency.mjs', []],
  ['scripts/stream-showcase.mjs', []],
  ['scripts/terrain-contract-scope.mjs', ['--no-such-flag']],
  ['scripts/second-rider.mjs', []],
  ['scripts/stream-director.mjs', ['--showcase', '--dry-run']],
  ['scripts/ticker-stats.mjs', ['--help']],
  ['scripts/withheld-evidence-audit.mjs', []],
];

const args = process.argv.slice(2);
const onlyAt = args.indexOf('--only');
const only = onlyAt === -1 ? null : new Set(args[onlyAt + 1].split(',').filter(Boolean));
// --extra a.mjs,b.mjs: more repo-relative tools, run with no arguments (read-only ones only; used
// for the owed files of F-IM2-1, which this task does not change).
const extraAt = args.indexOf('--extra');
if (extraAt !== -1) {
  for (const rel of args[extraAt + 1].split(',').filter(Boolean)) TOOLS.push([rel, []]);
}
const flagged = new Set(['--only', '--extra']);
const [rootArg, label = 'run'] = args.filter((a, i) => !flagged.has(a) && !flagged.has(args[i - 1]));
const ROOT = realpathSync(resolve(rootArg ?? '.'));
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'im2-symlink-table-')));
const links = [];

function envFor(opts = {}) {
  const env = { ...process.env };
  for (const name of opts.unset ?? []) delete env[name];
  return env;
}

function run(argv, cwd, opts = {}) {
  const r = spawnSync(process.execPath, argv, {
    cwd, env: envFor(opts), encoding: 'utf8', timeout: opts.timeout ?? 300_000, killSignal: 'SIGKILL', maxBuffer: 64 << 20,
  });
  return { rc: r.status ?? `signal ${r.signal}`, out: `${r.stdout ?? ''}${r.stderr ?? ''}`, ms: 0 };
}

console.log(`symlink-run-table (${label}): ${ROOT}`);
console.log(`node ${process.version}; 1-min load at start ${(await import('node:os')).loadavg()[0].toFixed(1)}`);
console.log('tool | real: rc, bytes | symlinked: rc, bytes | verdict | node -e import: rc | import verdict');
try {
  for (const [rel, toolArgs, opts = {}] of TOOLS) {
    if (only && !only.has(rel) && !only.has(basename(rel))) continue;
    const real = join(ROOT, rel);
    const link = join(scratch, basename(rel).replace(/\.mjs$/, '.link.mjs'));
    symlinkSync(real, link);
    links.push(link);
    const t0 = Date.now();
    const a = run([real, ...toolArgs], ROOT, opts);
    const b = run([link, ...toolArgs], ROOT, opts);
    const verdict = a.rc === b.rc && a.out === b.out ? 'SAME' : b.rc === 0 && b.out.length === 0 && a.out.length > 0 ? 'SILENT' : 'DIFFERENT';
    const url = pathToFileURL(real).href;
    const probe = run(['--input-type=module', '-e', `const m = await import(${JSON.stringify(url)}); console.log('exports:' + Object.keys(m).length);`], scratch, opts);
    const importVerdict = probe.rc === 0 && /^exports:\d+\n$/.test(probe.out) ? 'IMPORTS' : probe.rc === 0 ? `IMPORTS+OUTPUT(${probe.out.length} B)` : `THROWS (${(probe.out.match(/ERR_[A-Z_]+/) ?? ['?'])[0]})`;
    console.log(`${rel} | ${a.rc}, ${a.out.length} B | ${b.rc}, ${b.out.length} B | ${verdict} | ${probe.rc} | ${importVerdict} | ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
} finally {
  for (const link of links) {
    try { unlinkSync(link); } catch { /* gone */ }
  }
  rmSync(scratch, { recursive: true, force: true });
}
console.log(`1-min load at end ${(await import('node:os')).loadavg()[0].toFixed(1)}`);
