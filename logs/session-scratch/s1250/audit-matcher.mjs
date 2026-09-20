// s1250 audit — does drain-block-check's matcher ever resolve a taskFile onto a DIFFERENT leaf,
// and can that ever produce a false CLEAR over a leaf the guard is supposed to refuse?
//
// METHOD: run the REAL script (F-1249-1's lesson: run their instrument, not your model of it)
// once per registered leaf, feeding that leaf's own taskFile — the input shape §3.0 documents.
// Record rc, the headline, and WHICH leaf id the script reported. Compare to the leaf we asked about.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function collect(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const c of node) collect(c, out); return out; }
  if (typeof node.taskFile === 'string') out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === 'object') collect(v, out);
  return out;
}

const leaves = collect(JSON.parse(readFileSync('tasks/goals.json', 'utf8')));
const CLOSED = new Set(['superseded', 'void', 'abandoned', 'stopped']);
const rows = [];

for (const leaf of leaves) {
  const r = spawnSync('node', ['scripts/drain-block-check.mjs', leaf.taskFile], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 20_000,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  // Which leaf did the script actually decide on? Every verdict line prints an [id] or "leaf : id".
  let reported = null;
  let m = out.match(/✅ CLEAR — \S+ \[([^\]]+)\]/);
  if (m) reported = m[1];
  if (!reported) { m = out.match(/⛔ CLOSED — DO NOT DRAIN: \S+ \[([^\]]+)\]/); if (m) reported = m[1]; }
  if (!reported) { m = out.match(/goal leaf\s+: (\S+)\s+\(/); if (m) reported = m[1]; }
  const headline =
    /⛔ BLOCKED/.test(out) ? 'BLOCKED' :
    /⛔ CLOSED/.test(out) ? 'CLOSED' :
    /✅ CLEAR/.test(out) ? 'CLEAR' :
    /\? UNKNOWN/.test(out) ? 'UNKNOWN' : 'OTHER';
  rows.push({
    id: leaf.id, taskFile: leaf.taskFile, status: leaf.status,
    rc: r.status, headline, reported,
    shadowed: reported !== null && reported !== leaf.id,
  });
}

const shadowed = rows.filter((r) => r.shadowed);
// THE DANGEROUS CLASS: we asked about a leaf the guard must refuse, and got an affirmative clearance.
const falseClear = rows.filter((r) => (CLOSED.has(r.status) || r.status === 'blocked') && r.rc === 0);
const closedRows = rows.filter((r) => CLOSED.has(r.status));
const blockedRows = rows.filter((r) => r.status === 'blocked');

const lines = [];
lines.push(`leaves probed: ${rows.length}`);
lines.push(`verdicts: ${JSON.stringify(rows.reduce((a, r) => (a[r.headline] = (a[r.headline] || 0) + 1, a), {}))}`);
lines.push(`rc: ${JSON.stringify(rows.reduce((a, r) => (a['rc' + r.rc] = (a['rc' + r.rc] || 0) + 1, a), {}))}`);
lines.push(`\n== SHADOWED (script decided on a DIFFERENT leaf than the one we asked about): ${shadowed.length}`);
for (const r of shadowed) lines.push(`   ask=${r.id} [${r.status}] file=${r.taskFile}\n       -> reported=${r.reported} verdict=${r.headline} rc=${r.rc}`);
lines.push(`\n== BLOCKED leaves (${blockedRows.length}) probed by own taskFile:`);
for (const r of blockedRows) lines.push(`   ${r.id}  rc=${r.rc}  ${r.headline}  reported=${r.reported}`);
lines.push(`\n== TERMINAL-CLOSED leaves (${closedRows.length}) probed by own taskFile:`);
for (const r of closedRows) lines.push(`   ${r.status.padEnd(11)} ${r.id}  rc=${r.rc}  ${r.headline}  reported=${r.reported}`);
lines.push(`\n== FALSE CLEAR (must-refuse leaf, rc=0): ${falseClear.length}`);
for (const r of falseClear) lines.push(`   !! ${r.id} [${r.status}] ${r.taskFile} -> ${r.headline} rc=${r.rc} reported=${r.reported}`);

const text = lines.join('\n');
console.log(text);
writeFileSync('logs/session-scratch/s1250/audit-matcher-result.txt', text + '\n');
