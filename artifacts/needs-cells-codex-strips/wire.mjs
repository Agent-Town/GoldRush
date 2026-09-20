// Register the six accepted Claim Jumper rows in walk4. walk8 and rotations are deliberately NOT
// touched: walk8 is an 8-frame production grid (frameCount 8, fps 16, cadenceReferenceFrames 4) whose
// diagonal ALIASES exist because that sheet is 4-direction, and these rows are 4-phase; rotations is a
// 2-frame block at a different figure scale (its own note records the SCALE DEBT). Putting 4-phase
// cells into either would break the block's own frame contract, so this is reject-don't-stretch.
import { readFileSync, writeFileSync } from 'node:fs';
const FILE = 'assets/layer-contracts/characters.v2.json';
const contract = JSON.parse(readFileSync(FILE, 'utf8'));
const slot = (id) => { const s = contract.slots.find((x) => x.slot === id); if (!s) throw new Error('no slot ' + id); return s; };
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const cells = (stem) => ({ frames: { files: Q4.map((c) => `${stem}-${c}.png`) },
  clips: { walk: { frames: [0, 1, 2, 3], fps: 8 } } });

const j = slot('char.claim_jumper').walk4;
const done = [];
for (const d of ['s', 'e', 'se', 'sw', 'ne', 'nw']) { j.directions[d] = cells(`char-jumper-${d}4-codex-v1`); done.push(`walk4.${d}`); }
j.notes += ' needs-cells-codex-strips, 2026-09-19 (owner, verbatim: "Yes, please use Codex to generate these strips."): SIX of the eight winds are now per-direction Codex plates — s, e, se, sw, ne and nw run char-jumper-{s,e,se,sw,ne,nw}4-codex-v1, 4 cells each at 256, leaving n (char-jumper-north4-v1) and w (char-jumper-west4-v1) from the 2026-09-18 Higgsfield batch. All eight winds are now explicit per-direction plates and NO cell of char-jumper-sheet-walk4-a or -b is referenced by this block any more. MEASURED against the live in-family band this block itself defines (s 166-170, se 162-164, e 156-164, ne 168-176, n 160-170, w 158-172, i.e. 156-176 px in a 256 cell): new s 164/160/166/172, e 166/164/166/166, se 164/158/162/176, sw 166/160/168/170, ne 166/162/168/168, nw 164/159/166/170 — every cell in band, cross-row means 164.8-166.0 (a 1.2 px spread). This RETIRES the sheet-b size-pop the 2026-09-18 note recorded and left out of scope ("the sheet-b DIAGONALS nw and sw stay at 139-150 px and are OUT of this task\'s firewall"): nw and sw were 139-150 and 144-146 px, 12-20 px under every cardinal, and are now in band with the rest. The cells were re-extracted from the NATIVE 1254x1254 Codex renders rather than the 1024 sheets the generator parked, which are lossy downscales of them; the s2627 landing of five of these rows had scaled them to 146-158 px against a band measured from the very sheet-b rows the Higgsfield batch had already replaced (F-NCS-1). walk8 and rotations are untouched — different frame contracts, see artifacts/needs-cells-codex-strips/wire.mjs. RUNTIME-DORMANT still: no body resolves this slot (F-NCS-3 names the commit that ended it).';

const w = slot('char.e2.steam_wrecker').walk4;
w.notes += ' needs-cells-codex-strips, 2026-09-19: se is PARKED a FOURTH time, and for a fourth distinct reason — the HEADING. Both of its two surviving Codex takes draw the machine turning the WRONG WAY. Measured on this family\'s own lamp signal, reported as the amber blob\'s centroid offset from the silhouette centre as a share of its width (negative = screen-left): live w -10.2%, live sw -5.0%, live s -0.6%, live e +18.6% — the lamp tracks the heading, and a true south-east must read about +9%, half of e. The selected take reads -6.7% (162/168/147/153 px lit, all four above the 90-px bar) and the rejected scale-retake reads -9.3% (196-201 px lit): both are south-WESTS, the first statistically the landed sw row itself. The two OLD blockers are gone: the lamp PASSES in all four cells, and the SCALE blocker is DISSOLVED — F-2627-1 concluded "the native 1254 take was normalised away, so there is no resolution left to spend", but the native 1254x1254 renders survive at ~/.codex/generated_images/ and extracting from one is a DOWNSCALE (--scale 0.8881), landing 240/234/244/252 px, every cell inside the 228-252 band. No upscale, no law change. So the cure is now ONE regeneration from a heading-corrected prompt against the native render, not "a larger native cell": copies of both takes are kept at artifacts/needs-cells-codex-strips/native/. se KEEPS its alias onto e until that take exists.';

writeFileSync(FILE, JSON.stringify(contract, null, 2) + '\n');
console.log('registered:', done.join(', '), '| steam_wrecker.se: alias KEPT (parked on heading)');
