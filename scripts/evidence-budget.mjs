#!/usr/bin/env node
// evidence-budget — HOW MANY EVIDENCE BYTES ONE LANDING IS ALLOWED TO ADD.
//
// OWNER RULING 2026-09-24, item 14, option (a): "Evidence goes to the existing archive repository
// with an index and small previews in the tree, PLUS A SIZE BUDGET PER LANDING." This is that
// budget. Without it the offload is a one-off: the same document measured the tree "growing about
// 1 GB a day during art campaigns", so a tree cut from 8.7 GB to 1.0 GB is back where it started
// inside a fortnight and the next offload is someone else's problem.
//
// TWO QUESTIONS, TWO EXIT PATHS, BOTH CHECKABLE:
//   the LANDING  `node scripts/evidence-budget.mjs <base> <tip>` - the tracked bytes this landing
//                ADDS under the evidence prefixes, against a per-landing ceiling (40 MB by default,
//                from `scripts/evidence-budget-baseline.json`, overridable with `--limit`).
//   the TREE     `node scripts/evidence-budget.mjs --total` - the whole tracked `artifacts/` total
//                against the ceiling the first offload BANKS in that same file. While the ceiling is
//                unbanked this reports the total and exits 0, because a budget nobody has set yet
//                must not block a drain (the advisory precedent of `drain-block-check`'s UNKNOWN).
//
// THE SHAPE IS THE HOUSE'S, NOT A NEW ONE: `scripts/first-town-payload.mjs` computes a number from
// the tree and `scripts/deploy.sh` gates on it against a banked ceiling, with the ceiling as DATA so
// that moving it is an owner act and not a code edit. Same division here.
//
// ADDED, not TOTAL, is the landing quantity, and a DELETION never buys credit: `added` counts new
// blobs and the GROWTH of modified ones, `removed` is reported beside it so an offload landing reads
// as the large negative it is, and the gate judges `added` alone. Otherwise one drain could delete a
// gigabyte of someone else's evidence to make room for its own screenshots.
//
// EXIT CODES: 0 inside budget (or nothing banked yet) · 1 over a ceiling · 2 could not measure.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(HERE, '..');
export const BASELINE_PATH = 'scripts/evidence-budget-baseline.json';
export const DEFAULT_LIMIT_BYTES = 40_000_000;
export const EVIDENCE_PREFIXES = ['artifacts/', 'reviews/shots-'];

const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;
const isEvidence = (path) => EVIDENCE_PREFIXES.some((prefix) => path.startsWith(prefix));

function git(root, args, options = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30, ...options });
}

/** The baseline, with every field defaulted, so a caller never has to test for a missing key. */
export function readBaseline(root = DEFAULT_ROOT, path = BASELINE_PATH) {
  const fallback = {
    perLandingLimitBytes: DEFAULT_LIMIT_BYTES,
    prefixes: EVIDENCE_PREFIXES,
    totalArtifacts: { ceilingBytes: null, bankedBytes: null, bankedFiles: null, commit: null, measuredAt: null, setBy: null },
    source: null,
  };
  try {
    const raw = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
    return {
      perLandingLimitBytes: Number.isInteger(raw.perLandingLimitBytes) ? raw.perLandingLimitBytes : DEFAULT_LIMIT_BYTES,
      prefixes: Array.isArray(raw.prefixes) && raw.prefixes.length ? raw.prefixes : EVIDENCE_PREFIXES,
      totalArtifacts: { ...fallback.totalArtifacts, ...(raw.totalArtifacts ?? {}) },
      source: path,
    };
  } catch {
    return fallback;
  }
}

/** Blob sizes for many `<rev>:<path>` specs in one git process. Missing specs come back as 0. */
function sizesOf(root, specs) {
  const sizes = new Map();
  if (!specs.length) return sizes;
  const out = git(root, ['cat-file', '--batch-check'], { input: `${specs.join('\n')}\n` });
  out.split('\n').filter(Boolean).forEach((line, i) => {
    const parts = line.trim().split(/\s+/);
    sizes.set(specs[i], line.includes('missing') ? 0 : Number(parts[parts.length - 1]) || 0);
  });
  return sizes;
}

/**
 * Evidence bytes added, removed and net between two commits.
 *
 * `--no-renames` on purpose: a rename out of `artifacts/` is a real removal and one into it is a real
 * addition, which is exactly how a budget should read a file that MOVED into the evidence tree.
 */
export function measureLanding(root, base, tip) {
  const raw = git(root, ['diff', '-z', '--name-status', '--no-renames', base, tip, '--', 'artifacts', 'reviews']);
  const fields = raw.split('\0').filter((f) => f !== '');
  const changes = [];
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const status = fields[i].trim()[0];
    const path = fields[i + 1];
    if (isEvidence(path)) changes.push({ status, path });
  }
  const specs = [];
  for (const change of changes) {
    if (change.status !== 'D') specs.push(`${tip}:${change.path}`);
    if (change.status !== 'A') specs.push(`${base}:${change.path}`);
  }
  const sizes = sizesOf(root, specs);
  let added = 0;
  let removed = 0;
  const growth = [];
  for (const change of changes) {
    const now = change.status === 'D' ? 0 : sizes.get(`${tip}:${change.path}`) ?? 0;
    const was = change.status === 'A' ? 0 : sizes.get(`${base}:${change.path}`) ?? 0;
    if (now > was) {
      added += now - was;
      growth.push({ path: change.path, bytes: now - was, status: change.status });
    } else {
      removed += was - now;
    }
  }
  growth.sort((a, b) => b.bytes - a.bytes);
  return { base, tip, files: changes.length, added, removed, net: added - removed, growth };
}

