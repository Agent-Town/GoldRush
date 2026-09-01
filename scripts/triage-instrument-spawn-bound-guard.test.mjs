/**
 * F-2433-1 — the TRIAGE INSTRUMENTS must bind their sync node spawns, and the
 * census must NAME the set they live in.
 *
 * WHY THIS GUARD EXISTS, and why F-2430-1's guard could not have caught it.
 *
 * F-2429-1 diagnosed the wedge: a SYNC spawn of a NODE child can hang forever,
 * because the child finishes its work, calls process.exit(), and deadlocks in
 * node's own platform teardown (DisposePlatform -> uv_thread_join). spawnSync
 * BLOCKS THE EVENT LOOP, so --test-timeout is a timer that can never fire and
 * the run has no upper bound at all.
 *
 * F-2430-1 then bound 83 sites, and s2432 bound the remaining 19, reaching
 * "0 exposed inside mandated legs". Both sweeps sized the work with ONE key:
 * `legs.all.has(row.file)` -- is this file a leg of a mandated battery?
 *
 * That key cannot express the population that matters to a FIRE. The law tells
 * a fire to run instruments BY HAND at triage (§2F dry-board-probe, §LB-01
 * ledger-backup-pull), and a tool you run by hand is outside every battery BY
 * CONSTRUCTION. spawn-bound-census.mjs:190 even filters run-node-guards.mjs out
 * of the leg set explicitly. So the triage instruments were not missed through
 * carelessness -- they were UNREACHABLE to the selector, at any effort.
 *
 * Measured s2433: dry-board-probe.mjs made 46 unbounded sync node spawns PER RUN
 * (one per subject, of drain-block-check.mjs, which carries 15 process.exit()
 * calls) -- more node children per run than most battery legs make, on every
 * fire, in §2F's first prescribed command.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: this is NOT a false green. A hang
 * is LOUD -- it simply never finishes. Realised cost is ZERO; no dry-board-probe
 * wedge has been observed. What earns it a guard is the DIRECTION and the SITE:
 * the wedge lands in the instrument a fire runs to decide whether the board is
 * dry, and in the gate standing between a plaintext account row and a ONE-WAY
 * commit (F-2353-2).
 *
 * THE ANTI-VACUITY ARMS ARE THE LOAD-BEARING ONES. "This file has 0 exposed
 * sites" is ALSO what a file that left the corpus reports -- renamed, unparsed,
 * or with its spawn deleted. Arms 2 and 4 therefore assert the subject is STILL
 * A SUBJECT before its clean bill is believed. A corpus can be selected small as
 * easily as narrowed to empty.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { census, batteryLegs, isExposed } from './spawn-bound-census.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/**
 * The instruments the LAW tells a fire to run by hand. Deliberately a short,
 * explicit list rather than a derivation: "is this prescribed at triage?" is a
 * fact about scripts/fire.md's prose, not about the code, and a content sniff
 * would select the guard itself (F-2363-1's self-spawn tautology).
 */
const TRIAGE_INSTRUMENTS = [
  ['dry-board-probe.mjs', '§2F — the first command of every dry-board declaration'],
  ['ledger-backup-pull.mjs', '§LB-01 — the daily mirror pull and its exposure gate'],
];

/** A bound must be GENEROUS. Curing a hang by shrinking the bound until honest
 *  work reds is F-1410-2 in the opposite costume. F-2430-1 measured 240_000
 *  against a slowest-lawful observation of 69.6 s; this floor is half of that,
 *  so a deliberate re-tune stays legal and a panic edit does not. */
const MIN_BOUND_MS = 120_000;

const rows = census().rows;
const legs = batteryLegs(ROOT);
const exposed = rows.filter(isExposed);

