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
import { scan } from './findings-state-guard.mjs';

const SUBJECT_CHARS = 90;
const FINDING = /\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/g;
const FINDING_ONE = /\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+\b/;
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;
const DESK_WORD = /OWNER(?:'S|’S|S|`S)? DESK/g;
const KEY_ZONE = 120;

function value(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
}

export function desk(statusText) {
  const line1 = statusText.split('\n')[0] || '';
  if (line1.startsWith('ACTIVE')) return { kind: 'lock', items: [] };
  const hits = [...line1.matchAll(DESK_WORD)];
  if (!hits.length) return { kind: 'none', items: [] };
  const tail = line1.slice(hits.at(-1).index);
  const items = [...new Set(tail.match(FINDING) || [])].map((id) => ({ id, type: 'finding' }));
  for (const segment of tail.split('🔺').slice(1)) {
    const head = segment.slice(0, KEY_ZONE);
    const finding = head.match(FINDING_ONE);
    const slug = head.match(SLUG);
    if (slug && (!finding || slug.index < finding.index) && !items.some(({ id }) => id === slug[1])) {
      items.push({ id: slug[1], type: 'slug' });
    }
  }
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
