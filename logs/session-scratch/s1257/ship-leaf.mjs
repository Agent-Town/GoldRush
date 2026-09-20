#!/usr/bin/env node
// s1257 — Goal Registration Law: flip the gg-03e leaf to shipped with its merge hash.
// Also retires the s1256 pre-read note into a drainNote recording how it resolved
// (half-retiring it would be worse than none).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const p = resolve(repo, 'tasks/goals.json');
const raw = readFileSync(p, 'utf8');
const data = JSON.parse(raw);

const MERGE = '8133dd91';
let hit = null;
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { n.forEach(walk); return; }
  if (n.id === 'gg-03e-herald-class-map-engravings') hit = n;
  Object.values(n).forEach(walk);
})(data);

if (!hit) { console.error('leaf not found'); process.exit(1); }

hit.status = 'shipped';
hit.mergeHash = MERGE;
hit.review = 'reviews/gg-03e-herald-class-map-engravings.md';
delete hit.note_s1256;
hit.drainNotes = [
  'DRAINED s1257 -> ' + MERGE + '. Gates green; budgets untouched (dev-path 1,158,214 B of 1,500,000; spot cuts 375,470 B).',
  'F-1256-2 RESOLVED AND CONFIRMED: the master premise ("no herald-engraving-*.webp exists; the map resolves to nothing") was FALSE -- the seven were tracked on main since 15e00755. scripts/asset-diet.mjs was checked FIRST as that finding ordered: its 6 lines move the roster-count invariant 13->14 and its comment, NOT a budget. Reading filesReachedByHeraldGlobs shows the bump was REQUIRED by the eighth file (it throws on any missing/unexpected name), so the build-time guard -- not the e2e spec -- is what covers the master mapping trap.',
  'WHAT ACTUALLY SHIPPED, narrower than the master claims: +ceremony on HeraldClass and in the map, +1 plate (44,514 B), a decode() assertion at gazette-art-wiring.spec.ts:111, the 13->14 invariant, and a needless re-encode of the seven working plates (+13,794 B, 384x384 unchanged) = F-1257-1. NOT a no-op; player-INVISIBLE, so GZ-01 was correctly not appended.',
  'F-1257-2: 4 of 8 classes are emitted by news/herald.json today (board, river, schoolhouse, ledger); trail, boss, town-growth, ceremony are mapped and resolve in dist but no item emits them, so the LEDGER "INTEGRATED ... eight wired" row is true of the MAP, not of the camera. ceremony is content-gated, not code-gated.',
  'The 2 gz-h1-newsie reds are PRE-EXISTING, proven by a clean-main control (graft parked, subject absence verified at the index, identical failure: same :106, same toHaveText, same "Chen Mei"/"Juniper") -- not merely matched against suite-red-inventory row 40 (42.1% BOTH), because this slice edits the closure that suite imports.',
  'CARRIED: F-1255-4 owner eyeball on the brass agent in the town-growth plate -- and note it is one of the four classes NOT currently emitted, so it is not yet on camera.',
];

const trailing = raw.endsWith('\n') ? '\n' : '';
writeFileSync(p, JSON.stringify(data, null, 2) + trailing);
console.log('leaf gg-03e -> shipped @', MERGE, '| note_s1256 retired into', hit.drainNotes.length, 'drainNotes');
