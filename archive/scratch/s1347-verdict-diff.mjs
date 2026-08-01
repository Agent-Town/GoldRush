// s1347: per-row verdict transitions caused by the F-1347-1 basename-resolution
// patch. The OLD behaviour is reproducible without any file juggling — it is
// exactly probeRow() driven by an exact-path-only reader, which is what
// readIfPresent used to be. So this compares the two readers on the same rows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeRow, makeReader, normalise } from '../../scripts/row-quote-currency.mjs';
import { scan } from '../../scripts/findings-state-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const oldReader = () => (rel) => {
  try {
    const abs = path.join(ROOT, rel);
    if (!fs.statSync(abs).isFile()) return null;
    return normalise(fs.readFileSync(abs, 'utf8'));
  } catch { return null; }
};

const text = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
const lines = text.split('\n');
const byLine = new Map();
for (const [id, st] of scan(text)) {
  for (const ln of st.open) {
    if (!byLine.has(ln)) byLine.set(ln, []);
    byLine.get(ln).push(id);
  }
}

const moves = new Map();
for (const [ln, ids] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
  const row = lines[ln - 1];
  const before = probeRow(row, oldReader());
  const after = probeRow(row, makeReader());
  const key = `${before.verdict} -> ${after.verdict}`;
  if (!moves.has(key)) moves.set(key, []);
  moves.get(key).push({ ln, ids: ids.join(','), before, after });
}
for (const [key, rows] of [...moves.entries()].sort()) {
  console.log(`\n=== ${key}  (${rows.length} rows) ===`);
  for (const r of rows) {
    const chk = (v) => `${v.absent.length}/${v.absent.length + v.present.length}`;
    console.log(`  L${r.ln} ${r.ids}  quotes gone ${chk(r.before)} -> ${chk(r.after)}`);
  }
}
