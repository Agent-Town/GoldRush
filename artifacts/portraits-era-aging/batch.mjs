// Era-aging portrait batch (owner 2026-09-06: "lets use the higgsfield credits… go hard"). Canon: lore/STORYBOOK.md THE LAWS OF TIME
// (townsfolk age ~12-15 years per era), lore/characters.md (the Elder passes in early E2; Chen Mei = first editor E2+; the Chen family
// works the Gazette House). Same QA as rows 72/73: mean R-B over TL/TR 60x60 corners in 124-145, both corners > 120, retakes up to 10.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
const OUT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/era-aging';
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
const FACES = [
  // E2: thirteen years on
  ['newsie-e2', 0, null, `Chen Mei at twenty-five, the Gazette House's first editor: a young Chinese-American woman with a round open face, dark hair in a short braid, the plaza newsie's cap traded for an editor's green eyeshade, ink on her fingers, a folded broadsheet under her arm with no legible print, keen and quick. ${E2}`],
  ['elder-e2', 13, ref('elder'), `The Elder in her last era: frailer and brighter-eyed, a shawl over thin shoulders, a chalk stub in one hand, dry and kind. ${E2}`],
  ['tavernkeeper-e2', 13, ref('tavernkeeper'), `The tavernkeeper thirteen years on: heavier, warmer, a bar towel over the shoulder, the quest-giver's easy welcome. ${E2}`],
  ['clerk-e2', 13, ref('assay-clerk'), `The assay clerk thirteen years on: sleeve garters, a small brass balance in hand, the numbers-lover's narrowed eyes. ${E2}`],
  ['preacher-e2', 13, ref('preacher'), `The preacher thirteen years on: a plain coat, a bell-rope callus on the hand, courage rather than judgment in the face. ${E2}`],
  ['schoolteacher-e2', 13, ref('schoolteacher'), `The schoolteacher thirteen years on: spectacles, a slate held to the chest, a good question behind the eyes. ${E2}`],
  ['boilerwright-e2', 0, null, `The Boilerwright of the Steamworks: a broad-shouldered woman in a leather apron and rolled sleeves, soot on one cheekbone, a brass pressure gauge on a chain around her neck, a spanner in the apron pocket, steady eyes. ${E2}`],
  ['pressman-e2', 0, null, `Chen Wei, the Gazette House pressman: a Chinese-American man in his fifties, ink-black hands, a printer's apron, patient and proud. ${E2}`],
  ['typesetter-e2', 0, null, `Chen Lan, the Gazette House typesetter and office: a Chinese-American woman in her late forties, spectacles on a cord, a composing stick in one hand and a ledger under the other arm, the face of someone who knows everything first. ${E2}`],
  // E3: twenty-six years on
  ['newsie-e3', 13, raw('newsie-e2'), `Chen Mei at thirty-eight, the Gazette's editor in the Voltage age: the first grey at the temple, ink still on her fingers, an editor's eyeshade, quick and sure. ${E3}`],
  ['tavernkeeper-e3', 26, ref('tavernkeeper'), `The tavernkeeper twenty-six years on: grey in the beard, the same easy welcome, a lit glass bulb behind the bar's shadow. ${E3}`],
  ['clerk-e3', 26, ref('assay-clerk'), `The assay clerk twenty-six years on: greying, spectacles now, a brass balance and a coil of wire on the desk edge. ${E3}`],
  ['preacher-e3', 26, ref('preacher'), `The preacher twenty-six years on: white at the temples, a plain coat, the same steady courage. ${E3}`],
  ['schoolteacher-e3', 26, ref('schoolteacher'), `The schoolteacher twenty-six years on: silver hair pinned up, spectacles, a slate and a small glass bulb, the lantern of a good question. ${E3}`],
  // E4: thirty-nine years on
  ['newsie-e4', 13, raw('newsie-e3'), `Chen Mei at fifty-one, silver-templed, still the Gazette's editor at the motor frontier: driving goggles pushed up over the eyeshade, a folded broadsheet with no legible print. ${E4}`],
  ['tavernkeeper-e4', 39, ref('tavernkeeper'), `The tavernkeeper thirty-nine years on: old now, white-bearded, still behind the bar, the welcome unchanged. ${E4}`],
  ['clerk-e4', 39, ref('assay-clerk'), `The assay clerk thirty-nine years on: old, thin, spectacles, the brass balance polished by decades. ${E4}`],
  ['schoolteacher-e4', 39, ref('schoolteacher'), `The schoolteacher thirty-nine years on: old, white hair, a slate worn smooth, kind and exact. ${E4}`],
  // E10: a new face the Baron's own line names
  ['old-digger-e10', 0, null, 'The Old Digger of the red world: an ancient man, sun-cracked skin, a wide-brimmed hat, a worn spade handle at his shoulder, red dust in the creases of his coat, eyes that have kept a canal right for decades. Deep Sky era dress: a patched pressure coat, no helmet.'],
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
  const refClause = reference && existsSync(reference) ? `This is the SAME PERSON as the reference portrait, ${years} years older: keep the face, features, build and bearing exactly as in the reference; age the face and hair believably; change only the era's clothing and tools. ` : '';
  if (reference && !existsSync(reference)) log({ slug, warning: `reference missing ${reference}` });
  const prompt = `${ANCHOR} ${BACK} ${refClause}${role} ${TEA}`;
  let accepted = null;
  for (let attempt = 1; attempt <= 10 && !accepted; attempt += 1) {
    const args = ['generate', 'create', 'gpt_image_2', '--prompt', prompt, '--aspect_ratio', '1:1', '--resolution', '1k', '--quality', 'high', '--wait', '--wait-timeout', '10m'];
    if (refClause) { const id = uploadId(reference); if (!id) { log({ slug, attempt, error: 'upload failed for ' + reference }); break; } args.push('--image-references', id); }
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
