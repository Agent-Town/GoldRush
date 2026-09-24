#!/usr/bin/env node
/**
 * desk-surface-blindspot-probe.mjs — F-2068-1 evidence, re-runnable.
 *
 * WHY
 *   s2067 (F-2067-1) found F-1101-1 stale on ONE of its three surfaces and asked
 *   the next fire to measure how many of the other 23 desk items are stale on a
 *   surface BEFORE building a cross-surface checker. This probe is that
 *   measurement. It reports four numbers and names every row behind them.
 *
 * WHAT IT MEASURES
 *   1. Desk items whose own subject row carries a closure marker that the shared
 *      census cannot see (the F-1101-1 shape).
 *   2. The named-vs-numeric census gap: scan()'s FINDING is /\bF-\d+-\d+\b/g, so
 *      every NAMED finding (F-DOOR-6, F-E2S-3, ...) is absent from the census.
 *   3. Every row board-wide carrying a ✅ that scan(wide) records in NEITHER
 *      direction.
 *   4. Every <br>-prefixed marker row — the prefix that defeats rowState().
 *
 * READ THE CONTROL BEFORE THE COUNTS. Measurement 2 looks alarming and is NOT a
 * defect: desk-state-audit's fallbackState() rescues named ids, proven by the
 * control in this file (three known-closed named findings classify CLOSED).
 *
 * USAGE  node scripts/desk-surface-blindspot-probe.mjs
 */
import fs from 'node:fs';
import { scan } from './findings-state-guard.mjs';
import { backlogFiles, backlogText } from './ledger-corpus.mjs';

const BACKLOG = process.argv.includes('--backlog')
  ? process.argv[process.argv.indexOf('--backlog') + 1]
  : 'tasks/BACKLOG.md';

// The 24 items carried on the OWNER'S DESK at s2067 handoff.
const DESK = `F-1101-1 F-1501-3 F-2062-1 F-2063-2 F-2054-1 F-1659-1 F-1657-3 F-1656-3
F-1653-2 F-1648-1 F-1640-1 F-1637-2 F-1625-4 F-1617-1 F-DOOR-6 F-1608-2 F-1193-3
F-1601-1 F-1510-1 F-E2S-3 F-1536-2 F-1591-1 F-1507-1 F-E2S-4`.split(/\s+/);

const FINDING_ONE = /\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/;
const NAMED = /\bF-(?![0-9]+-[0-9]+\b)[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/g;

// ledger-shape-1 (owner ruling 2026-09-24, item 13a): the ledger is the index PLUS
// `tasks/backlog/**`. An explicit `--backlog <file>` still wins — that is how this probe is
// pointed at a single fixture — but the default is the whole corpus, because a blind-spot count
// taken over two thirds of the rows understates the blind spot it exists to measure.
const CORPUS = process.argv.includes('--backlog') ? [BACKLOG] : backlogFiles(process.cwd());
const text = process.argv.includes('--backlog') ? fs.readFileSync(BACKLOG, 'utf8') : backlogText(process.cwd());
console.log(`ledger corpus: ${CORPUS.join(', ')}`);
const lines = text.split('\n');
const wide = scan(text, { closedVocabulary: 'wide' });

// (1) desk items whose subject row carries a marker the census never records
const deskBlind = [];
for (const id of DESK) {
  for (const [i, line] of lines.entries()) {
    const n = i + 1;
    const match = line.slice(0, 90).match(FINDING_ONE);
    if (!match || match[0] !== id) continue; // subject-first, the audit's own rule
    const lead = line.trimStart();
    const marker = lead.indexOf('✅');
    if (marker < 0 || marker > match.index + 12) continue;
    const state = wide.get(id);
    const recorded = state && (state.closed.includes(n) || state.open.includes(n));
    if (!recorded) deskBlind.push({ n, id, lead: lead.slice(0, 120) });
  }
}

// (2) the named-vs-numeric census gap
const named = new Set(text.match(NAMED) || []);

// (3) every row board-wide whose ✅ scan(wide) records in neither direction
const boardBlind = [];
for (const [i, line] of lines.entries()) {
  const n = i + 1;
  const match = line.slice(0, 90).match(FINDING_ONE);
  if (!match) continue;
  const lead = line.trimStart();
  const marker = lead.indexOf('✅');
  if (marker < 0 || marker > match.index + 12) continue;
  const state = wide.get(match[0]);
  if (!(state && (state.closed.includes(n) || state.open.includes(n)))) {
    boardBlind.push({ n, id: match[0], lead: lead.slice(0, 110) });
  }
}

// (4) the <br> prefix that defeats rowState()
const brRows = lines
  .map((line, i) => ({ n: i + 1, lead: line.trimStart() }))
  .filter(({ lead }) => lead.startsWith('<br>') && /[✅🔴🟡🟠]/u.test(lead));

console.log(`census: ${wide.size} numeric F-IDs visible · ${named.size} named F-IDs invisible`);
console.log(`desk items (${DESK.length}) with an unreadable closure on their own subject row: ${deskBlind.length}`);
for (const b of deskBlind) console.log(`  L${b.n}  ${b.id}\n     ${b.lead}`);
console.log(`board-wide rows whose ✅ scan(wide) records in NEITHER direction: ${boardBlind.length}`);
console.log(`<br>-prefixed marker rows (the defeating prefix): ${brRows.length}`);
for (const r of brRows) console.log(`  L${r.n}  ${r.lead.slice(0, 100)}`);
