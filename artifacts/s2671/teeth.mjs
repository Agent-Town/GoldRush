#!/usr/bin/env node
/**
 * s2671 — TEETH for the new arms of ledger-mirror-freshness-guard.test.mjs.
 *
 * A passing guard never executes its own violation path, so a green is not
 * evidence about a red. This re-manufactures each defect the s2671 arms claim
 * to catch, on a SCRATCH COPY of the subject, and records which arm dissents.
 * The CONTROL run (no mutation) must be all-green, or the harness is measuring
 * its own scaffolding rather than the cure.
 *
 * Run: node artifacts/s2671/teeth.mjs
 */
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const SUBJECT = path.join(REPO, 'scripts', 'ledger-mirror-freshness.mjs');
const TEST = path.join(REPO, 'scripts', 'ledger-mirror-freshness-guard.test.mjs');
const ANCHOR = path.join(REPO, 'ops', 'ledger-series-anchor.json');

const MUTATIONS = [
  {
    name: 'CONTROL (no mutation)',
    expect: 'all arms green',
    apply: (s) => s,
  },
  {
    name: 'A. the ORIGINAL defect: left edge taken from the corpus again',
    expect: '16',
    apply: (s) =>
      s.replace(
        'const windowStart = anchored ? Math.min(anchor.day, first) : first;',
        'const windowStart = first;',
      ),
  },
  {
    name: 'B. the cure degrades SILENTLY to the defect when the anchor is missing',
    // 18 as well as 17, and the first run of this file predicted only 17: removing
    // the anchorState gate from exitCodeFor takes the "could not answer" code away
    // from the MALFORMED arm too, since both reach the same test. The prediction
    // was narrower than the mutation; the arms are right. Recorded rather than
    // quietly widened — the expectation was wrong, not the guard.
    expect: '17, 18',
    apply: (s) =>
      s
        .replace("  if (report.anchorState !== 'read') return 2;", '')
        .replace('  if (!anchored) {', '  if (false) {')
        .replace(
          'if (anchored && report.missing.length === 0 && report.ageDays <= 1) {',
          'if (report.missing.length === 0 && report.ageDays <= 1) {',
        ),
  },
  {
    name: 'C. the anchor is resolved against process.cwd() instead of the subject',
    expect: '9',
    apply: (s) =>
      s.replace(
        "const ANCHOR_FILE = fileURLToPath(new URL('../ops/ledger-series-anchor.json', import.meta.url));",
        "const ANCHOR_FILE = process.cwd() + '/ops/ledger-series-anchor.json';",
      ),
  },
  {
    name: 'D. a malformed anchor day is accepted as read',
    expect: '18',
    apply: (s) =>
      s.replace(
        '    return { state: \'malformed\', detail: `firstCoverageDay "${iso}" is not a valid calendar day (${file})`, iso, day: null };',
        "    return { state: 'read', detail: file, iso, day: null };",
      ),
  },
];

const source = readFileSync(SUBJECT, 'utf8');
let failures = 0;

for (const m of MUTATIONS) {
  const mutated = m.apply(source);
  if (m.name !== 'CONTROL (no mutation)' && mutated === source) {
    console.log(`\n### ${m.name}\n  ⛔ MUTATION DID NOT APPLY — the anchor text moved. This run proves nothing.`);
    failures++;
    continue;
  }
  const root = mkdtempSync(path.join(tmpdir(), 's2671-teeth-'));
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  mkdirSync(path.join(root, 'ops'), { recursive: true });
  copyFileSync(ANCHOR, path.join(root, 'ops', 'ledger-series-anchor.json'));
  copyFileSync(TEST, path.join(root, 'scripts', path.basename(TEST)));
  writeFileSync(path.join(root, 'scripts', path.basename(SUBJECT)), mutated);

  const r = spawnSync('node', ['--test', '--test-timeout=300000', path.join(root, 'scripts', path.basename(TEST))], {
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: 1e8,
  });
  const out = r.stdout ?? '';
  const red = [...out.matchAll(/^✖ (\d+)\./gm)].map((x) => x[1]);
  const green = [...out.matchAll(/^✔ (\d+)\./gm)].map((x) => x[1]);
  const uniqRed = [...new Set(red)].sort((a, b) => a - b);
  console.log(`\n### ${m.name}`);
  console.log(`  expected to red : ${m.expect}`);
  console.log(`  actually red    : ${uniqRed.length ? uniqRed.join(', ') : 'none'}   (green: ${new Set(green).size})`);
  const norm = (s) => String(s).split(/[,\s]+/).filter(Boolean).join(',');
  const ok =
    m.expect === 'all arms green' ? uniqRed.length === 0 : norm(uniqRed) === norm(m.expect);
  console.log(`  ${ok ? '✅ the arm has teeth' : '⛔ MISMATCH — read the run'}`);
  if (!ok) failures++;
}

console.log(`\n${failures === 0 ? '✅ every mutation landed on exactly the arm claimed' : `⛔ ${failures} mismatch(es)`}`);
process.exit(failures === 0 ? 0 : 1);
