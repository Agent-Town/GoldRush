// PRICE F-1515-1 against the live corpus.
// Question: of today's NUMBER-ONLY citations, how many would a NON-DESTRUCTIVE all-pairs
// scan (enumerate every same-kind delimiter pair, never consuming) recover as a real title?
// CONTROL FIRST: the copy must reproduce the shipped guard's tally, else it is measuring
// something else and any answer is about the copy, not the corpus.
import { scan } from './s1515-guard-copy.mjs';

const rows = scan();
const t = { 'NUMBER-ONLY': 0, 'CARRIES-TITLE': 0, 'CARRIES-LINE': 0, 'SPEC-GONE': 0 };
for (const r of rows) t[r.verdict] = (t[r.verdict] || 0) + 1;
console.log('=== CONTROL: copy must reproduce the shipped guard ===');
console.log('citations:', rows.length, JSON.stringify(t));
console.log('expected : 511 {"NUMBER-ONLY":262,"CARRIES-TITLE":206,"CARRIES-LINE":43}');
const controlOk = rows.length === 511 && t['NUMBER-ONLY'] === 262 && t['CARRIES-TITLE'] === 206 && t['CARRIES-LINE'] === 43;
console.log('CONTROL:', controlOk ? 'MATCHES — the copy is the same instrument' : 'MISMATCH — stop, this measures the copy');
if (!controlOk) process.exit(1);

const KINDS = [
  ['"', '"'],
  ['“', '”'],
  ["'", "'"],
  ['‘', '’'],
  ['`', '`'],
];

function allPairSpans(win) {
  const out = [];
  for (const [open, close] of KINDS) {
    const pos = [];
    for (let i = 0; i < win.length; i++) if (win[i] === open || win[i] === close) pos.push(i);
    for (let a = 0; a < pos.length; a++) {
      for (let b = a + 1; b < pos.length; b++) {
        const inner = win.slice(pos[a] + 1, pos[b]);
        if (inner.length >= 12 && inner.length <= 160 && !inner.includes('\n')) out.push(inner);
      }
    }
  }
  return out;
}

// Reuse the guard's own title matcher semantics via a direct equality/prefix test would
// drift; instead re-import nothing and test EXACT membership plus the guard's prefix rule.
const MIN_PREFIX = 20;
function resolves(span, titles) {
  for (const title of titles) {
    if (title === span) return title;
    if (title.startsWith(span) && span.length >= MIN_PREFIX) return title;
    if (span.startsWith(title) && title.length >= MIN_PREFIX) return title;
  }
  return null;
}

let recoverable = 0;
const examples = [];
let noTitles = 0;
for (const r of rows) {
  if (r.verdict !== 'NUMBER-ONLY') continue;
  if (!Array.isArray(r.titles) || r.titles.length === 0) { noTitles++; continue; }
  const hit = allPairSpans(r.win).map((s) => resolves(s, r.titles)).find(Boolean);
  if (hit) {
    recoverable++;
    if (examples.length < 8) examples.push(`${r.file}:${r.mdLine} -> ${r.spec} :: ${hit.slice(0, 70)}`);
  }
}

console.log('\n=== PRICE ===');
console.log('NUMBER-ONLY rows                          :', t['NUMBER-ONLY']);
console.log('  ...of those with no titles to match     :', noTitles, '(spec has no test titles; unreachable by any scan)');
console.log('  ...an ALL-PAIRS scan would newly recover:', recoverable);
for (const e of examples) console.log('   -', e);
console.log('\nVERDICT:', recoverable === 0
  ? 'INCIDENCE 0 — F-1515-1 is THEORY on this corpus. Close the row, do not build it.'
  : `INCIDENCE ${recoverable} — a successor slice has real work.`);
