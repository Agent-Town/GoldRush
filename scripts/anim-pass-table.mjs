#!/usr/bin/env node
/**
 * anim-pass-table.mjs — THE ANIMATION PASS (2026-07-25), verdict arm.
 *
 * Joins the measured evidence (anim-pass-inspect) + the direction-row screen
 * (anim-pass-facing) + what the game actually BINDS (contract + town actor JSON)
 * into the review's verdict table.
 *
 * Verdicts are mechanical EXCEPT where VERDICTS below records a judgement made by
 * looking at the art — those are marked "eye" and carry the reason. Anything not
 * eyeballed is marked "measured" so the review never overstates what was checked.
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA = 'reviews/anim-pass-2026-07-25/data';

// ---- what the game binds, and what each row MEANS -------------------------
const contract = JSON.parse(fs.readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const townActors = JSON.parse(fs.readFileSync('src/town/town-actor-sheets.json', 'utf8'));
const SHEET_RE = /^(char-[a-z0-9_-]+-sheet-[a-z0-9-]+?)(-r(\d+)c\d+)?\.png$/;
const DIRS = new Set(['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw']);
const live = new Map(); // stem -> Set(user)
const rowmap = new Map(); // stem -> Map(row -> Set(dir))
const note = (v, who, dir) => {
  if (typeof v !== 'string') return;
  const m = SHEET_RE.exec(v);
  if (!m) return;
  if (!live.has(m[1])) live.set(m[1], new Set());
  live.get(m[1]).add(who);
  if (dir && m[3] !== undefined) {
    if (!rowmap.has(m[1])) rowmap.set(m[1], new Map());
    const rm = rowmap.get(m[1]), r = Number(m[3]);
    if (!rm.has(r)) rm.set(r, new Set());
    rm.get(r).add(dir);
  }
};
const walk = (o, slot = '', dir = null) => {
  if (Array.isArray(o)) { for (const v of o) { note(v, `contract:${slot}`, dir); walk(v, slot, dir); } return; }
  if (o && typeof o === 'object') {
    const sid = o.slot ?? slot;
    for (const [k, v] of Object.entries(o)) {
      const d = DIRS.has(k) ? k : dir;
      note(v, `contract:${sid}`, d);
      walk(v, sid, d);
    }
  }
};
walk(contract);
for (const [who, sheet] of Object.entries(townActors)) {
  if (!live.has(sheet)) live.set(sheet, new Set());
  live.get(sheet).add(`town:${who}`);
  if (who !== 'prospector') {
    if (!rowmap.has(sheet)) rowmap.set(sheet, new Map());
    ['s', 'w', 'e', 'n'].forEach((d, r) => {
      const rm = rowmap.get(sheet);
      if (!rm.has(r)) rm.set(r, new Set());
      rm.get(r).add(d);
    });
  }
}
/** A sheet is "4-cardinal" when row1 means west and row2 means east — only those
 *  can fail the left/right mirror test. Hemisphere sheets (s/se/e/ne) cannot. */
const isCardinal = (stem) => {
  const rm = rowmap.get(stem);
  return !!rm && rm.get(1)?.has('w') && rm.get(2)?.has('e');
};

