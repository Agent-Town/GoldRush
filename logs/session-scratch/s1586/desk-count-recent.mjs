#!/usr/bin/env node
/** s1586 — the same measurement, listed newest-first, to price a gate against CURRENT practice. */
import fs from 'node:fs';
import path from 'node:path';
import { deskTail, deskItems } from '../../../scripts/desk-carryforward-guard.mjs';

const ROOT = path.resolve(process.argv[2] || process.cwd());
const text = fs.readFileSync(path.join(ROOT, 'STATUS.md'), 'utf8');

const rows = [];
text.split('\n').forEach((line, i) => {
  const isLive = i === 0;
  const m = line.match(/^- \*\*s(\d+) (handoff \(line-1 archive\)|lock line \(archived\))/);
  if (!isLive && !m) return;
  const tail = deskTail(line);
  if (!tail) return;
  const dm = tail.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
  const parsed = deskItems(tail).length;
  rows.push({
    session: isLive ? 9999 : Number(m[1]),
    label: isLive ? 'LIVE' : `s${m[1]}`,
    declared: dm ? Number(dm[1]) : null,
    parsed,
  });
});

rows.sort((a, b) => b.session - a.session);
console.log('newest 40 desks (a null declared = header states no count):');
for (const r of rows.slice(0, 40)) {
  const d = r.declared;
  const delta = d === null ? null : d - r.parsed;
  const flag = delta === null ? '   ' : Math.abs(delta) > 1 ? '❌ ' : '✅ ';
  console.log(
    `  ${flag}${r.label.padEnd(7)} declared ${String(d ?? '—').padStart(3)} · parsed ${String(r.parsed).padStart(3)}` +
      (delta === null ? '' : ` · delta ${delta}`),
  );
}

const counted = rows.filter((r) => r.declared !== null);
const last25 = counted.slice(0, 25);
const bad = last25.filter((r) => Math.abs(r.declared - r.parsed) > 1);
console.log('');
console.log(`last 25 counted desks : ${bad.length} would REFUSE at tolerance ±1 (${((bad.length / last25.length) * 100).toFixed(0)}%)`);
console.log(`  offenders: ${bad.map((r) => `${r.label}(${r.declared - r.parsed})`).join(' ') || 'none'}`);
