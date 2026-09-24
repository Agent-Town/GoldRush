#!/usr/bin/env node
// stale-ready-for-gates-guard — a ledger row must not still claim a slice is awaiting its
// drain after that slice's goal leaf has landed.
//
// WHY (F-1461-4, filed s1461, predicate measured and built s1483)
//   The ER-01 E4 lane's `READY-FOR-GATES` row auto-merged CLEANLY into BACKLOG and therefore
//   survived as a stale claim about a slice that had already shipped; s1461 retired it by hand.
//   Git's conflict detector is the only thing checking ledger rows for staleness, and it is the
//   wrong instrument: it asks whether two edits collide, never whether the surviving text is
//   still true. This is the Ghost Line (Mistake #5) with a merge as its delivery mechanism.
//
//   HAND-RETIREMENT DOES NOT SCALE, WHICH IS THE ARGUMENT FOR A GUARD AT ALL. The class
//   RECURRED eight fires after it was filed: `e3-moth-socket` merged at bfeca043 (drained s1469,
//   full review at reviews/e3-moth-socket.md) while BACKLOG:2992 still read "lane implementation
//   READY-FOR-GATES on `lane/a`; merge receipt awaits the drain." Found by this guard on its
//   first run, s1483; the row was retired in the same commit that shipped this file.
//
// THE PREDICATE — WHICH ARM, AND WHY. The gate text as filed said "reds on any
// `READY-FOR-GATES`/🟡 row whose goal leaf is `merged`". Measured s1483 over tasks/BACKLOG.md:
//
//   (a) THE GATE AS LITERALLY WRITTEN ........................ 20 rows, 0 real (100% FALSE)
//         · 18 are 🟡 rows: an OPEN FINDING whose slice merged. That is not staleness, it is
//           the normal life of a finding — findings routinely outlive the slice that spawned
//           them (F-1288-4's own row is one). The gate's author read 🟡 as "in-flight claim";
//           in this ledger 🟡 means "open finding". Enforcing it would red 18 correct rows.
//         · 2 are prose QUOTATIONS of the phrase inside backticks, in rows that are already
//           closed or narrative (:828 quotes a removed line as evidence in a ✅ CLOSED row;
//           :2206 says "Its run log ends `READY-FOR-GATES`"). BACKLOG is a narrative ledger
//           whose rows quote each other constantly, so quotation is the common case, not an
//           edge case.
//
//   (b) CHOSEN — the phrase OUTSIDE backticks, in a row not marked closed, resolving to a
//       leaf that has LANDED ................................. 1 row, 1 real (the live one)
//
//   A guard that fires 20 times on day one to catch 0 defects does not get adopted; it gets
//   an exemption list, and then it is scenery. Both discriminators below are carried by a real
//   case, not by taste.
//
// RESOLUTION IS BY LEAF id OR taskFile, AND THE id HALF IS LOAD-BEARING.
//   The s1461 incident row named its leaf by ID — "GOAL LEAF `er-01-e4-census`" — and never
//   named a taskFile. A taskFile-only resolver would have missed THE VERY INCIDENT THAT
//   MOTIVATED THIS FINDING while looking like it worked. Measured s1483: of 35 rows carrying
//   the phrase, 17 resolve to no leaf at all by either key, so the guard is deliberately silent
//   about rows it cannot adjudicate rather than guessing.
//
// THE SUBJECT MUST BE THE ROW'S OWN, NOT ONE IT MENTIONS IN PASSING (found by this guard's
// FIRST run reding on itself, s1483 — the second red was mine, not the ledger's).
//   "the row mentions leaf X" does NOT mean "the row is a claim about leaf X". BACKLOG rows
//   cite other slices constantly. :2518 (F-1112-3, a 3,478-char row about rf-37) matched leaf
//   `board-chapter-seed-scope` because it mentions, as a load-average aside, that lane-c was
//   running that task concurrently — key at char 1288, claim at char 3255, subject unrelated.
//   Every genuine case puts BOTH the key and the claim in the row's bold HEADLINE, which is
//   this ledger's own convention for declaring a row's subject. Measured s1483:
//
//       s1461 incident row (pre-a678fe3f0 :2978)  key@27    claim@46    -> headline, RED
//       live e3-moth-socket   (:2992)             key@18    claim@55    -> headline, RED
//       F-1112-3 aside        (:2518)             key@1288  claim@3255  -> body, SILENT
//
//   So the guard adjudicates the headline and ignores the body. A row that buries a real stale
//   claim 3,000 characters deep is not something this guard can see, and it says so rather than
//   guessing — see `unresolved`/`body-only` in --report.
//
// WHAT COUNTS AS LANDED
//   The gate said `merged`. A row claiming "awaits the drain" is equally false once its leaf
//   reaches any state that means the work is no longer waiting to land. Measured s1483 — the
//   wider set adds ZERO reds today (all four extra statuses: 0), so it is chosen for being
//   right rather than for being convenient, and it cannot be blamed for a red it did not cause.
//
// USAGE
//   node scripts/stale-ready-for-gates-guard.mjs            # gate (exit 1 on a stale claim)
//   node scripts/stale-ready-for-gates-guard.mjs --report   # full split, always exit 0
//   node scripts/stale-ready-for-gates-guard.mjs --root <d> # synthetic corpus (tests)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { BACKLOG_INDEX, backlogParts, corpusDeclaration } from './ledger-corpus.mjs';

