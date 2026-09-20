// Lossless re-encode of this batch's OWN cells only (zopflipng, no --lossy_transparent: the RGB under
// transparent pixels is extract-alpha's bleed, i.e. the halo cure, and lossy_transparent eats it).
// Every file is verified pixel-identical on all four channels before it replaces the original.
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { PNG } from 'pngjs';
const ZOPFLI = '/opt/homebrew/anaconda3/bin/zopflipng';
export function losslessShrink(files) {
  let before = 0, after = 0; const rows = [];
  for (const f of files) {
    const b = statSync(f).size;
    const tmp = `${f}.zopfli.png`;
    try { execFileSync(ZOPFLI, ['-y', f, tmp], { stdio: 'pipe' }); } catch { rows.push({ file: f, skipped: 'zopfli failed' }); before += b; after += b; continue; }
    const A = PNG.sync.read(readFileSync(f)), B = PNG.sync.read(readFileSync(tmp));
    let diff = 0;
    if (A.width !== B.width || A.height !== B.height) diff = -1;
    else for (let i = 0; i < A.data.length; i += 1) if (A.data[i] !== B.data[i]) { diff += 1; }
    const a = statSync(tmp).size;
    if (diff === 0 && a < b) { unlinkSync(f); renameSync(tmp, f); rows.push({ file: f.split('/').pop(), before: b, after: a }); before += b; after += a; }
    else { unlinkSync(tmp); rows.push({ file: f.split('/').pop(), before: b, after: b, kept: diff === 0 ? 'no gain' : `PIXELS DIFFER (${diff})` }); before += b; after += b; }
  }
  return { files: rows, before, after, saved: before - after };
}
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain && process.argv[2]) console.log(JSON.stringify(losslessShrink(process.argv.slice(2)), null, 1));
