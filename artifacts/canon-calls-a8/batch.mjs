// Era-aging portrait batch (owner 2026-09-06: "lets use the higgsfield credits… go hard"). Canon: lore/STORYBOOK.md THE LAWS OF TIME
// (townsfolk age ~12-15 years per era), lore/characters.md (the Elder passes in early E2; Chen Mei = first editor E2+; the Chen family
// works the Gazette House). Same QA as rows 72/73: mean R-B over TL/TR 60x60 corners in 124-145, both corners > 120, retakes up to 10.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
const OUT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/era-aging-3';
mkdirSync(`${OUT}/attempts`, { recursive: true });
const LOG = `${OUT}/batch.jsonl`;
const log = (o) => writeFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...o }) + '\n', { flag: 'a' });
const UPLOADS = `${OUT}/uploads.json`;
const uploads = existsSync(UPLOADS) ? JSON.parse(readFileSync(UPLOADS, 'utf8')) : {};
// The CLI refuses local paths and URLs as references; it wants an upload id from `higgsfield upload create`. Cache one id per file.
function uploadId(file) {
  const key = `${file}:${statSync(file).size}`;
  if (uploads[key]) return uploads[key];
  try { const out = execFileSync('higgsfield', ['upload', 'create', file], { encoding: 'utf8', timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] }); const id = (out.match(/[0-9a-f-]{36}/) || [])[0]; if (id) { uploads[key] = id; writeFileSync(UPLOADS, JSON.stringify(uploads, null, 1)); log({ upload: file, id }); return id; } log({ upload: file, error: 'no id in output', out: out.slice(0, 200) }); } catch (e) { log({ upload: file, error: String(e.stderr || e.message).slice(0, 200) }); }
  return null;
}
const ANCHOR = 'Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on NEUTRAL AGED PARCHMENT ground, shoulders-up, no letters, no gore, reads at 120px.';
const BACK = 'Plain aged parchment fills the whole frame behind the figure: warm honey-tan paper, no sky, no sea, no scene; the era shows only in clothing, tools and the lines of the face; no firearms, no letters, no numbers.';
const TEA = 'Warm sepia and ochre only; the paper behind the figure is the colour of weak tea: distinctly warm honey-tan, red clearly stronger than blue in every corner, never grey, never cool, never neutral white; the whole image is a warm monochrome sepia plate.';
const ref = (name) => `assets/processed/townsfolk-${name}.png`;
const raw = (slug) => `assets/raw/tf-${slug}.png`; // a plate this batch produced earlier: chain references so a new face stays one person across eras
const E2 = 'Steamworks era dress: waistcoat, rolled sleeves, brass fittings, a little soot.';
const E3 = 'Voltage era dress: a linesman\'s belt, wire coils and dynamo brass at the collar, a small glass bulb.';
const E4 = 'Motor frontier dress: driving goggles pushed up, a long dust coat, oil on the cuffs.';
const E1 = 'Frontier era dress: homespun wool, a knitted shawl over thin shoulders, a plain high collar, a chalk stub in one hand and chalk dust on the fingers.';
const FACES = [
  ['elder-woman-e1', 13, null, "The Elder, the town's memory and schoolhouse mentor: an OLD WOMAN, dry and kind and brief, silver hair pinned back, deep laugh lines, clear steady eyes, a chalk stub in one hand. " + E1],
  ['elder-woman-e2', 13, 'raw:elder-woman-e1', "The same Elder in her last era: frailer and brighter-eyed, the shawl drawn closer, the chalk stub still in her hand, dry and kind. " + E2],
];
async function corners(file) {
  const img = sharp(file); const { width, height } = await img.metadata();
  const win = Math.round(Math.min(width, height) * 60 / 1024);
  const stat = async (left) => { const { data } = await img.clone().extract({ left, top: 0, width: win, height: win }).raw().toBuffer({ resolveWithObject: true }); let s = 0, n = 0; for (let i = 0; i + 2 < data.length; i += 3) { s += data[i] - data[i + 2]; n += 1; } return s / n; };
  const tl = await stat(0), tr = await stat(width - win); return { tl: +tl.toFixed(1), tr: +tr.toFixed(1), mean: +((tl + tr) / 2).toFixed(1), width, height };
}
for (const [slug, years, reference, role] of FACES) {
  const target = `assets/raw/tf-${slug}.png`;
  if (existsSync(target)) { log({ slug, skipped: 'exists' }); continue; }
  const reference2 = reference && reference.startsWith('raw:') ? `assets/raw/tf-${reference.slice(4)}.png` : reference;
  const refClause = reference2 && existsSync(reference2) ? `This is the SAME PERSON as the reference portrait, ${years} years older: keep the face, features, build and bearing exactly as in the reference; age the face and hair believably; change only the era's clothing and tools. ` : '';
  if (reference2 && !existsSync(reference2)) log({ slug, warning: `reference missing ${reference2}` });
  const prompt = `${ANCHOR} ${BACK} ${refClause}${role} ${TEA}`;
  let accepted = null;
  for (let attempt = 1; attempt <= 10 && !accepted; attempt += 1) {
    const args = ['generate', 'create', 'gpt_image_2', '--prompt', prompt, '--aspect_ratio', '1:1', '--resolution', '1k', '--quality', 'high', '--wait', '--wait-timeout', '10m'];
    if (refClause) { const id = uploadId(reference2); if (!id) { log({ slug, attempt, error: 'upload failed for ' + reference }); break; } args.push('--image-references', id); }
    let out = '';
    try { out = execFileSync('higgsfield', args, { encoding: 'utf8', timeout: 720000, stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { log({ slug, attempt, error: String(e.stderr || e.message).slice(0, 300) }); await new Promise((d) => setTimeout(d, 15000)); continue; }
    const url = (out.match(/https:\/\/[^\s"']+\.(png|jpg|jpeg|webp)[^\s"']*/i) || [])[0];
    if (!url) { log({ slug, attempt, error: 'no url in output', out: out.slice(0, 300) }); continue; }
    const file = `${OUT}/attempts/${slug}-${attempt}.png`;
    try { execFileSync('curl', ['-sSL', '-o', file, url], { timeout: 120000 }); } catch (e) { log({ slug, attempt, error: 'download failed' }); continue; }
    const c = await corners(file);
    const ok = c.mean >= 124 && c.mean <= 145 && c.tl > 120 && c.tr > 120 && c.width >= 1000;
    log({ slug, attempt, url, ...c, accepted: ok, referenced: !!refClause });
    if (ok) { copyFileSync(file, target); accepted = attempt; }
  }
  log({ slug, done: true, accepted });
}
log({ batch: 'done' });
