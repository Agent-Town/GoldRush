// RETAINED EVIDENCE — this probe produced every load-bearing number in F-2417-1
// (tasks/BACKLOG.md). Kept in scripts/ per F-1665-1: a one-shot SPLICE helper belongs in
// /tmp, a probe that PRODUCED EVIDENCE belongs here, committed and cited. Read it, cite it,
// re-run it; do not delete it (RETENTION LAW).
//
// Usage: node scripts/tmp-s2417-engine-corpus-census.mjs [<root>] [<since-rev>]
// Default window starts at d67608bb3 — the 2026-08-25 gate probe that made engine-era
// declarations enforceable. Answers: of the commits that moved the engine IDENTITY hash,
// what fraction touched nothing the headless replay executes?
// NOT a gate: prints and exits 0 (2 only if it cannot read the corpus from the code).
// s2417 — how often does the ENGINE IDENTITY CORPUS move for a reason that is not
// simulation behaviour? Measurement only; renders no ruling on F-2416-2.
import { execFileSync } from 'node:child_process';

const ROOT = process.argv[2] ?? process.cwd();
const SINCE = process.argv[3] ?? 'd67608bb3'; // era-3 enforceability gate probe, 2026-08-25
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });

// Read the corpus from the CODE, never transcribed (the list can change under us).
const src = git('show', 'HEAD:scripts/assay-replay-agent.mjs');
const m = src.match(/export const ENGINE_SOURCE_INPUTS = \[([\s\S]*?)\];/);
if (!m) { console.error('REFUSE: could not read ENGINE_SOURCE_INPUTS from HEAD'); process.exit(2); }
const CORPUS = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
console.log(`corpus (read from HEAD, ${CORPUS.length} entries): ${CORPUS.join(' ')}`);

// A path is in the corpus if it equals a file entry or sits under a directory entry.
const FILES = new Set(CORPUS.filter((c) => c.includes('.')));
const DIRS = CORPUS.filter((c) => !c.includes('.'));
const inCorpus = (p) => FILES.has(p) || DIRS.some((d) => p === d || p.startsWith(`${d}/`));

// BOOKKEEPING = a corpus path the factory's OWN LAW makes a fire edit (F-1300-4 roots
// every new guard in package.json's test chains; the lockfile follows package.json).
const BOOKKEEPING = new Set(['package.json', 'package-lock.json']);

const commits = git('log', '--first-parent', '--format=%H %cI', `${SINCE}..HEAD`)
  .trim().split('\n').filter(Boolean).map((l) => { const [h, d] = l.split(' '); return { h, d }; });

const rows = [];
for (const c of commits) {
  const names = git('show', '--first-parent', '--name-only', '--format=', c.h)
    .split('\n').map((s) => s.trim()).filter(Boolean);
  const hit = names.filter(inCorpus);
  if (!hit.length) continue;
  const bookOnly = hit.every((p) => BOOKKEEPING.has(p));
  // Sharper arm: for a package.json-only movement, is the WHOLE delta inside a test chain?
  let testChainOnly = null;
  if (bookOnly && hit.includes('package.json')) {
    const d = git('show', '--first-parent', '--format=', '-U0', c.h, '--', 'package.json');
    const changed = d.split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
    testChainOnly = changed.length > 0 && changed.every((l) => /"test:[a-z-]+"\s*:/.test(l));
  }
  rows.push({ ...c, hit, bookOnly, testChainOnly, subject: git('log', '-1', '--format=%s', c.h).trim() });
}

const book = rows.filter((r) => r.bookOnly);
const chain = book.filter((r) => r.testChainOnly === true);
console.log(`\nwindow ${SINCE}..HEAD — ${commits.length} first-parent commit(s), ${rows.length} moved the engine identity corpus\n`);
for (const r of rows) {
  const tag = r.bookOnly ? (r.testChainOnly ? 'BOOKKEEPING (test-chain only)' : 'BOOKKEEPING') : 'SUBSTANTIVE';
  console.log(`  ${r.h.slice(0, 9)}  ${r.d.slice(0, 16)}  ${tag.padEnd(29)} ${r.hit.slice(0, 3).join(' ')}${r.hit.length > 3 ? ` +${r.hit.length - 3}` : ''}`);
  if (r.bookOnly) console.log(`      ${r.subject.slice(0, 118)}`);
}
const pct = (n) => rows.length ? `${((n / rows.length) * 100).toFixed(1)}%` : 'n/a';
console.log(`\n  corpus movements       : ${rows.length}`);
console.log(`  BOOKKEEPING-ONLY       : ${book.length}  (${pct(book.length)})  — no file that the replay executes was touched`);
console.log(`    of which test-chain  : ${chain.length}  — the whole package.json delta is a test:* chain (F-1300-4's mandated edit)`);
console.log(`  SUBSTANTIVE            : ${rows.length - book.length}  (${pct(rows.length - book.length)})`);
