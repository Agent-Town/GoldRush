#!/usr/bin/env node
/**
 * site-share-card.mjs: builds site/assets/share-card.jpg, the landing's og:image and twitter:image
 * (task site-vibe-fixes-1 item 2, finding F-VIBE-2).
 *
 * WHY. The landing's card was site/assets/gold-rush-key-art.jpg, an in-game frame of the Claim with its HUD cut
 * at the top edge (reviews/launch-video-vibe-check-1.md, F-VIBE-2), so any link to the landing, a launch film's
 * included, shared as a HUD crop. The card is now the landing's own hero illustration, the heroine with her pan
 * before a ridge of walkers, which the same task extracted byte for byte from the page (F-VIBE-3).
 *
 * THE FRAME. The plate is 1200x800 and the card is 1200x630, so the card keeps every column and 630 of the 800
 * rows. No such window holds both the whole hat (its first dark row is 23) and the gold in the pan (rows 680 to
 * 728), so the card takes the answer the landing already gives for this plate: the hero <img> is framed by
 * `object-position: 40% 5%` (site/index.html, `.hero img`), which in a 1200x630 cover box starts 5% of the 170
 * spare rows down. That is 8.5 rows, floored to 8 so the re-encode stays on the original's 8-pixel luma block
 * grid. The whole hat and the ridge of walkers stay in; the pan's rim stays in her hand at the bottom edge; the
 * gold does not fit. TOP is the one number to change to reframe it.
 *
 * THE ENCODE. Quality 88, 4:2:0, baseline, Huffman-optimised, no metadata: 42.3 dB PSNR against the decoded crop
 * at about 220 KB (quality 90 buys 0.5 dB for 16 KB more; the plate itself is about quality 62, so a lower
 * setting would compound its artifacts). sharp is a devDependency, and its encode is deterministic, so `--check`
 * proves the committed card is exactly what this file builds with the installed sharp.
 *
 *   node scripts/site-share-card.mjs          writes site/assets/share-card.jpg and prints its facts
 *   node scripts/site-share-card.mjs --check  builds in memory; exits 1 if the committed card differs
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'site/assets/heroine-with-pan-before-ridge-of-walkers.jpg';
const CARD = 'site/assets/share-card.jpg';
const WIDTH = 1200;
const HEIGHT = 630;
const TOP = 8;
const JPEG = { quality: 88, chromaSubsampling: '4:2:0', optimiseCoding: true, progressive: false, mozjpeg: false };

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function build() {
  const source = readFileSync(join(ROOT, SOURCE));
  const plate = await sharp(source).metadata();
  if (plate.width !== WIDTH || plate.height < TOP + HEIGHT) {
    throw new Error(`${SOURCE} is ${plate.width}x${plate.height}; the card needs ${WIDTH} columns and ${TOP + HEIGHT} rows`);
  }
  const card = await sharp(source).extract({ left: 0, top: TOP, width: WIDTH, height: HEIGHT }).jpeg(JPEG).toBuffer();
  const built = await sharp(card).metadata();
  if (built.width !== WIDTH || built.height !== HEIGHT) throw new Error(`built ${built.width}x${built.height}, not ${WIDTH}x${HEIGHT}`);
  return {
    card,
    facts: {
      card: CARD, bytes: card.length, width: built.width, height: built.height, sha256: sha256(card),
      source: SOURCE, sourceSha256: sha256(source), crop: `${WIDTH}x${HEIGHT}+0+${TOP}`, quality: JPEG.quality,
      sharp: sharp.versions.sharp, vips: sharp.versions.vips,
    },
  };
}

const { card, facts } = await build();
if (process.argv.includes('--check')) {
  const target = join(ROOT, CARD);
  const committed = existsSync(target) ? readFileSync(target) : null;
  const identical = Boolean(committed?.equals(card));
  console.log(JSON.stringify({ ...facts, committedSha256: committed ? sha256(committed) : null, identical }));
  if (!identical) process.exit(1);
} else {
  writeFileSync(join(ROOT, CARD), card);
  console.log(JSON.stringify(facts));
}