// ---- judgements made with eyes on the art --------------------------------
// verdict, evidence. Every one of these was confirmed by reading the pixels
// (head crops in reviews/anim-pass-2026-07-25/crops/), not by metric alone.
const VERDICTS = {
  'char-assay-clerk-sheet-walk8-a': ['MENDED', 'WAS: art 4x4 sliced as 8x4 — every shipped cell half a man (crops/ac-a-col0.png). NOW re-sliced at true 4x4: bleed 1162→0, clipped cells 32→0, content 76x318→132-160x314-320 (storekeeper reference 98-166x300-324). 16 stale half-cells archived. STILL OWED: an east row (row 2 faces west) and frames 4-7'],
  'char-assay-clerk-sheet-walk8-b': ['REGENERATE', 'art is 4x4, declared 8x4 by convention; left-hemisphere only — no east-facing row'],
  'char-preacher-sheet-walk8-a': ['MENDED', 'WAS: art 4x4 sliced as 8x4 — half-figure cells. NOW re-sliced at true 4x4: bleed 1076→0, clipped cells 32→4 (coat hem on a cut), height spread 8.6%→3.1%, baseline spread 13→1px. 16 stale half-cells archived. STILL OWED: an east row and frames 4-7'],
  'char-preacher-sheet-walk8-b': ['REGENERATE', 'art is 4x4, declared 8x4; left-hemisphere only'],
  'char-schoolteacher-sheet-walk8-a': ['MENDED', 'WAS: art 4x4 sliced as 8x4 — half-figure cells. NOW re-sliced at true 4x4: vertical bleed 1130→0, height spread 43.9%→1.3%. RESIDUAL: the row2/row3 cut at y=1020 still carries 201px — her boots and the next row heads meet there, so 8 cells lose a sliver. 16 stale half-cells archived. STILL OWED: an east row and frames 4-7'],
  'char-schoolteacher-sheet-walk8-b': ['REGENERATE', 'art is 4x4, declared 8x4; left-hemisphere only'],
  'char-tavernkeeper-sheet-walk8': ['MEND', 'row 2 (east) is drawn facing WEST — confirmed in crops/lr-town.png tiles 0-1; rows 0/1/3 clean, 8 distinct frames each'],
  'char-coalthief-sheet-walk4-a': ['MEND', 'row 1 (west) is drawn facing EAST — crops/ct-r1r2.png; rows 1 and 2 are both eastward views'],
  'char-railtough-sheet-walk4-a': ['MEND', 'row 1 (west) is drawn facing EAST — crops/rt-r1r2.png; rows 1 and 2 are both eastward views'],
  'char-storekeeper-sheet-walk8': ['CLEAN', 'row1 west / row2 east confirmed (crops/lr-town.png tiles 2-3); 8 distinct frames, baseline spread 1px'],
  'char-elder-sheet-walk8': ['CLEAN', 'row1 west / row2 east confirmed (tiles 4-5); baseline spread 1px'],
  'char-newsie-mei-sheet-walk8': ['CLEAN', 'row1 west / row2 east confirmed (tiles 6-7); frameMap [0,1,6,7] uses 4 of the 8'],
  'char-youngster-m-sheet-walk8': ['CLEAN', 'row1 west / row2 east confirmed (tiles 8-9)'],
  'char-youngster-f-sheet-walk8': ['CLEAN', 'row1 west / row2 east confirmed (tiles 10-11)'],
  'char-steamwrecker-sheet-walk4-a': ['CLEAN', 'machine; row1 claw west / row2 claw east confirmed (crops/lr-hemis.png tiles 6-7)'],
  'char-baron-sheet-walk4-a': ['CLEAN', 'row1 west / row2 east confirmed (lr-hemis tiles 8-9)'],
  'char-baron-sheet-walk4-b': ['CLEAN', 'diagonal sheet: row1 serves sw+nw (faces west), row2 serves ne+se (faces east) — confirmed (tiles 10-11)'],
  'char-hero-sheet-walk4-a-f': ['CLEAN', 'east hemisphere (s/se/e/ne) — r2c0 faces east as contracted (lr-hemis tile 0); same-facing rows are CORRECT here'],
  'char-hero-sheet-walk4-b-f': ['CLEAN', 'west hemisphere (n/nw/w/sw) — r2c0 faces west as contracted (tile 1)'],
  'char-jumper-sheet-walk4-a': ['CLEAN', 'east hemisphere — r2c0 faces east (tile 2)'],
  'char-jumper-sheet-walk4-b': ['CLEAN', 'west hemisphere — r2c0 faces west (tile 3)'],
  'char-prospector-sheet-hover4-a': ['CLEAN', 'east hemisphere — lamp/pan lead east (tile 4); hovering agent, no foot contact to judge'],
  'char-prospector-sheet-hover4-b': ['CLEAN', 'west hemisphere (tile 5)'],
  'char-e7-rogue_automaton-sheet-walk8': ['MEND', 'flat 8-frame clip, grid honest; the chain/tail crosses a cell cut (49px bleed) so 6 cells clip a neighbour tail fragment'],
};

// ---- assemble ------------------------------------------------------------
// Full-resolution duplicate proof. The 16x16 hash over-reports badly (282 flagged,
// 82 survive), so ONLY pairs that survive pixel comparison reach a verdict.
const dupeProof = new Map();
for (const s of JSON.parse(fs.readFileSync(path.join(DATA, '_dupecheck.json'), 'utf8'))) dupeProof.set(s.stem, s);
// Sheets whose frames are video stills pasted on opaque parchment cards: the
// figure is not chroma-isolated, so background dominates every silhouette and
// difference metric. Their duplicate/clip/hole numbers are NOT meaningful.
const CARD_SHEETS = new Set(['char-hero-sheet-attack8', 'char-hero-sheet-work8']);

const facing = JSON.parse(fs.readFileSync(path.join(DATA, '_facing.json'), 'utf8'));
const facingBy = new Map(facing.map((f) => [f.stem, f]));
const stems = fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.replace(/\.json$/, '')).sort();

