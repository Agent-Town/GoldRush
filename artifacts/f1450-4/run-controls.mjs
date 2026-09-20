#!/usr/bin/env node
/**
 * run-controls.mjs — F-1450-4 control battery.
 *
 * QUESTION (F-1450-4): the Baron banner's shipped sprite measured partial=1845 when
 * extracted 2026-07-08 (a1b3f4b0) and partial=121 when re-extracted 2026-08-04
 * (eea41d6e). s1450 credited the delta to "accumulated extractor drift across many
 * revisions" and asked for a same-extractor control with `bleedEdges` stubbed.
 *
 * MEASURED FIRST (git, before any arm ran): exactly ONE extractor revision landed
 * between the two extractions — c29040e7, which is a PURE ADDITION of bleedEdges.
 * So "many revisions" is false and the code is alpha-identical across the gap.
 * These arms test that by execution rather than by reading.
 *
 * ARMS
 *   A  current extractor, as shipped                  --key ff00ff --size 384
 *   B  OLD extractor blob (2f1e8e15, pre-bleedEdges)  --key ff00ff --size 384
 *   C  current extractor, bleedEdges STUBBED to a no-op (what F-1450-4 literally asked)
 *   D  current extractor at the DEFAULT size (1024), then bilinear-downsampled to 384
 *      — the provenance hypothesis: tasks/lane-b-baron-presence.md:9 records the
 *      original command as bare `--key ff00ff`, whose --size DEFAULTS to 1024, yet the
 *      shipped file is 384x384. Something downsampled it, and downsampling a keyed
 *      image blends alpha 0 against alpha 255, MANUFACTURING partial pixels.
 *
 * Nothing here writes to assets/ — every arm outputs into artifacts/f1450-4/ (custody).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const WORK = path.join(ROOT, 'artifacts/f1450-4');
const RAW = path.join(ROOT, 'assets/raw/prop-baron-banner.png');
const OLD_EXTRACTOR_BLOB = '2f1e8e156d9e24ace9eb184599805910e26a7ab5';

const dir = (p) => { fs.mkdirSync(p, { recursive: true }); return p; };
const git = (...a) => execFileSync('git', a, { cwd: ROOT, maxBuffer: 1 << 28 });

dir(path.join(WORK, 'blobs'));
dir(path.join(WORK, 'arms'));
dir(path.join(WORK, 'variants'));

// ---- shipped blobs, straight out of the object database -------------------
fs.writeFileSync(path.join(WORK, 'blobs/shipped-OLD-a1b3f4b0.png'),
  git('show', 'a1b3f4b0:assets/processed/prop-baron-banner.png'));
fs.writeFileSync(path.join(WORK, 'blobs/shipped-NEW-head.png'),
  git('show', 'HEAD:assets/processed/prop-baron-banner.png'));

// ---- extractor variants ---------------------------------------------------
const currentSrc = fs.readFileSync(path.join(ROOT, 'scripts/extract-alpha.mjs'), 'utf8');
const oldSrc = git('show', OLD_EXTRACTOR_BLOB).toString('utf8');

const vCurrent = path.join(WORK, 'variants/extract-current.mjs');
const vOld = path.join(WORK, 'variants/extract-old-pre-bleed.mjs');
const vStub = path.join(WORK, 'variants/extract-bleed-stubbed.mjs');

// pngjs is resolved from the repo root either way (variants live inside the repo).
fs.writeFileSync(vCurrent, currentSrc);
fs.writeFileSync(vOld, oldSrc);

// Stub bleedEdges to a no-op that still returns a count-shaped value, touching nothing else.
const stubbed = currentSrc.replace(
  'function bleedEdges(png) {',
  'function bleedEdges(png) {\n  if (process.env.F1450_4_STUB_BLEED === "1") return 0; // F-1450-4 control arm C\n',
);
if (stubbed === currentSrc) { console.error('FATAL: bleedEdges stub did not apply'); process.exit(2); }
fs.writeFileSync(vStub, stubbed);

// ---- run the arms ---------------------------------------------------------
function extract(script, outDir, extraArgs = [], env = {}) {
  dir(outDir);
  const out = execFileSync('node', [script, '--key', 'ff00ff', ...extraArgs, '--out', outDir, RAW],
    { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8' });
  return out.trim();
}

const log = {};
log.A = extract(vCurrent, path.join(WORK, 'arms/A-current'), ['--size', '384']);
log.B = extract(vOld, path.join(WORK, 'arms/B-old-pre-bleed'), ['--size', '384']);
log.C = extract(vStub, path.join(WORK, 'arms/C-bleed-stubbed'), ['--size', '384'], { F1450_4_STUB_BLEED: '1' });
log.D_1024 = extract(vCurrent, path.join(WORK, 'arms/D-default-1024'), [], {}); // --size defaults to 1024

// Arm D second half: bilinear downsample the 1024 extraction to 384, exactly as
// extract-alpha's own resize() does, to model "extracted big, shrunk later".
function resizeTo(srcFile, dstFile, size) {
  const png = PNG.sync.read(fs.readFileSync(srcFile));
  const out = new PNG({ width: size, height: size });
  const sx = png.width / size, sy = png.height / size;
  for (let y = 0; y < size; y++) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1);
    const wy = fy - y0;
    for (let x = 0; x < size; x++) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1);
      const wx = fx - x0;
      const o = (size * y + x) << 2;
      for (let c = 0; c < 4; c++) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c];
        const p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c];
        const p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[o + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  fs.writeFileSync(dstFile, PNG.sync.write(out));
}
const dDown = path.join(WORK, 'arms/D-1024-then-384.png');
resizeTo(path.join(WORK, 'arms/D-default-1024/prop-baron-banner.png'), dDown, 384);

// ---- report ---------------------------------------------------------------
console.log('=== extractor run logs ===');
for (const [k, v] of Object.entries(log)) console.log(`${k}: ${v}`);

const arms = [
  ['shipped OLD (a1b3f4b0 2026-07-08)', path.join(WORK, 'blobs/shipped-OLD-a1b3f4b0.png')],
  ['shipped NEW (eea41d6e 2026-08-04)', path.join(WORK, 'blobs/shipped-NEW-head.png')],
  ['A current extractor @384', path.join(WORK, 'arms/A-current/prop-baron-banner.png')],
  ['B OLD extractor @384 (pre-bleed)', path.join(WORK, 'arms/B-old-pre-bleed/prop-baron-banner.png')],
  ['C bleedEdges STUBBED @384', path.join(WORK, 'arms/C-bleed-stubbed/prop-baron-banner.png')],
  ['D current @1024 (default size)', path.join(WORK, 'arms/D-default-1024/prop-baron-banner.png')],
  ['D 1024 then downsampled ->384', dDown],
];
fs.writeFileSync(path.join(WORK, 'arms-manifest.json'), JSON.stringify(arms, null, 2) + '\n');
console.log('\n=== alpha histograms ===');
console.log(execFileSync('node', [path.join(WORK, 'alpha-probe.mjs'), ...arms.flat()],
  { cwd: ROOT, encoding: 'utf8' }));

// ---- byte-identity checks -------------------------------------------------
const sha = (f) => execFileSync('shasum', ['-a', '256', f], { encoding: 'utf8' }).split(' ')[0];
console.log('=== sha256 ===');
for (const [label, f] of arms) console.log(`${sha(f)}  ${label}`);
