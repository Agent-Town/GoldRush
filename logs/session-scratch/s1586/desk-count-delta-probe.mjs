#!/usr/bin/env node
/**
 * s1586 probe — the distribution of |declared - parsed| across every desk
 * STATUS.md has ever carried.
 *
 * WHY: F-1584-2 prescribes "compare the header's `— <n> awaiting a word`
 * against deskItems(tail).length and refuse on mismatch". But
 * desk-carryforward-guard.mjs:244-256 ALREADY computes that comparison and
 * deliberately keeps it advisory, citing an s1533 measurement: "60 post-cure
 * desks that state a count: 11 agree and 49 do not, nearly all by exactly one".
 *
 * So the question is not "does it mismatch" (known: usually) but "is the
 * s1583 catastrophe (declared 23, parsed 1) SEPARABLE from the ordinary
 * off-by-one noise". If the distribution is bimodal, a threshold refusal is
 * defensible with numbers. If it is a smooth tail, it is not.
 *
 * Imports the guard's OWN parser rather than retyping the regexes — a
 * hand-written twin returns a false 0 instead of an error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { deskTail, deskItems } from '../../../scripts/desk-carryforward-guard.mjs';

const ROOT = path.resolve(process.argv[2] || process.cwd());
const text = fs.readFileSync(path.join(ROOT, 'STATUS.md'), 'utf8');

const rows = [];
text.split('\n').forEach((line, i) => {
  // Every line-1 the file has ever held: the live one (line 0) plus every
  // archived handoff/lock bullet.
  const isLive = i === 0;
  const m = line.match(/^- \*\*s(\d+) (handoff \(line-1 archive\)|lock line \(archived\))/);
  if (!isLive && !m) return;
  const tail = deskTail(line);
  if (!tail) return;
  const dm = tail.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
  if (!dm) return; // no declared count -> nothing to compare
  const declared = Number(dm[1]);
  const parsed = deskItems(tail).length;
  rows.push({
    session: isLive ? 'LIVE' : m[1],
    line: i + 1,
    declared,
    parsed,
    delta: declared - parsed,
  });
});

const hist = new Map();
for (const r of rows) hist.set(r.delta, (hist.get(r.delta) || 0) + 1);

console.log(`desks stating a count : ${rows.length}`);
console.log(`exact agreement       : ${rows.filter((r) => r.delta === 0).length}`);
console.log('');
console.log('delta (declared - parsed) histogram:');
for (const d of [...hist.keys()].sort((a, b) => a - b)) {
  console.log(`  ${String(d).padStart(4)} : ${String(hist.get(d)).padStart(3)}  ${'#'.repeat(Math.min(60, hist.get(d)))}`);
}
console.log('');
for (const t of [1, 2, 3, 4, 5, 6, 8, 10, 15, 20]) {
  const over = rows.filter((r) => Math.abs(r.delta) > t);
  console.log(
    `threshold |delta| > ${String(t).padStart(2)} : ${String(over.length).padStart(3)} desk(s) would REFUSE ` +
      `(${((over.length / rows.length) * 100).toFixed(1)}%)`,
  );
}
console.log('');
console.log('the worst offenders:');
for (const r of [...rows].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 12)) {
  console.log(`  s${r.session} (STATUS.md:${r.line})  declared ${r.declared} · parsed ${r.parsed} · delta ${r.delta}`);
}
