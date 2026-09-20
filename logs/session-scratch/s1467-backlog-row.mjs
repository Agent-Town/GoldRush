import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const row = [
  '- ✍️ **F-1467-1 (s1467, MEASURED + AUTHORED SAME FIRE) — F-1464-2’S GATE IS A **DISJUNCTION**, AND THE FACTORY HAD BEEN READING ONLY ITS FIRST BRANCH, PARKING A 🔺 BLOCKER BEHIND AN OWNER WHO WAS NEVER REQUIRED.**',
  ' The gate reads *"closes when an attended eye rules the recipe at play scale, **or** an in-game A/B measures it"* — **two branches, and the second is fire-actionable.**',
  ' s1465 and s1466 each carried it forward as *"F-1464-2 recipe ruling (ATTENDED EYE, cheap, unblocks F-1464-1’s 1075/1314 sprites)"*, collapsing the disjunction to its owner half;',
  ' F-1464-2 is **not** on the OWNER’S DESK (verified s1467 by walking the desk headers) and no owner was ever asked.',
  ' This is the mirror of the count-the-CONJUNCTS class: for a **blocking** gate you must count conjuncts, but for a **closing** gate you must count DISJUNCTS — reading one branch of an *or* freezes the thread just as effectively as missing a conjunct unblocks it falsely.',
  ' ➡️ **AUTHORED:** `tasks/lane-f1467-1-alpha-recipe-ab.md` → lane-b (leaf `f1467-1-alpha-recipe-ab`), the second branch.',
  ' 🔍 **AND THE AUTHORING FOUND THE DISCRIMINATOR F-1464-2 WAS MISSING: there is no single `alphaTest`.** Measured by reading every site:',
  ' **0.35** (≈alpha 89/255) at `src/assets/generated.ts:263` (single sprites), `src/assets/SpriteAnimator.ts:279`, `src/town/TownScene.ts:2966` — where two-step’s **1845** bilinear-manufactured partials are at genuine erosion risk because everything under ≈89 is discarded outright;',
  ' and **0.04** (≈alpha 10/255) at `src/assets/generated.ts:377` (batched), `src/game/Game.ts:455`, `src/entities/pools.ts:1202`, `src/agent/Embodiment.ts:49`, `src/town/TownScene.ts:4396`, `src/entities/BuildingSign.ts:52`, `src/game/DrillYard.ts:372` — where nearly every partial survives and the same recipe should read as *softening*.',
  ' **So the honest answer may be per-tier, and a single global verdict could be wrong**; the master measures both and is explicitly permitted to return a split verdict, or "indistinguishable", rather than manufacture a preference.',
  ' 💾 **RETENTION: F-1464-2’s primary evidence was UNTRACKED** — `artifacts/f1450-4/` `arms/`+`blobs/`+`variants/`, 4.4 MB / 12 files including both A/B arms, in no object database since 2026-08-05. Committed `e86f6481`.',
  ' **GATE: closes when the lane-b measurement lands and F-1464-2 is ruled.**',
].join('');

// insert directly after the F-1464-3 row (index 2976 = line 2977)
const anchor = lines.findIndex((l) => l.startsWith('- ✅ **F-1464-3 CLOSED s1464'));
if (anchor < 0) throw new Error('anchor row F-1464-3 not found — refusing to guess a position');
if (lines.some((l) => l.includes('F-1467-1 (s1467'))) {
  console.log('row already present, no-op');
  process.exit(0);
}
lines.splice(anchor + 1, 0, row);
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted after line', anchor + 1, '(F-1464-3)');
console.log('new row line number:', anchor + 2);
console.log(row.slice(0, 200));
