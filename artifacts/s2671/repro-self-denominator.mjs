#!/usr/bin/env node
/**
 * s2671 — MANUFACTURE the defect F-2668-2's gate names, before curing it.
 *
 * Claim under test (inherited from s2670's handoff, therefore a CLAIM):
 *   "ledger-mirror-freshness.mjs draws its denominator from the corpus it
 *    audits, so it would say WHOLE AND CURRENT over one surviving file."
 *
 * Method: the guard test's own fixture trick — RELOCATE the subject into a
 * scratch tree so its `../artifacts/ledger-backups/` resolves inside the
 * fixture, then delete history from underneath it and read the verdict.
 *
 * Run: node artifacts/s2671/repro-self-denominator.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('../../scripts/ledger-mirror-freshness.mjs', import.meta.url));

const pad = (n) => String(n).padStart(2, '0');
const isoBack = (n) => {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function run(days, label, anchorIso = null) {
  const root = mkdtempSync(path.join(tmpdir(), 's2671-repro-'));
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  copyFileSync(SUBJECT, path.join(root, 'scripts', 'ledger-mirror-freshness.mjs'));
  const dir = path.join(root, 'artifacts', 'ledger-backups');
  mkdirSync(dir, { recursive: true });
  for (const iso of days) writeFileSync(path.join(dir, `ledger-${iso}.db`), 'x');
  if (anchorIso) {
    mkdirSync(path.join(root, 'ops'), { recursive: true });
    writeFileSync(
      path.join(root, 'ops', 'ledger-series-anchor.json'),
      JSON.stringify({ firstCoverageDay: anchorIso }, null, 2),
    );
  }
  const r = spawnSync('node', [path.join(root, 'scripts', 'ledger-mirror-freshness.mjs'), '--strict'], {
    encoding: 'utf8',
    timeout: 120_000,
  });
  console.log(`\n=== ${label} — ${days.length} file(s) on disk ===`);
  console.log((r.stdout ?? '').replace(new RegExp(root, 'g'), '<FIXTURE>'));
  console.log(`  rc(--strict) = ${r.status}`);
  return { out: r.stdout ?? '', rc: r.status };
}

// The CONTROL: the series as it really stands today, 32 whole days.
const whole = Array.from({ length: 32 }, (_, i) => isoBack(31 - i));
const ANCHOR = isoBack(31);

// ---- WITHOUT an anchor: the pre-s2671 behaviour, kept as the demonstration.
run(whole, 'NO ANCHOR / CONTROL: whole 32-day series');
run([isoBack(0)], 'NO ANCHOR / MANUFACTURED: 31 days deleted, newest survives');
run([isoBack(6), isoBack(5), isoBack(4), isoBack(3), isoBack(2), isoBack(1), isoBack(0)],
  'NO ANCHOR / MANUFACTURED: 25 days deleted, last week survives');

// ---- WITH the anchor: the same three corpora, measured against a denominator
// the corpus cannot edit. Arm 1 must still be a clean green (no false alarm),
// arms 2 and 3 must NAME the lost days and refuse under --strict.
run(whole, 'ANCHORED / CONTROL: whole 32-day series', ANCHOR);
run([isoBack(0)], 'ANCHORED / MANUFACTURED: 31 days deleted, newest survives', ANCHOR);
run([isoBack(6), isoBack(5), isoBack(4), isoBack(3), isoBack(2), isoBack(1), isoBack(0)],
  'ANCHORED / MANUFACTURED: 25 days deleted, last week survives', ANCHOR);

// ---- The interior hole the tool was BUILT for must still be found (no regression).
run(whole.filter((iso) => iso !== isoBack(5)), 'ANCHORED / REGRESSION: one interior day missing', ANCHOR);