// A leaf in one of these states is no longer "awaiting its drain".
export const LANDED = new Set(['merged', 'shipped', 'verified-by-owner', 'superseded']);

// The claim this guard adjudicates. Kept as one constant so the corpus scan and the predicate
// can never drift apart.
export const CLAIM = 'READY-FOR-GATES';

// A row whose own leading marker is one of these is reporting history, not making a claim.
const CLOSED_MARKER = /^\s*-?\s*(✅|🚨|⛔|🟥)/u;
const CLOSED_WORD = /\b(CLOSED|SHIPPED|RETIRED|struck|superseded)\b/;

const stripCode = (s) => s.replace(/`[^`]*`/g, '');

// This ledger's rows declare their subject in a leading bold span. That span is the row's
// claim; everything after it is narrative that may cite any number of other slices.
export function headline(line) {
  const m = line.match(/\*\*([\s\S]*?)\*\*/);
  return m ? line.slice(0, m.index + m[0].length) : line.slice(0, 200);
}

export function indexLeaves(goals) {
  const leaves = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      if (n.taskFile || n.status) leaves.push(n);
      for (const k of ['goals', 'subgoals', 'tasks', 'children']) if (n[k]) walk(n[k]);
    }
  };
  walk(goals.goals);
  // Longest key first: `e3-moth-socket` and `e3-moth-socket-b` must not race.
  const keys = [];
  for (const l of leaves) {
    if (l.taskFile) keys.push([l.taskFile, l]);
    if (l.id) keys.push([l.id, l]);
  }
  keys.sort((a, b) => b[0].length - a[0].length);
  return keys;
}

// THE PREDICATE. Exported so the test can exercise it directly on synthetic rows.
export function classifyRow(line, keys) {
  if (!line.includes(CLAIM)) return null;

  // Discriminator 1: a row reporting a closed/escalated event is narrative.
  if (CLOSED_MARKER.test(line) || CLOSED_WORD.test(line)) return { verdict: 'closed-row' };

  // Discriminator 2: the claim must be the row's OWN, in its subject-declaring headline —
  // not a quotation (backticked) and not buried in the body citing someone else's slice.
  const head = headline(line);
  if (!stripCode(head).includes(CLAIM)) {
    return { verdict: stripCode(line).includes(CLAIM) ? 'body-only' : 'quoted' };
  }

  // Discriminator 3: the leaf must be the headline's subject, not a passing mention.
  const hit = keys.find(([k]) => k.length > 6 && head.includes(k));
  if (!hit) return { verdict: 'unresolved' };

  const [key, leaf] = hit;
  if (!LANDED.has(leaf.status)) return { verdict: 'in-flight', key, status: leaf.status };
  return { verdict: 'STALE', key, status: leaf.status, mergeHash: leaf.mergeHash };
}

function main() {
  const argv = process.argv.slice(2);
  const report = argv.includes('--report');
  const rootIdx = argv.indexOf('--root');
  const root = rootIdx >= 0 ? path.resolve(argv[rootIdx + 1]) : process.cwd();

  const ledgerPath = path.join(root, 'tasks/BACKLOG.md');
  const goalsPath = path.join(root, 'tasks/goals.json');
  const keys = indexLeaves(JSON.parse(fs.readFileSync(goalsPath, 'utf8')));
  // ledger-shape-1 (owner ruling 2026-09-24, item 13a): the ledger is `tasks/BACKLOG.md` PLUS
  // `tasks/backlog/**`. Reading the index alone after the split narrows the carrier set SILENTLY and
  // fails OPEN. `scripts/ledger-corpus.mjs` lists the corpus; coordinates carry their own file so
  // they still resolve (bare for the index, `<rel>:<n>` for a split part).
  const parts = backlogParts(root);
  const lines = parts.flatMap((part) => part.text.split('\n').map((line, i) => ({
    line, where: part.rel === BACKLOG_INDEX ? String(i + 1) : `${part.rel}:${i + 1}`,
  })));

  const buckets = { STALE: [], quoted: [], 'closed-row': [], 'body-only': [], unresolved: [], 'in-flight': [] };
  lines.forEach(({ line, where }) => {
    const c = classifyRow(line, keys);
    if (c) buckets[c.verdict].push({ n: where, line, ...c });
  });

  const carriers = lines.filter((l) => l.line.includes(CLAIM)).length;
  console.log(`ledger corpus: ${corpusDeclaration(parts.map((p) => p.rel))}`);
  console.log(
    `tasks/BACKLOG.md: ${carriers} row(s) carry ${CLAIM} · ` +
      `${buckets.quoted.length} quotation · ${buckets['closed-row'].length} closed-row · ` +
      `${buckets['body-only'].length} body-only · ` +
      `${buckets.unresolved.length} unresolved · ${buckets['in-flight'].length} in-flight · ` +
      `${buckets.STALE.length} STALE`
  );

  if (report) {
    for (const [k, rows] of Object.entries(buckets)) {
      if (!rows.length) continue;
      console.log(`\n[${k}] ${rows.length}`);
      for (const r of rows) console.log(`  :${r.n} ${r.key ? `(${r.key} -> ${r.status}) ` : ''}${r.line.slice(0, 150)}`);
    }
    process.exit(0);
  }

  if (buckets.STALE.length) {
    console.error(`\nFAIL: ${buckets.STALE.length} ledger row(s) still claim a landed slice awaits its drain.\n`);
    for (const r of buckets.STALE) {
      console.error(`  tasks/BACKLOG.md:${r.n}`);
      console.error(`    ${r.line.slice(0, 200)}`);
      console.error(
        `    -> goal leaf "${r.key}" is status="${r.status}"${r.mergeHash ? ` merged ${r.mergeHash.slice(0, 8)}` : ''}.\n` +
          `       The slice landed; the row still says it is waiting. This is the Ghost Line\n` +
          `       (Mistake #5) — a stale claim that rode a clean auto-merge.\n` +
          `       CURE: retire the row in the SAME commit as the event, marking what landed and\n` +
          `       where its receipt is. Do not delete it — supersede it (CLAUDE.md §6).\n`
      );
    }
    process.exit(1);
  }
  console.log('OK: no stale READY-FOR-GATES claim.');
  process.exit(0);
}

// NOT `file://${process.argv[1]}` — this repo's absolute path contains a space ("Gold Rush"),
// which `import.meta.url` percent-encodes and `process.argv[1]` does not (F-1482 note).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
