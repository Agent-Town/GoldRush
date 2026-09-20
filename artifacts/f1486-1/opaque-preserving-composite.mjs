#!/usr/bin/env node
/**
 * F-1486-1 — the 45-cell rounded-scale class satisfies F-1470-4's FIRST disjunct
 * after all, with NO threshold relaxed and NO owner word required.
 *
 * s1485 measured the exact-scale recipe end-to-end and found it satisfies every
 * clause of the disjunct EXCEPT "byte-identical opaque RGB": 117 fully-opaque
 * pixels move, each by exactly 1/255. It then correctly declined to relax that
 * threshold and put the question on the owner's desk.
 *
 * THE OBSERVATION THAT DISSOLVES THE QUESTION — the two predicates in the gate
 * read DISJOINT PIXEL SETS:
 *   halo-class-sweep.mjs:41        if (data[idx + 3] !== 0) continue;   // alpha === 0 ONLY
 *   halo-reextraction-check.mjs:82 if (before.data[offset + 3] === 255)  // alpha === 255 ONLY
 * The halo being cured lives entirely in the fully-TRANSPARENT field. The invariant
 * being violated guards only the fully-OPAQUE interior. The 117 moved pixels are
 * therefore not part of the cure at all — they are incidental resampling noise in a
 * region the cure has no need to touch.
 *
 * THE RECIPE (one line on top of s1485's, which is quoted verbatim as the base):
 *   composite.alpha = cured.alpha            // already byte-identical, measured 0 diff
 *   composite.RGB   = shipped.alpha === 255 ? shipped.RGB : cured.RGB
 * Opaque-RGB identity becomes true BY CONSTRUCTION rather than by luck, the halo
 * cure is untouched (it lives at alpha 0), and the antialiased edge band still takes
 * the cured colour — which is EXACTLY the diff signature the 774 already-accepted
 * cells have (F-1464-1: "all 10,741 changed visible pixels sit in the antialiased
 * edge band ... 0 fully-opaque pixels change RGB"). The 45 cells are thereby made
 * the same KIND of diff as the 774, not a new class needing a new ruling.
 *
 * INSTRUMENT VALIDATION — a green proves nothing about a red, so this script runs a
 * CONTROL ARM: the identical measurement with the composite DISABLED must reproduce
 * s1485's known-bad baseline (117 opaque pixels, max delta 1). If the control does
 * not reproduce, the harness is wrong and the treatment arm means nothing.
 *
 * Writes nothing under assets/. Custody per fire.md 3.0b.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const RAW = 'assets/raw';
const KEY = 'ff00ff';
const FIT = 0.86;                       // extract-alpha.mjs:376
const SHEETS = [
  'char-e9-feral_terraformer-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f',
  'ter-rail-elements',
];
const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

// verbatim from artifacts/f1470-4/exact-scale-recipe.mjs (s1485)
function resize(png, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / png.width, maxHeight / png.height);
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  if (width === png.width && height === png.height) return png;
  const out = new PNG({ width, height });
  const sx = png.width / width, sy = png.height / height;
  for (let y = 0; y < height; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1), wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1), wx = fx - x0;
      const outIdx = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c], p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c], p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[outIdx + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  return out;
}

// verbatim from artifacts/fix-walk-cutout-pockets/pockets.mjs — the ORIGINAL pocket detector
const isCream = (d, o) => d[o + 3] >= 192
  && d[o] >= 205 && d[o + 1] >= 175 && d[o + 2] >= 100
  && d[o] >= d[o + 1] && d[o + 1] >= d[o + 2]
  && d[o] - d[o + 1] <= 55 && d[o + 1] - d[o + 2] >= 18;

function pockets(png) {
  const { width: w, height: h, data: d } = png;
  const outside = new Uint8Array(w * h);
  const stack = [];
  const passable = (i) => d[(i << 2) + 3] < 32 || isCream(d, i << 2);
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (!outside[i] && passable(i)) { outside[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  const seen = new Uint8Array(w * h), found = [];
  for (let s = 0; s < w * h; s++) {
    if (outside[s] || seen[s] || !isCream(d, s << 2)) continue;
    const cells = [s]; seen[s] = 1;
    for (let q = 0; q < cells.length; q++) {
      const i = cells[q], x = i % w, y = (i / w) | 0;
      for (const j of [i - 1, i + 1, i - w, i + w]) {
        if ((j === i - 1 && x === 0) || (j === i + 1 && x === w - 1) || j < 0 || j >= w * h) continue;
        if (!outside[j] && !seen[j] && isCream(d, j << 2)) { seen[j] = 1; cells.push(j); }
      }
    }
    if (cells.length >= 40) found.push(cells);
  }
  // pockets.mjs:60 — a blob only COUNTS when it fills >=20% of its bbox. Omitting this
  // density filter over-counts; the first draft of this script did exactly that and
  // reported 8 blobs where the real detector reports its offenders. Validated against
  // `node artifacts/fix-walk-cutout-pockets/pockets.mjs` on the live tree.
  let counted = 0;
  for (const cells of found) {
    const xs = cells.map((i) => i % w), ys = cells.map((i) => (i / w) | 0);
    const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (cells.length / ((bbox[2] - bbox[0] + 1) * (bbox[3] - bbox[1] + 1)) >= 0.2) counted++;
  }
  return counted;
}

const POCKET_SCOPE = /^char-.*-(?:walk8|walk4)-r\d+c\d+\.png$/;   // pockets.mjs:8-9

function run(composite) {
  const results = [];
  let totCells = 0, totAlpha = 0, totOpaque = 0, worstDelta = 0;
  let totSuspectsBefore = 0, totSuspectsAfter = 0;
  let pocketScoped = 0, pocketBefore = 0, pocketAfter = 0;

  for (const stem of SHEETS) {
    const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
    const occupied = fj.cells.filter((c) => !c.empty);
    const hasMaster = occupied.every((c) => fs.existsSync(path.join(FULL, c.file)));
    const displayCell = readPng(path.join(PROC, occupied[0].file)).width;

    const maxDim = Math.round((fj.cell * FIT) / fj.scale);
    const exact = (fj.cell * FIT) / maxDim;

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'f1486-1-'));
    let alpha = 0, maxAlpha = 0, opaque = 0, maxDelta = 0, suspectsBefore = 0, suspectsAfter = 0;
    try {
      execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${fj.grid.cols}x${fj.grid.rows}`,
        '--cell', String(fj.cell), '--scale', String(exact), '--out', tmp, path.join(RAW, `${stem}.png`)], { stdio: 'pipe' });

      for (const cell of occupied) {
        const produced = readPng(path.join(tmp, cell.file));
        const cured = hasMaster ? resize(produced, displayCell, displayCell) : produced;
        const current = readPng(path.join(PROC, cell.file));

        // THE CANDIDATE OUTPUT: alpha always from the cure; RGB from the shipped file
        // wherever the shipped pixel is fully opaque.
        const out = new PNG({ width: current.width, height: current.height });
        for (let i = 0; i < current.width * current.height; i++) {
          const o = i << 2;
          const keepShipped = composite && current.data[o + 3] === 255;
          const src = keepShipped ? current : cured;
          out.data[o] = src.data[o]; out.data[o + 1] = src.data[o + 1]; out.data[o + 2] = src.data[o + 2];
          out.data[o + 3] = cured.data[o + 3];
        }

        let trB = 0, kpB = 0, trA = 0, kpA = 0;
        for (let i = 0; i < current.width * current.height; i++) {
          const o = i << 2;
          const d = Math.abs(current.data[o + 3] - out.data[o + 3]);
          if (d) { alpha++; maxAlpha = Math.max(maxAlpha, d); }
          if (current.data[o + 3] === 255) {
            const delta = Math.max(Math.abs(current.data[o] - out.data[o]),
              Math.abs(current.data[o + 1] - out.data[o + 1]),
              Math.abs(current.data[o + 2] - out.data[o + 2]));
            if (delta) { opaque++; maxDelta = Math.max(maxDelta, delta); }
          }
          const isKey = (p, i2) => p.data[i2] === 255 && p.data[i2 + 1] === 0 && p.data[i2 + 2] === 255;
          if (current.data[o + 3] === 0) { trB++; if (isKey(current, o)) kpB++; }
          if (out.data[o + 3] === 0) { trA++; if (isKey(out, o)) kpA++; }
        }
        if (trB && kpB / trB > 0.05) suspectsBefore++;
        if (trA && kpA / trA > 0.05) suspectsAfter++;

        if (POCKET_SCOPE.test(path.basename(cell.file))) {
          pocketScoped++;
          pocketBefore += pockets(current);
          pocketAfter += pockets(out);
        }
      }
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

    totCells += occupied.length; totAlpha += alpha; totOpaque += opaque;
    worstDelta = Math.max(worstDelta, maxDelta);
    totSuspectsBefore += suspectsBefore; totSuspectsAfter += suspectsAfter;
    results.push({ stem, cells: occupied.length, alpha, maxAlpha, opaque, maxDelta, suspectsBefore, suspectsAfter });
    console.log(`   ${stem}: alpha ${alpha} · opaque-RGB ${opaque} (max ${maxDelta}) · suspects ${suspectsBefore} -> ${suspectsAfter}`);
  }
  return { results, totCells, totAlpha, totOpaque, worstDelta, totSuspectsBefore, totSuspectsAfter, pocketScoped, pocketBefore, pocketAfter };
}

console.log('=== CONTROL ARM (composite DISABLED) — must reproduce s1485: 117 opaque, max delta 1 ===');
const control = run(false);
console.log('\n=== TREATMENT ARM (opaque-preserving composite) ===');
const treatment = run(true);

const controlReproduces = control.totOpaque === 117 && control.worstDelta === 1 && control.totAlpha === 0;
console.log('\n=== VERDICT ===');
console.log(`cells measured:            ${treatment.totCells}`);
console.log(`CONTROL  opaque-RGB:       ${control.totOpaque} (max ${control.worstDelta})  alpha ${control.totAlpha}  suspects ${control.totSuspectsBefore} -> ${control.totSuspectsAfter}`);
console.log(`TREATMENT opaque-RGB:      ${treatment.totOpaque} (max ${treatment.worstDelta})  alpha ${treatment.totAlpha}  suspects ${treatment.totSuspectsBefore} -> ${treatment.totSuspectsAfter}`);
console.log(`pocket detector in scope:  ${treatment.pocketScoped} cells · pockets ${treatment.pocketBefore} -> ${treatment.pocketAfter}`);
console.log(`control reproduces s1485:  ${controlReproduces ? 'YES' : 'NO — HARNESS SUSPECT, treatment arm means nothing'}`);

// The pocket conjunct does not apply uniformly, so the verdict must SPLIT rather than
// collapse to one word. pockets.mjs:8-9 scopes the detector to char-*-(walk8|walk4)
// cells, so 6 of the 7 rounded-scale sheets are OUT OF SCOPE entirely — the conjunct is
// VACUOUS for them, which is stated plainly here rather than dressed up as a pass.
// The 7th (char-e9-feral_terraformer-sheet-walk8) IS in scope and already reports its
// pockets on the SHIPPED bytes, before any cure: the treatment leaves the count
// unchanged, so the cure neither causes nor can remove them.
const inScopeCells = treatment.pocketScoped;
const outOfScopeCells = treatment.totCells - inScopeCells;
const coreMet = controlReproduces && treatment.totAlpha === 0
  && treatment.totOpaque === 0 && treatment.totSuspectsAfter === 0;
const pocketNeutral = treatment.pocketAfter === treatment.pocketBefore;

console.log(`\npocket conjunct VACUOUS (out of detector scope): ${outOfScopeCells} cells`);
console.log(`pocket conjunct IN SCOPE:                        ${inScopeCells} cells`);
console.log(`  shipped baseline already reports:              ${treatment.pocketBefore} pockets`);
console.log(`  after the cure:                                ${treatment.pocketAfter} pockets (delta ${treatment.pocketAfter - treatment.pocketBefore})`);

console.log(coreMet && pocketNeutral
  ? `\nF-1470-4 FIRST DISJUNCT: SATISFIED on ${outOfScopeCells} of ${treatment.totCells} cells `
    + `with NO threshold relaxed and NO owner word required.\n`
    + `The remaining ${inScopeCells} (char-e9-feral_terraformer-sheet-walk8) are held by a `
    + `PRE-EXISTING pocket count\nthat the cure does not move (${treatment.pocketBefore} -> ${treatment.pocketAfter}); `
    + `that is a separate finding about the shipped\nsprite, not a property of this recipe.`
  : '\nF-1470-4 FIRST DISJUNCT: NOT satisfied — do not queue this.');

fs.writeFileSync('artifacts/f1486-1/opaque-preserving-composite.json',
  JSON.stringify({
    control, treatment, controlReproduces,
    coreMet, pocketNeutral, inScopeCells, outOfScopeCells,
    verdict: coreMet && pocketNeutral
      ? `first disjunct satisfied on ${outOfScopeCells}/${treatment.totCells} cells; ${inScopeCells} held by pre-existing pockets`
      : 'first disjunct NOT satisfied',
  }, null, 2) + '\n');