const rows = [];
for (const stem of stems) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, `${stem}.json`), 'utf8'));
  const users = live.get(stem);
  const f = facingBy.get(stem);
  const bleed = d.boundaries ? Math.max(0, ...d.boundaries.vertical.map((v) => v.bleedPx), ...d.boundaries.horizontal.map((v) => v.bleedPx)) : 0;
  const clip = d.cells.filter((c) => c.clipped.length).length;
  const holes = d.cells.reduce((s, c) => s + (c.holes ?? 0), 0);
  const hSpr = Math.max(0, ...d.rows.map((r) => r.heightSpreadPct));
  const blSpr = Math.max(0, ...d.rows.map((r) => r.baselineSpread));
  const card = CARD_SHEETS.has(stem);
  const proof = dupeProof.get(stem);
  const realDupes = card ? [] : (proof?.results ?? []).filter((r) => r.verdict !== 'DISTINCT');
  const dupHard = realDupes.filter((r) => !r.tag.includes('MIRROR'));
  const dupMirror = realDupes.filter((r) => r.tag.includes('MIRROR'));
  const cardinal = isCardinal(stem);
  const facingBad = cardinal && f?.verdict === 'LR-SAME-FACING';

  let verdict, why, source;
  if (VERDICTS[stem]) { [verdict, why] = VERDICTS[stem]; source = 'eye'; }
  else {
    source = 'measured';
    const flags = [];
    if (d.gridMerged) flags.push(`art grid ${d.trueGrid.cols}x${d.trueGrid.rows} < declared ${d.grid.join('x')} — cells are slicing figures apart`);
    if (facingBad) flags.push('rows 1/2 same facing on a cardinal sheet');
    // Only bleed big enough to put a neighbour's limb in the frame; a few px is
    // antialiasing on the cut, which the extractor's bbox-centring absorbs.
    if (bleed >= 40) flags.push(`${bleed}px of a neighbour crosses a cell cut`);
    if (dupHard.length) flags.push(`${dupHard.length} frame pair(s) near-identical at full resolution (mad<6)`);
    if (dupMirror.length) flags.push(`${dupMirror.length} mirrored frame pair(s) confirmed at full resolution`);
    verdict = d.gridMerged || facingBad ? 'REGENERATE' : flags.length ? 'MEND' : 'CLEAN';
    why = flags.join('; ') || 'grid honest, key clean, frames distinct at full resolution, baseline steady';
    if (card) why = `video-still sheet on opaque parchment cards — silhouette/duplicate metrics do not apply; ${why}`;
  }
  rows.push({
    stem, live: users ? [...users].sort().join(', ') : '', cardinal,
    dims: `${d.w}x${d.h}`, grid: d.grid ? d.grid.join('x') : '?', art: `${d.trueGrid.cols}x${d.trueGrid.rows}`,
    bg: d.bgPct, halo: d.haloPct, spill: d.spillPx, bleed, clip, holes,
    dup: dupHard.length, mir: dupMirror.length, flagged: proof?.flagged ?? 0, hSpr, blSpr,
    facing: f?.verdict ?? 'n/a', verdict, why, source,
  });
}

const esc = (s) => String(s).replace(/\|/g, '\\|');
const table = (rs) => [
  '| sheet | bound to | dims | grid decl / art | key bg% / halo% | bleed px | dup pairs flagged→real | height spread | baseline spread | L/R screen | VERDICT | evidence |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...rs.map((r) => `| \`${r.stem}\` | ${esc(r.live || '—')} | ${r.dims} | ${r.grid} / ${r.art} | ${r.bg} / ${r.halo} | ${r.bleed} | ${r.flagged}→${r.dup + r.mir} | ${r.hSpr}% | ${r.blSpr}px | ${r.cardinal ? r.facing : 'n/a (not cardinal)'} | **${r.verdict}** (${r.source}) | ${esc(r.why)} |`),
].join('\n');

const liveRows = rows.filter((r) => r.live).sort((a, b) => a.stem.localeCompare(b.stem));
const darkRows = rows.filter((r) => !r.live).sort((a, b) => a.stem.localeCompare(b.stem));
const count = (rs, v) => rs.filter((r) => r.verdict === v).length;
const tally = (rs) => `CLEAN ${count(rs, 'CLEAN')} · MENDED-THIS-PASS ${count(rs, 'MENDED')} · MEND ${count(rs, 'MEND')} · REGENERATE ${count(rs, 'REGENERATE')}`;
const out = [
  `<!-- generated by scripts/anim-pass-table.mjs — do not hand-edit the tables -->`,
  ``,
  `### Live-bound sheets (${liveRows.length}) — ${tally(liveRows)}`,
  ``,
  table(liveRows),
  ``,
  `### Unwired / reference sheets (${darkRows.length}) — ${tally(darkRows)}`,
  ``,
  `These bind to nothing today. They are judged on the same bars, but no player sees them until something wires them.`,
  ``,
  table(darkRows),
  ``,
].join('\n');
fs.writeFileSync(path.join(DATA, '_table.md'), out);
console.log(`live ${liveRows.length}: ${tally(liveRows)}\nunwired ${darkRows.length}: ${tally(darkRows)}\n→ ${DATA}/_table.md`);
for (const r of rows.filter((x) => x.verdict !== 'CLEAN' && x.live)) console.log(`  ${r.verdict.padEnd(11)} ${r.stem.padEnd(46)} ${r.why}`);
