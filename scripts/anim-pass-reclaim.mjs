#!/usr/bin/env node
/**
 * anim-pass-reclaim.mjs — THE EIGHT WINDS (2026-07-28), repair arm for F-EW-2.
 *
 * The first fan-out claimed its output by MTIME while five arms wrote into the
 * same ~/.codex/generated_images tree, so every run adopted its neighbours' art
 * too. Nothing was lost — the CLI banner in each `<out>.codex.log` records the
 * session id, and the arm writes only under that session's directory. This
 * re-derives every claim from the log, rewrites the primary PNG, and moves the
 * mis-claimed `-altN` copies to `_misclaimed/` rather than deleting them
 * (CLAUDE.md §4.10 archive-instead-of-delete).
 *
 *   node scripts/anim-pass-reclaim.mjs [--dir reviews/eight-winds/gen] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const A = process.argv.slice(2);
const arg = (k, d) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const dir = arg('--dir', 'reviews/eight-winds/gen');
const dry = A.includes('--dry');
const GEN = path.join(os.homedir(), '.codex', 'generated_images');
const attic = path.join(dir, '_misclaimed');

let fixed = 0, same = 0, moved = 0, missing = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.codex.log')).sort()) {
  const stem = f.replace(/\.codex\.log$/, '');
  const log = fs.readFileSync(path.join(dir, f), 'utf8');
  const session = /session id:\s*([0-9a-f-]{36})/i.exec(log)?.[1];
  if (!session) { console.log(`?? ${stem}: no session id in log`); missing++; continue; }
  const sdir = path.join(GEN, session);
  if (!fs.existsSync(sdir)) { console.log(`?? ${stem}: session dir gone (${session})`); missing++; continue; }
  const imgs = fs.readdirSync(sdir).filter((n) => /\.(png|jpg|jpeg|webp)$/i.test(n)).sort();
  if (!imgs.length) { console.log(`?? ${stem}: session ${session} has no image`); missing++; continue; }
  const truth = path.join(sdir, imgs[0]);
  const primary = path.join(dir, `${stem}.png`);
  const wasRight = fs.existsSync(primary)
    && fs.readFileSync(primary).equals(fs.readFileSync(truth));
  if (wasRight) same++;
  else { console.log(`FIX ${stem}.png ← ${session}/${imgs[0]}`); fixed++; if (!dry) fs.copyFileSync(truth, primary); }
  if (imgs.length > 1) console.log(`    note: session ${session} holds ${imgs.length} images; took ${imgs[0]}`);
  // every -altN under this stem was somebody else's art
  for (const alt of fs.readdirSync(dir).filter((n) => n.startsWith(`${stem}-alt`) && n.endsWith('.png'))) {
    if (!dry) { fs.mkdirSync(attic, { recursive: true }); fs.renameSync(path.join(dir, alt), path.join(attic, alt)); }
    moved++;
  }
}
console.log(`\n${fixed} primaries corrected · ${same} already correct · ${moved} mis-claimed copies moved to ${attic} · ${missing} unresolved${dry ? '  (--dry: nothing written)' : ''}`);