for (const [file, why] of TRIAGE_INSTRUMENTS) {
  // ---- ANTI-VACUITY FIRST: is the subject still a subject? --------------
  test(`${file} is still a live census subject (anti-vacuity for its clean bill)`, () => {
    const mine = rows.filter((r) => r.file === file);
    assert.ok(mine.length > 0,
      `${file} contributes NO spawn rows to the census. Its "0 exposed" below would then be ` +
      `green because the file left the corpus, not because it is bound. Check the filename, ` +
      `the SPAWNERS list, and the unparsed count.`);
    const syncNode = mine.filter((r) => r.sync && (r.kind === 'node' || r.kind === 'node-via-shell'));
    assert.ok(syncNode.length > 0,
      `${file} has spawn rows but none is a SYNC NODE child, so isExposed can never select it ` +
      `and its clean bill asserts nothing about F-2429-1's mechanism.`);
  });

  // ---- THE CURE --------------------------------------------------------
  test(`${file} has no unbounded sync node spawn (${why})`, () => {
    const bad = exposed.filter((r) => r.file === file);
    assert.deepEqual(bad.map((r) => r.line), [],
      `${file} carries ${bad.length} unbounded SYNC node spawn(s) at line(s) ` +
      `${bad.map((r) => r.line).join(',')}. This is a triage instrument: a wedge here hangs a ` +
      `fire with no bound and no diagnostic (F-2429-1). Add { timeout, killSignal: 'SIGKILL' }.`);
  });

  // ---- THE BOUND MUST BE GENEROUS, AND ON THE RIGHT SPAWN ---------------
  //
  // SCOPED TO THE NODE-CHILD SYNC SPAWNS, and that scoping is a MEASUREMENT, not
  // fastidiousness. My first draft took the min over EVERY `timeout:` in the file
  // and reddened on dry-board-probe.mjs:186 -- `timeout: 10000` on corpusTree's
  // GIT child (F-2222-1). A git child cannot deadlock this way at all, and 10 s is
  // a lawful bound for `git rev-parse`, so the arm accused a correct line and its
  // own remedy text told me to raise it. A guard whose remedy corrupts a good file
  // is worse than no guard. Scoping also makes the arm STRONGER: it now proves the
  // bound sits on the spawn that needs it, not merely somewhere in the file.
  test(`${file} node-child bounds are generous (>= ${MIN_BOUND_MS} ms) — no panic-shrinking`, () => {
    const src = readFileSync(path.join(ROOT, 'scripts', file), 'utf8');
    const lines = src.split('\n');
    const sites = rows.filter((r) => r.file === file && r.sync
      && (r.kind === 'node' || r.kind === 'node-via-shell'));
    assert.ok(sites.length > 0, `no sync node spawn sites in ${file} to check.`);
    for (const r of sites) {
      // The options bag follows the call token within a few lines.
      const window = lines.slice(r.line - 1, r.line + 7).join('\n');
      const found = [...window.matchAll(/timeout:\s*([\d_]+)/g)].map((m) => Number(m[1].replace(/_/g, '')));
      assert.ok(found.length > 0,
        `${file}:${r.line} is a sync node spawn with no numeric timeout in its options bag.`);
      const min = Math.min(...found);
      assert.ok(min >= MIN_BOUND_MS,
        `${file}:${r.line} is bounded at ${min} ms, under the ${MIN_BOUND_MS} ms floor. A bound ` +
        `below the slowest lawful runtime reds honest work and gets excused away (F-1460-1).`);
    }
  });
}

// ---- THE STRUCTURAL HALF: the census must NAME what it counts ------------
test('spawn-bound-census --list names the OUTSIDE set, not only the in-battery set', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'spawn-bound-census.mjs'), '--list'],
    { cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
  assert.equal(r.status, 0, `census --list exited ${r.status}: ${r.stderr}`);
  const out = r.stdout ?? '';
  // F-2215-1: assert the control PRODUCED something before reading it.
  assert.ok(out.length > 0, 'census --list produced empty stdout — the arm did not run.');

  assert.match(out, /EXPOSED sites inside a mandated battery leg:/,
    'the in-battery listing F-2430-1 built has gone — regression control.');
  assert.match(out, /EXPOSED sites OUTSIDE any mandated battery leg:/,
    'census --list counts an outside set it never names: a detector whose finding no tool can act on.');

  // F-2217-1: a section header over nothing is not a listing. If the outside set
  // is non-empty, the report must actually name a member.
  const outside = exposed.filter((x) => !legs.all.has(x.file));
  if (outside.length > 0) {
    const tail = out.slice(out.indexOf('EXPOSED sites OUTSIDE'));
    for (const f of new Set(outside.map((x) => x.file))) {
      assert.ok(tail.includes(f),
        `outside member ${f} is counted but not named under the OUTSIDE header.`);
    }
  }
});

test('the outside set is reported honestly — count and listing agree', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'spawn-bound-census.mjs'), '--list'],
    { cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
  const out = r.stdout ?? '';
  assert.ok(out.length > 0, 'census --list produced empty stdout — the arm did not run.');
  const m = out.match(/outside any mandated battery\s*:\s*(\d+)/);
  assert.ok(m, 'census no longer reports an outside count.');
  const claimed = Number(m[1]);
  const actual = exposed.filter((x) => !legs.all.has(x.file)).length;
  assert.equal(claimed, actual,
    `census claims ${claimed} outside-battery exposed sites but the module reports ${actual}.`);
});
