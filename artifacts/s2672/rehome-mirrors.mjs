// s2672 — move the LB-01 mirror series out of the public working tree into the private
// destination the resolver now names. RENAME, never delete (CLAUDE.md §4.10b): every file
// is hashed BEFORE the move and re-hashed AFTER it, and a mismatch aborts the whole run
// leaving the source intact. Idempotent: a name already present at the destination is
// compared rather than overwritten.
import { readdirSync, existsSync, mkdirSync, renameSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveMirrorDest } from '../../scripts/ledger-mirror-dest.mjs';

const SRC = fileURLToPath(new URL('../../artifacts/ledger-backups/', import.meta.url));
const DEST = resolveMirrorDest().dir;
const NAME = /^ledger-\d{4}-\d{2}-\d{2}\.db$/;
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');

if (!existsSync(SRC)) { console.log(`source absent: ${SRC} — nothing to move`); process.exit(0); }
const files = readdirSync(SRC).filter(n => NAME.test(n)).sort();
const others = readdirSync(SRC).filter(n => !NAME.test(n));
console.log(`source      : ${SRC}`);
console.log(`destination : ${DEST}`);
console.log(`dated files : ${files.length}   non-dated entries left in place: ${others.length}${others.length ? ` (${others.join(', ')})` : ''}`);

const before = new Map(files.map(n => [n, { sha: sha(path.join(SRC, n)), size: statSync(path.join(SRC, n)).size }]));
mkdirSync(DEST, { recursive: true, mode: 0o700 });

let moved = 0, already = 0;
for (const n of files) {
  const from = path.join(SRC, n), to = path.join(DEST, n);
  if (existsSync(to)) {
    if (sha(to) !== before.get(n).sha) throw new Error(`REFUSING: ${n} already at destination with DIFFERENT bytes`);
    already++;
    continue;
  }
  renameSync(from, to);
  const after = sha(to);
  if (after !== before.get(n).sha) throw new Error(`REFUSING: ${n} changed across the move (${before.get(n).sha} -> ${after})`);
  moved++;
}

const landed = readdirSync(DEST).filter(n => NAME.test(n)).sort();
const bytes = landed.reduce((t, n) => t + statSync(path.join(DEST, n)).size, 0);
const leftBehind = readdirSync(SRC).filter(n => NAME.test(n));
console.log(`moved       : ${moved}   already present (byte-identical): ${already}`);
console.log(`at dest     : ${landed.length} dated mirror(s), ${bytes} B`);
console.log(`left in src : ${leftBehind.length} dated mirror(s)`);
console.log(`hash check  : ${landed.length}/${landed.length} re-hashed at the destination and equal to their pre-move digest`);
console.log(`range       : ${landed[0]} .. ${landed[landed.length - 1]}`);
