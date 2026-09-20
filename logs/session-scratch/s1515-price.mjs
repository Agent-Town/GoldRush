// Price the residual: of the 262 NUMBER-ONLY citations on the merged tree, how many
// would a NON-DESTRUCTIVE scan (enumerate every same-kind delimiter PAIR, not just the
// greedy left-to-right ones) recover? That is the cleaner formulation the master's
// scope 3 named and the runner did not take.
import { scan } from '../../scripts/citation-title-guard.mjs';

const rows = scan();
const numberOnly = rows.filter((r) => r.verdict === 'NUMBER-ONLY');
console.log('rows total      :', rows.length);
console.log('NUMBER-ONLY     :', numberOnly.length);

const KINDS = ['"', '“”', "'", '‘’', '`'];

// Non-destructive: every ordered pair of same-kind delimiters, not just adjacent greedy ones.
function allSpans(win) {
  const out = [];
  for (const kind of KINDS) {
    const open = kind[0];
    const close = kind.length > 1 ? kind[1] : kind[0];
    const pos = [];
    for (let i = 0; i < win.length; i++) {
      if (win[i] === open || win[i] === close) pos.push(i);
    }
    for (let a = 0; a < pos.length; a++) {
      for (let b = a + 1; b < pos.length; b++) {
        const inner = win.slice(pos[a] + 1, pos[b]);
        if (inner.length >= 12 && inner.length <= 160 && !inner.includes('\n')) out.push(inner);
      }
    }
  }
  return out;
}

let recoverable = 0;
const examples = [];
for (const r of numberOnly) {
  if (!r.window || !r.titles) continue;
  const spans = allSpans(r.window);
  const hit = spans.find((s) => r.titles.includes(s));
  if (hit) {
    recoverable++;
    if (examples.length < 5) examples.push({ file: r.file, spec: r.spec, title: hit.slice(0, 60) });
  }
}
console.log('\nNUMBER-ONLY rows a NON-DESTRUCTIVE scan would recover:', recoverable);
console.log('(fields available on a row:', Object.keys(rows[0] || {}).join(', '), ')');
for (const e of examples) console.log('  -', e.file, '->', e.spec, '::', e.title);
