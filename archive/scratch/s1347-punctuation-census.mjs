// s1347 measurement for F-1347-2: how many ABSENT quotes are absent ONLY because
// the row adjusted the quote's terminal punctuation to close its own sentence?
// Found by hand on F-1289-1: the ledger quotes "...refuse a re-queue." while
// scripts/goal-tracker.test.mjs:47 reads "...refuse a re-queue, and while".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeRow, makeReader, normalise } from '../../scripts/row-quote-currency.mjs';
import { scan } from '../../scripts/findings-state-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const text = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
const lines = text.split('\n');
const openLines = new Set();
for (const [, st] of scan(text)) for (const ln of st.open) openLines.add(ln);

const bodies = new Map();
const read = (rel) => {
  if (!bodies.has(rel)) {
    try { bodies.set(rel, normalise(fs.readFileSync(path.join(ROOT, rel), 'utf8'))); }
    catch { bodies.set(rel, null); }
  }
  return bodies.get(rel);
};

let absentTotal = 0, rescued = 0;
const hits = [];
for (const ln of [...openLines].sort((a, b) => a - b)) {
  const r = probeRow(lines[ln - 1], makeReader());
  if (r.verdict !== 'ABSENT') continue;
  // Re-resolve the row's readable paths the same way the probe does.
  const rd = makeReader();
  const readable = r.paths.filter((p) => rd(p) !== null).map((p) => rd.notes.get(p).path);
  for (const a of r.absent) {
    absentTotal++;
    const n = normalise(a.quote);
    // Relax ONLY the terminal punctuation the quoter would have adjusted.
    const trimmed = n.replace(/[.,;:!?]+$/, '');
    if (trimmed === n) continue;
    const hit = readable.find((p) => (read(p) || '').includes(trimmed));
    if (hit) { rescued++; hits.push(`L${ln}  ${hit}\n     quoted: "${n.slice(0, 90)}"`); }
  }
}
console.log(`ABSENT quotes ${absentTotal} | rescued by relaxing terminal punctuation ONLY: ${rescued}`);
console.log(hits.join('\n'));