/** The whole tracked `artifacts/` tree, the quantity the first offload banks a ceiling for. */
export function measureTotal(root, rev = 'HEAD') {
  const out = git(root, ['ls-tree', '-r', '-l', rev, '--', 'artifacts']);
  let bytes = 0;
  let files = 0;
  for (const line of out.split('\n')) {
    const m = line.match(/^\d+ blob [0-9a-f]+\s+(\d+|-)\t/);
    if (!m) continue;
    bytes += m[1] === '-' ? 0 : Number(m[1]);
    files += 1;
  }
  return { rev, bytes, files };
}

function main() {
  const argv = process.argv.slice(2);
  const flag = (name, fallback = null) => {
    const at = argv.indexOf(name);
    return at === -1 ? fallback : argv[at + 1];
  };
  const root = flag('--root') ? resolve(flag('--root')) : DEFAULT_ROOT;
  const baseline = readBaseline(root, flag('--baseline', BASELINE_PATH));
  const asJson = argv.includes('--json');
  const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

  try {
    const total = measureTotal(root);
    const ceiling = baseline.totalArtifacts.ceilingBytes;
    if (argv.includes('--total') || !positional.length) {
      const over = Number.isInteger(ceiling) && total.bytes > ceiling;
      if (asJson) {
        process.stdout.write(`${JSON.stringify({ mode: 'total', total, baseline, over }, null, 1)}\n`);
      } else {
        console.log('evidence-budget — the whole tracked evidence tree against its banked ceiling');
        console.log(`  prefixes : ${baseline.prefixes.join(' ')} (the landing quantity); this total is artifacts/ alone`);
        console.log(`  total    : ${total.files} file(s) ${mb(total.bytes)} tracked under artifacts/ at ${total.rev}`);
        console.log(`  ceiling  : ${Number.isInteger(ceiling) ? mb(ceiling) : 'NOT BANKED YET'}`
          + `${baseline.totalArtifacts.setBy ? ` — ${baseline.totalArtifacts.setBy}` : ''}`);
        console.log(Number.isInteger(ceiling)
          ? `  ${over ? 'OVER BUDGET' : 'PASS'} — ${mb(total.bytes)} against ${mb(ceiling)}`
          : '  PASS (advisory) — no ceiling is banked, so this cannot refuse a drain. Run the offload, then bank it.');
      }
      process.exit(over ? 1 : 0);
    }

    if (positional.length < 2) throw new Error('give a base and a tip commit, or --total');
    const [base, tip] = positional;
    const limit = Number(flag('--limit', baseline.perLandingLimitBytes));
    if (!Number.isFinite(limit) || limit <= 0) throw new Error(`--limit must be a positive byte count, got ${flag('--limit')}`);
    const landing = measureLanding(root, base, tip);
    const over = landing.added > limit;
    if (asJson) {
      process.stdout.write(`${JSON.stringify({ mode: 'landing', ...landing, limit, over, total, baseline }, null, 1)}\n`);
      process.exit(over ? 1 : 0);
    }
    console.log('evidence-budget — the evidence bytes this landing adds');
    console.log(`  range    : ${base}..${tip}`);
    console.log(`  prefixes : ${baseline.prefixes.join(' ')} — a path outside these is not counted at all`);
    console.log(`  files    : ${landing.files} changed evidence path(s)`);
    console.log(`  added    : ${mb(landing.added)}  (new blobs plus the growth of modified ones)`);
    console.log(`  removed  : ${mb(landing.removed)}  (reported, never credited against the ceiling)`);
    console.log(`  net      : ${mb(landing.net)}`);
    console.log(`  limit    : ${mb(limit)} per landing${baseline.source ? ` (${baseline.source})` : ''}`);
    for (const row of landing.growth.slice(0, 8)) console.log(`      ${mb(row.bytes).padStart(10)}  ${row.status}  ${row.path}`);
    if (landing.growth.length > 8) console.log(`      … and ${landing.growth.length - 8} more growing path(s)`);
    console.log(`  tree     : ${mb(total.bytes)} tracked under artifacts/ (${Number.isInteger(ceiling) ? `ceiling ${mb(ceiling)}` : 'no ceiling banked yet'})`);
    console.log(over
      ? `  OVER BUDGET — ${mb(landing.added)} added against a ${mb(limit)} ceiling. Offload first `
        + '(node scripts/evidence-offload.mjs --plan), or raise the ceiling as an OWNER act with a reason.'
      : `  PASS — ${mb(landing.added)} added, inside the ${mb(limit)} ceiling.`);
    process.exit(over ? 1 : 0);
  } catch (error) {
    // 2, never 1: "could not measure" and "measured, and it refuses" are different questions and must
    // never share a code (the F-2215-1 convention this repo's audits already carry).
    console.log(`⛔ CANNOT VERIFY — the evidence budget did not run: ${error.message}`);
    console.error(`evidence-budget: REFUSING — ${error.message}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
