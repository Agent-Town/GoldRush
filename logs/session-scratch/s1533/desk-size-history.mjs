#!/usr/bin/env node
/** s1533 scratch — desk size per fire, to locate the s1414 drop. */
import fs from 'node:fs';

const status = fs.readFileSync(`${process.cwd()}/STATUS.md`, 'utf8').split('\n');
const FINDING = /F-[A-Z0-9]{2,4}-\d+|F-\d{3,4}-\d+/g;
const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;

const rows = [];
for (const line of status) {
  const m = line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/);
  if (!m) continue;
  const s = Number(m[1]);
  const hits = [...line.matchAll(DESK_WORD)];
  if (!hits.length) { rows.push({ s, n: null }); continue; }
  const tail = line.slice(hits[hits.length - 1].index);
  const ids = new Set(tail.match(FINDING) || []);
  // the declared count, if the header states one ("— 8 awaiting a word")
  const declared = tail.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
  rows.push({ s, n: ids.size, declared: declared ? Number(declared[1]) : null, ids: [...ids] });
}
rows.sort((a, b) => a.s - b.s);
const window = rows.filter((r) => r.s >= 1400 && r.s <= 1533);
for (const r of window) {
  console.log(
    `s${r.s}  ids:${r.n === null ? 'no-desk-header' : String(r.n).padStart(2)}` +
      `${r.declared !== null ? `  header-says:${r.declared}` : ''}`,
  );
}
