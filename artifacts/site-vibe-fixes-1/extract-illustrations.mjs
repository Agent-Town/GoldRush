#!/usr/bin/env node
/**
 * extract-illustrations.mjs: site-vibe-fixes-1 item 1 (F-VIBE-3). The landing's three illustrations lived only as
 * `data:image/jpeg;base64` strings inside site/index.html (reviews/launch-video-vibe-check-1.md, F-VIBE-3). This
 * decodes each one, byte for byte, into site/assets/ under a name that says what it shows, and repoints the same
 * three <img> tags at the files. Nothing else in the page is touched.
 *
 *   node artifacts/site-vibe-fixes-1/extract-illustrations.mjs --write
 *       the one-off that produced the extraction commit (refuses to overwrite any existing file)
 *   node artifacts/site-vibe-fixes-1/extract-illustrations.mjs --verify [--base <rev>] [--at <rev>]
 *       re-proves it at any time: <base> (default afd7393e9, the branch base) holds the inlined strings;
 *       <at> (default: the working tree) holds the page that should reference the files
 *
 * BYTE-EXACTNESS, proved two ways per image. (1) The decoded bytes re-encode to the page's base64 string exactly:
 * Node's decoder silently skips characters outside the alphabet, so a lossy decode would show up here and nowhere
 * else. (2) The file on disk equals the decode of the base revision's string (Buffer.equals and SHA-256).
 * The mapping is by alt text, never by position, so a reordered page cannot swap two names.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sharp = createRequire(join(ROOT, 'package.json'))('sharp');
const PAGE = 'site/index.html';
const PLATES = [
  { file: 'heroine-with-pan-before-ridge-of-walkers.jpg', alt: 'A prospector on a river gold-claim' },
  { file: 'heroine-mid-fight.jpg', alt: 'The heroine directs her turret defenses' },
  { file: 'calculating-house-glass-hall.jpg', alt: 'The Calculating House' },
];
const DATA_IMG = /<img src="data:image\/jpeg;base64,([A-Za-z0-9+/=]*)" alt="([^"]*)"/g;

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const pageAt = (rev) => (rev ? execFileSync('git', ['-C', ROOT, 'show', `${rev}:${PAGE}`], { encoding: 'utf8', maxBuffer: 64 << 20 }) : readFileSync(join(ROOT, PAGE), 'utf8'));
const lineOf = (html, needle) => html.slice(0, html.indexOf(needle)).split('\n').length;

/** The three inlined images of a page, each matched to its plate by alt text and decoded. */
function inlined(html) {
  const found = [...html.matchAll(DATA_IMG)];
  if (found.length !== PLATES.length) throw new Error(`expected ${PLATES.length} inlined images, found ${found.length}`);
  return PLATES.map((plate) => {
    const hits = found.filter(([, , alt]) => alt.startsWith(plate.alt));
    if (hits.length !== 1) throw new Error(`alt "${plate.alt}..." matched ${hits.length} inlined images`);
    const [, b64, alt] = hits[0];
    const bytes = Buffer.from(b64, 'base64');
    const uri = `data:image/jpeg;base64,${b64}`;
    if (html.split(uri).length !== 2) throw new Error(`${plate.file}: its data URI is not unique in the page`);
    return { ...plate, b64, altFull: alt, bytes, uri, line: lineOf(html, uri) };
  });
}

async function describe(plate, bytes) {
  const meta = await sharp(bytes).metadata();
  return { file: `site/assets/${plate.file}`, bytes: bytes.length, width: meta.width, height: meta.height, format: meta.format, sha256: sha256(bytes) };
}

async function write() {
  const html = pageAt(null);
  let out = html;
  for (const plate of inlined(html)) {
    if (plate.bytes.toString('base64') !== plate.b64) throw new Error(`${plate.file}: decode does not re-encode to the page string`);
    if (plate.bytes.readUInt16BE(0) !== 0xffd8 || plate.bytes.readUInt16BE(plate.bytes.length - 2) !== 0xffd9) throw new Error(`${plate.file}: not a whole JPEG`);
    const target = join(ROOT, 'site/assets', plate.file);
    if (existsSync(target)) throw new Error(`${target} exists; this tool creates new files only`);
    writeFileSync(target, plate.bytes, { flag: 'wx' });
    out = out.replace(plate.uri, `assets/${plate.file}`);
    console.log(JSON.stringify({ line: plate.line, ...(await describe(plate, plate.bytes)) }));
  }
  writeFileSync(join(ROOT, PAGE), out);
  console.log(`${PAGE}: ${html.length} -> ${out.length} chars`);
}

async function verify(base, at) {
  const baseHtml = pageAt(base);
  const atHtml = pageAt(at);
  let expected = baseHtml;
  let failures = 0;
  for (const plate of inlined(baseHtml)) {
    const disk = readFileSync(join(ROOT, 'site/assets', plate.file));
    const reencodes = plate.bytes.toString('base64') === plate.b64;
    const fileEqualsDecode = disk.equals(plate.bytes);
    const fileReencodes = disk.toString('base64') === plate.b64;
    const referenced = atHtml.includes(`<img src="assets/${plate.file}" alt="${plate.altFull}"`);
    const ok = reencodes && fileEqualsDecode && fileReencodes && referenced;
    if (!ok) failures += 1;
    expected = expected.replace(plate.uri, `assets/${plate.file}`);
    console.log(JSON.stringify({
      ok, baseLine: plate.line, b64chars: plate.b64.length, decodeReencodesExactly: reencodes,
      fileEqualsDecode, fileReencodesToPageString: fileReencodes, referencedWithSameAlt: referenced,
      decodeSha256: sha256(plate.bytes), ...(await describe(plate, disk)),
    }));
  }
  const leftover = (atHtml.match(/data:image\//g) ?? []).length;
  const a = expected.split('\n');
  const b = atHtml.split('\n');
  const differing = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if (a[i] !== b[i]) differing.push(i + 1);
  console.log(JSON.stringify({ base: base ?? 'working tree', at: at ?? 'working tree', dataImageUrisLeft: leftover, pageEqualsBaseWithOnlyTheThreeSrcSwaps: atHtml === expected, linesDifferingBeyondTheSwaps: differing }));
  if (leftover) failures += 1;
  if (failures) { console.error(`verify: ${failures} failure(s)`); process.exit(1); }
}

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (args.includes('--write')) await write();
else if (args.includes('--verify')) await verify(opt('--base') ?? 'afd7393e9', opt('--at') ?? null);
else { console.error('usage: extract-illustrations.mjs --write | --verify [--base <rev>] [--at <rev>]'); process.exit(2); }
