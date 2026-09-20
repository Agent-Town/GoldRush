#!/usr/bin/env node
// ITEM 3 — LOSSLESS RE-ENCODE of the portrait/plate set the 2026-09-12 review named
// ("Free bytes on the table", 93 families pixel-identical to main and merely re-encoded larger on
// the branch). Stage 1 HELD all of them, so main still carries MAIN's encoding; there is no branch
// bloat left to undo and the only bytes on offer are what a stronger lossless encoder finds.
// Every output is verified pixel-identical to its input on all four channels before it is kept.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const ZOPFLI = '/opt/homebrew/anaconda3/bin/zopflipng';
const TMP = process.env.TMP_DIR || '/tmp/reenc';
const APPLY = process.env.APPLY === '1';
fs.mkdirSync(TMP, { recursive: true });
const files = process.argv.slice(2);
let before = 0, after = 0, shrunk = 0, held = 0;
const rows = [];
for (const f of files) {
  const src = fs.readFileSync(f);
  const dst = path.join(TMP, path.basename(f));
  try { fs.unlinkSync(dst); } catch {}
  execFileSync(ZOPFLI, ['-y', f, dst], { stdio: 'pipe' });
  const out = fs.readFileSync(dst);
  const a = PNG.sync.read(src), b = PNG.sync.read(out);
  if (a.width !== b.width || a.height !== b.height) throw new Error(`${f}: dimensions moved`);
  for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) throw new Error(`${f}: NOT pixel-identical at byte ${i}`);
  before += src.length;
  if (out.length < src.length) { after += out.length; shrunk++; if (APPLY) fs.writeFileSync(f, out); rows.push([path.basename(f), src.length, out.length]); }
  else { after += src.length; held++; }
}
console.log(JSON.stringify({ files: files.length, shrunk, held, before, after, saved: before - after, rows }, null, 1));
