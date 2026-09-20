#!/usr/bin/env node
/**
 * s1535 — price the F-1534-2 cure BEFORE building it (the F-1534-1 discipline).
 *
 * NEXT(B) says: add "the SLUG shape to desk-declaration-guard reusing
 * desk-carryforward-guard.mjs's validated pattern". But the two guards parse the
 * desk DIFFERENTLY:
 *   - desk-declaration-guard: FLAT match over the whole desk tail (deliberate,
 *     s1334 — it wants ids riding inside other items' prose).
 *   - desk-carryforward-guard: 🔺-SEGMENT anchored, first-key-wins, KEY_ZONE 120.
 * For F-IDs the flat read is a feature. For SLUGS it may be a catastrophe: a
 * backtick in this repo's prose is usually a FILE PATH, not a desk item.
 *
 * Measure both arms before choosing.
 */
import fs from 'node:fs';

const ROOT = process.cwd();
const line1 = fs.readFileSync(`${ROOT}/logs/session-scratch/s1535/prev-line1.txt`, 'utf8').trim();
const backlog = fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8');

const DESK_WORD = /OWNER(?:'S|’S|S)? DESK/g;
const FINDING = /F-(?:[A-Z0-9]{1,8}-)+\d+/;
const FINDING_G = /F-(?:[A-Z0-9]{1,8}-)+\d+/g;
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;
const SLUG_G = /`([a-z0-9][a-z0-9-]{6,})`/g;
const KEY_ZONE = 120;
const SUBJECT_CHARS = 90;

const hits = [...line1.matchAll(DESK_WORD)];
if (!hits.length) { console.error('no desk word'); process.exit(2); }
const tail = line1.slice(hits[hits.length - 1].index);
console.log('desk tail chars:', tail.length);

// --- ARM A: flat, the way desk-declaration-guard reads F-IDs today ------------
const flatF = [...new Set(tail.match(FINDING_G) || [])];
const flatS = [...new Set([...tail.matchAll(SLUG_G)].map((m) => m[1]))];
console.log('\n--- ARM A: FLAT over the whole tail ---');
console.log('F-IDs:', flatF.length);
console.log('SLUG hits:', flatS.length);
for (const s of flatS) console.log('   ', s);

// --- ARM B: 🔺-segment anchored, carryforward's validated parser -------------
const segKeys = [];
for (const seg of tail.split('🔺').slice(1)) {
  const head = seg.slice(0, KEY_ZONE);
  const f = head.match(FINDING);
  const s = head.match(SLUG);
  if (f && (!s || f.index <= s.index)) segKeys.push({ key: f[0], type: 'F' });
  else if (s) segKeys.push({ key: s[1], type: 'SLUG' });
  else segKeys.push({ key: null, type: 'UNKEYED', head: head.slice(0, 70) });
}
const uniq = [];
const seen = new Set();
for (const k of segKeys) { if (k.key && !seen.has(k.key)) { seen.add(k.key); uniq.push(k); } }
console.log('\n--- ARM B: 🔺-segment anchored (KEY_ZONE 120) ---');
console.log('segments:', segKeys.length, '· keyed unique:', uniq.length,
  '· unkeyed:', segKeys.filter((k) => !k.key).length);
for (const k of segKeys.filter((x) => !x.key)) console.log('    UNKEYED:', k.head);
const bSlugs = uniq.filter((k) => k.type === 'SLUG').map((k) => k.key);
const bFinds = uniq.filter((k) => k.type === 'F').map((k) => k.key);
console.log('  F-keyed:', bFinds.length, '· SLUG-keyed:', bSlugs.length);
for (const s of bSlugs) console.log('    SLUG:', s);

// --- declaration lookup, exactly as the guard does it -------------------------
function declaredIds(text, pattern) {
  const found = new Map();
  text.split('\n').forEach((line, i) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const zone = body.slice(0, SUBJECT_CHARS);
    const m = zone.match(pattern);
    const first = m ? (m[1] ?? m[0]) : null;
    if (first && !found.has(first)) found.set(first, i + 1);
  });
  return found;
}
const declF = declaredIds(backlog, FINDING);
const declS = declaredIds(backlog, SLUG);

console.log('\n--- DECLARATION STATUS of ARM B slug keys ---');
for (const s of bSlugs) {
  console.log(`  ${declS.has(s) ? 'ROW  @' + declS.get(s) : 'NONE '}  ${s}`);
}
console.log('\n--- DECLARATION STATUS of ARM A extra slug hits (flat only) ---');
const extra = flatS.filter((s) => !bSlugs.includes(s));
console.log('flat-only slug hits that ARM B does NOT treat as desk items:', extra.length);
for (const s of extra) {
  console.log(`  ${declS.has(s) ? 'ROW  @' + declS.get(s) : 'NONE '}  ${s}`);
}
const extraUndecl = extra.filter((s) => !declS.has(s));
console.log('\n>>> ARM A would red the battery on', extraUndecl.length, 'extra items');
console.log('>>> ARM B would red the battery on',
  bSlugs.filter((s) => !declS.has(s)).length, 'items');
