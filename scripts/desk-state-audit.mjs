#!/usr/bin/env node
/**
 * desk-state-audit.mjs — is each carried OWNER'S DESK item still open?
 *
 * WHY
 *   The shared findings census intentionally ignores open 🔺 rows, so a desk
 *   item can be present on the board without an answer in either direction.
 *   Widening that shared vocabulary admits incidental citations and creates
 *   conflicts. This advisory reader instead keeps the first F-ID in each
 *   90-character subject zone and reports evidence for the carried items only.
 *
 * WHAT IT CHECKS — AND DOES NOT
 *   STATUS.md line 1 supplies the final desk segment; findings resolve against
 *   subject-led BACKLOG rows and backticked goal keys against goals.json. The
 *   exported scan() remains the only closure rule. This tool does not decide
 *   whether ledger claims are true in code. Advisory mode always exits 0: a
 *   strict default would red the board instead of answering the question, as
 *   drain-block-check's UNKNOWN precedent demonstrates. --strict exits 1 only
 *   when a carried item is CLOSED and should have left the desk.
 *
 * USAGE
 *   node scripts/desk-state-audit.mjs
 *   node scripts/desk-state-audit.mjs --strict --json
 *   node scripts/desk-state-audit.mjs --status <path> --backlog <path> --goals <path>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deskItems, deskTail, isLockLine } from './desk-carryforward-guard.mjs';
import { scan } from './findings-state-guard.mjs';

const SUBJECT_CHARS = 90;
const FINDING_ONE = /\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/;

function value(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
}

export function desk(statusText) {
  const line1 = statusText.split('\n')[0] || '';
  // ONE IMPLEMENTATION OF THIS PREDICATE, IMPORTED (F-2227-1, s2227).
  //
  // This test used to be `line1.startsWith('ACTIVE')`, written for a line-1
  // convention that has since been retired. Today's lock line reads
  // `Last updated: <stamp> ACTIVE (sNNNN fire) — <intent>`, which does not START
  // with the word — so this branch had become UNREACHABLE, and every lock line
  // fell through to the `kind:'none'` arm below: REFUSING at rc=2 with "no desk
  // header on line-1", a message that accuses the wrong subject (the line has no
  // desk BECAUSE it is a lock, which is the one thing this branch existed to say).
  //
  // Measured s2227 over all 4,639 STATUS.md commits: the sibling predicate
  // identifies 2,119 lock lines, `startsWith` only 1,696 — 423 disagreements, and
  // the disagreement is CURRENT, covering every fire since the convention moved.
  //
  // The drift's direction was CONSERVATIVE — a loud refusal, never a false green —
  // which is exactly why nothing caught it. What it cost was the DOCUMENTED
  // behaviour: fire.md §4 and gate-caller-baseline.json's F-1566-2 entry both
  // state that this tool "correctly prints SKIP" on a lock line, and it had
  // silently stopped doing so. (F-1566-2's CONCLUSION — never root this advisory
  // in a battery — survives the refutation and is strengthened by it: an rc=2
  // refusal would have redded any battery that chained it.)
  //
  // Imported rather than re-written: desk-carryforward-guard.mjs already imports
  // subjectLedClosure FROM this file, so the cycle predates this line, and
  // F-1261-1's rule ("there is one implementation of that word in this repo")
  // is the same reason that import exists. Four copies is how this drifted.
  if (isLockLine(line1)) return { kind: 'lock', items: [] };
  const tail = deskTail(line1);
  if (!tail) return { kind: 'none', items: [] };
  const items = deskItems(tail).map((id) => ({ id, type: FINDING_ONE.test(id) ? 'finding' : 'slug' }));
  return { kind: 'desk', items };
}

function subjectRows(backlogText) {
  const rows = new Map();
  backlogText.split('\n').forEach((line, index) => {
    const match = line.slice(0, SUBJECT_CHARS).match(FINDING_ONE);
    if (!match) return;
    if (!rows.has(match[0])) rows.set(match[0], []);
    rows.get(match[0]).push({ line, number: index + 1, index: match.index });
  });
  return rows;
}

function fallbackState(row, id) {
  const numeric = `F-${'0'.repeat(id.length - 4)}-0`;
  const line = row.line.slice(0, row.index) + numeric + row.line.slice(row.index + id.length);
  return scan(line, { closedVocabulary: 'wide' }).get(numeric);
}

function subjectState(id, rows, census) {
  const ownRows = rows.get(id) || [];
  const shared = census.get(id) || { closed: [], open: [] };
  const ownLines = new Set(ownRows.map(({ number }) => number));
  const closed = shared.closed.filter((line) => ownLines.has(line));
  const open = shared.open.filter((line) => ownLines.has(line));

  if (!census.has(id)) {
    for (const row of ownRows) {
      const state = fallbackState(row, id);
      if (state?.closed.length) closed.push(row.number);
      if (state?.open.length) open.push(row.number);
    }
  }

  return { ownRows, closed, open };
}

function classifyFinding(id, rows, census) {
  const { ownRows, closed, open } = subjectState(id, rows, census);

  const evidence = [...new Set([...closed, ...open])].sort((a, b) => a - b);
  if (closed.length && open.length) return { verdict: 'BOTH', evidence };
  if (closed.length) return { verdict: 'CLOSED', evidence };
  if (open.length) return { verdict: 'OPEN', evidence };
  if (ownRows.length) return { verdict: 'OPEN-DESK-ONLY', evidence: ownRows.map(({ number }) => number) };
  return { verdict: 'UNRECORDED', evidence: [] };
}

export function subjectLedClosure(backlogText, id) {
  const rows = subjectRows(backlogText);
  const census = scan(backlogText, { closedVocabulary: 'wide' });
  return subjectState(id, rows, census).closed;
}

function findGoal(value, id) {
  if (!value || typeof value !== 'object') return null;
  if (value.id === id && Object.hasOwn(value, 'status')) return value;
  for (const child of Object.values(value)) {
    const found = findGoal(child, id);
    if (found) return found;
  }
  return null;
}

function classifySlug(id, goals) {
  const leaf = findGoal(goals, id);
  if (!leaf) return { verdict: 'UNRECORDED', evidence: [] };
  if (leaf.status === 'merged') return { verdict: 'CLOSED', evidence: ['goals.json'] };
  if (leaf.status === 'blocked') {
    return { verdict: 'OPEN', evidence: ['goals.json'], blockClass: leaf.blockClass ?? null };
  }
  return { verdict: 'OPEN', evidence: ['goals.json'] };
}

export function audit(statusText, backlogText, goals = {}) {
  const parsed = desk(statusText);
  if (parsed.kind !== 'desk') return parsed;
  const rows = subjectRows(backlogText);
  const census = scan(backlogText, { closedVocabulary: 'wide' });
  const items = parsed.items.map((item) => ({
    ...item,
    ...(item.type === 'finding'
      ? classifyFinding(item.id, rows, census)
      : classifySlug(item.id, goals)),
  }));
  const counts = Object.fromEntries(
    ['CLOSED', 'OPEN', 'BOTH', 'OPEN-DESK-ONLY', 'UNRECORDED'].map((verdict) => [
      verdict,
      items.filter((item) => item.verdict === verdict).length,
    ]),
  );
  return { kind: 'desk', items, counts };
}

function print(result) {
  console.log('ITEM\tTYPE\tVERDICT\tEVIDENCE');
  for (const item of result.items) {
    const evidence = item.evidence.join(', ') || '—';
    const block = item.blockClass ? `; blockClass=${item.blockClass}` : '';
    console.log(`${item.id}\t${item.type}\t${item.verdict}\t${evidence}${block}`);
  }
  console.log('');
  console.log(Object.entries(result.counts).map(([key, count]) => `${key}=${count}`).join(' · '));
}

function main() {
  const statusPath = path.resolve(value('--status', 'STATUS.md'));
  const backlogPath = path.resolve(value('--backlog', 'tasks/BACKLOG.md'));
  const goalsPath = path.resolve(value('--goals', 'tasks/goals.json'));
  let result;
  try {
    result = audit(
      fs.readFileSync(statusPath, 'utf8'),
      fs.readFileSync(backlogPath, 'utf8'),
      JSON.parse(fs.readFileSync(goalsPath, 'utf8')),
    );
  } catch (error) {
    console.error(`desk-state-audit: REFUSING — ${error.message}`);
    process.exit(2);
  }

  if (result.kind === 'lock') {
    console.log('SKIP — line-1 is a lock line, no desk to audit');
    return;
  }
  if (result.kind === 'none') {
    console.error('REFUSING — no desk header on line-1');
    process.exit(2);
  }
  if (process.argv.includes('--json')) console.log(JSON.stringify(result));
  else print(result);
  if (process.argv.includes('--strict') && result.items.some(({ verdict }) => verdict === 'CLOSED')) {
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
