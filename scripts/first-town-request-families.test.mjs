// F-BUDGET-3 — THE FIRST TOWN'S REQUEST SET, PINNED BY FAMILY.
//
// WHY THIS EXISTS. F-BUDGET-2 recorded the first-town transfer growing from 12.0 / 15.6 MB to
// 21.6 / 21.6 MB "unexplained" between two production builds, and nobody could say which of the
// four candidate merges did it. The bisect (artifacts/first-town-transfer-bisect/, 2026-09-06)
// answered NONE OF THEM: the deploy's own probe measures 21.6 MB on the BEFORE build too, and the
// repo's own committed evidence shows the same instrument reading 15.56 / 16.64 MB and
// 21.90 / 22.50 MB on the same day a month earlier (both revisions of
// artifacts/asset-diet/town-transfer-*.json, 2026-08-10). The gated quantity tracks how much
// parallel traffic happens to land before a signal, so it moves with the HOST, not the payload.
//
// A byte total that swings ±40% on the host cannot detect a new asset entering the first town.
// A REQUEST SET can. This guard pins the cue window's families — the hashed basename with the
// build hash and any `-r<row>c<col>` sheet cell stripped, so it survives every rebuild and only
// reds when something genuinely NEW is fetched before the town is playable.
//
// WHEN IT REDS: a family appeared in the first-town window that is not listed below. That is the
// question F-BUDGET-2 could not answer, asked at the right grain. Either the asset belongs in the
// first town (add it here, in sort order, in the same commit as the change that introduced it) or
// it does not (defer it — see the F-BUDGET-3 hold in src/assets/AdvanceStream.ts and the ordering
// assertion in e2e/asset-diet.spec.ts).
//
// INPUT: artifacts/asset-diet/town-transfer-<project>.json, which the asset-diet suite rewrites on
// every run, so the corpus stays live rather than frozen.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = ['desktop-chrome', 'mobile-chrome'];

// A vite hash is eight chars of base64url. An eight-char slice of an ORDINARY name reads exactly
// the same to a bare `{8}` pattern — `brand-new-hall.glb` would be filed as `brand.glb`, and a
// renamed asset would then hide inside an already-pinned family. A real hash is never all
// lower-case-with-hyphens, so require at least one upper-case letter or digit before stripping.
const VITE_HASH = /^(?=.*[A-Z0-9])[A-Za-z0-9_-]{8}$/;
const DIET_SUFFIX = /^(.*)-([A-Za-z0-9_-]{8})-diet-[0-9a-f]{8}(\.[A-Za-z0-9]+)$/;
const HASH_SUFFIX = /^(.*)-([A-Za-z0-9_-]{8})(\.[A-Za-z0-9]+)$/;
const SHEET_CELL = /-r\d+c\d+(\.[A-Za-z0-9]+)$/;

/**
 * The build hash (`-BQ2fS3xk`), the asset-diet content hash (`-diet-1408f6b4`) and a sprite
 * sheet's cell coordinates (`-r0c3`) are all rebuild-volatile. The family is what is left.
 */
export function requestFamily(url) {
  const pathname = url.split('?')[0];
  if (pathname === '/' || pathname.endsWith('/')) return 'index.html';
  const base = pathname.split('/').pop() ?? pathname;
  const diet = DIET_SUFFIX.exec(base);
  const plain = diet ? null : HASH_SUFFIX.exec(base);
  const stripped = diet
    ? `${diet[1]}${diet[3]}`
    : plain && VITE_HASH.test(plain[2])
      ? `${plain[1]}${plain[3]}`
      : base;
  return stripped.replace(SHEET_CELL, '$1');
}

/** Everything the first town itself legitimately fetches before it is playable. Sorted. */
export const FIRST_TOWN_FAMILIES = [
  'AssayBench.js',
  'AssetLoading.js',
  'CameraRig.js',
  'ConvoyBehavior.js',
  'EraBackdrop.js',
  'LandmarkCollision.js',
  'Loop.js',
  'Medals.js',
  'Renderer.js',
  'SoundSystem.js',
  'SpriteAnimator.js',
  'StartMenu.js',
  'Terrain.js',
  'Terrain3dClaimPilot.js',
  'TownNaming.js',
  'TownScene.css',
  'TownScene.js',
  'TownTavernPilot.js',
  'WorldInfoNotes.js',
  '_gold-rush-release-e1-ceremony-scripts.js',
  'active_headframe.glb',
  'active_headframe.js',
  'assay-office.glb',
  'bld-chapel.png',
  'bld-claim-office.png',
  'bld-general-store.png',
  'bld-schoolhouse.png',
  'bld-tavern.png',
  'ceremonyPostscripts.js',
  'chapel.glb',
  'char-assay-clerk-sheet-walk8-a.js',
  'char-assay-clerk-sheet-walk8-a.png',
  'char-elder-sheet-walk8.js',
  'char-elder-sheet-walk8.png',
  'char-hero-sheet-attack8.js',
  'char-hero-sheet-attack8.png',
  'char-hero-sheet-back-f.js',
  'char-hero-sheet-back-f.png',
  'char-hero-sheet-front-f.js',
  'char-hero-sheet-front-f.png',
  'char-hero-sheet-rotation-f.js',
  'char-hero-sheet-rotation-f.png',
  'char-hero-sheet-rotation2-f.js',
  'char-hero-sheet-rotation2-f.png',
  'char-hero-sheet-side-actions-f.js',
  'char-hero-sheet-side-actions-f.png',
  'char-hero-sheet-side-f.js',
  'char-hero-sheet-side-f.png',
  'char-hero-sheet-walk8.js',
  'char-hero-sheet-walk8.png',
  'char-hero-sheet-walkdiag8.js',
  'char-hero-sheet-walkdiag8.png',
  'char-hero-sheet-work8.js',
  'char-hero-sheet-work8.png',
  'char-newsie-mei-sheet-walk8.js',
  'char-newsie-mei-sheet-walk8.png',
  'char-preacher-sheet-walk8-a.js',
  'char-preacher-sheet-walk8-a.png',
  'char-prospector-portrait.png',
  'char-prospector-sheet-hover8.js',
  'char-prospector-sheet-hover8.png',
  'char-schoolteacher-sheet-walk8-a.js',
  'char-schoolteacher-sheet-walk8-a.png',
  'char-storekeeper-sheet-walk8.js',
  'char-storekeeper-sheet-walk8.png',
  'char-tavernkeeper-sheet-walk8.js',
  'char-tavernkeeper-sheet-walk8.png',
  'char-youngster-f-sheet-walk8.js',
  'char-youngster-f-sheet-walk8.png',
  'char-youngster-m-sheet-walk8.js',
  'char-youngster-m-sheet-walk8.png',
  'claim-office.glb',
  'claim_stake.js',
  'covered_wagon.glb',
  'dispose.js',
  'era-e1-frontier-loop.js',
  'era-e1-frontier-loop.mp3',
  'favicon-32.png',
  'general-store.glb',
  'hero-homesteader-f.png',
  'index.css',
  'index.html',
  'index.js',
  'kit-era-1.js',
  'kit-era-1.png',
  'maintained_claim_house.glb',
  'maintained_claim_house.js',
  'menu-tap.js',
  'menu-tap.mp3',
  'pan_monument.glb',
  'payload.js',
  'riparian_dressing_pack.js',
  'rolldown-runtime.js',
  'runBeacon.js',
  'schoolhouse.glb',
  'scripts.js',
  'story.css',
  'story.js',
  'title-theme.js',
  'title-theme.mp3',
  'town-plate.glb',
  'town-v3-tavern.glb',
  'townEraProps.js',
  'townsfolk-assay-clerk.png',
  'townsfolk-tavernkeeper.png',
  'ui-menu-panel.png',
  'ui-title-emblem.png',
  'version.json',
  'water_trough.glb',
  'working_camp.js',
];

/**
 * THE ADVANCE-STREAM RESIDUE. These belong to a CONTRACT, not to the town, and are here only
 * because the committed corpus predates the F-BUDGET-3 hold (measured at 1,052,408 B on the built
 * e1 bundle at main e5f3ac820). They are tolerated so the guard is honest about today's corpus,
 * never extended: the second assertion below refuses any contract family that is not the board's
 * FIRST contract, so a second map cannot enter the first town through this door. Delete this
 * pair the first time a post-cure corpus is committed.
 */
export const ADVANCE_STREAM_RESIDUE_FAMILIES = [
  'the-claim-panorama.glb',
  'the-claim-terrain.glb',
];

const sorted = (list) => [...list].sort();

async function observedFamilies() {
  const byProject = new Map();
  for (const project of PROJECTS) {
    const file = resolve(ROOT, 'artifacts/asset-diet', `town-transfer-${project}.json`);
    const { cueWindowResponses } = JSON.parse(await readFile(file, 'utf8'));
    assert.ok(Array.isArray(cueWindowResponses) && cueWindowResponses.length > 0,
      `${file} carries no cue-window responses — the corpus this guard reads is empty, which is a failure of the instrument, not a pass`);
    byProject.set(project, new Set(cueWindowResponses.map(({ url }) => requestFamily(url))));
  }
  return byProject;
}

test('the pinned family lists are sorted, deduped and disjoint', () => {
  assert.deepEqual(FIRST_TOWN_FAMILIES, sorted(FIRST_TOWN_FAMILIES), 'FIRST_TOWN_FAMILIES must stay sorted');
  assert.deepEqual(ADVANCE_STREAM_RESIDUE_FAMILIES, sorted(ADVANCE_STREAM_RESIDUE_FAMILIES), 'ADVANCE_STREAM_RESIDUE_FAMILIES must stay sorted');
  assert.equal(new Set(FIRST_TOWN_FAMILIES).size, FIRST_TOWN_FAMILIES.length, 'duplicate family in FIRST_TOWN_FAMILIES');
  assert.equal(new Set(ADVANCE_STREAM_RESIDUE_FAMILIES).size, ADVANCE_STREAM_RESIDUE_FAMILIES.length, 'duplicate family in ADVANCE_STREAM_RESIDUE_FAMILIES');
  const overlap = FIRST_TOWN_FAMILIES.filter((family) => ADVANCE_STREAM_RESIDUE_FAMILIES.includes(family));
  assert.deepEqual(overlap, [], 'a family cannot be both the town\'s own and advance-stream residue');
});

test('the family derivation survives a rebuild', () => {
  assert.equal(requestFamily('/assets/char-hero-sheet-work8-r0c1-Bo9aq2HL-diet-1408f6b4.png'), 'char-hero-sheet-work8.png');
  assert.equal(requestFamily('/assets/town-plate-C90tsADa-diet-1408f6b4.glb'), 'town-plate.glb');
  assert.equal(requestFamily('/assets/BrowserAgentTapeWorker-iUjVHDOL.js'), 'BrowserAgentTapeWorker.js');
  assert.equal(requestFamily('/?town3dPilot=all&tier=full'), 'index.html');
  assert.equal(requestFamily('/version.json'), 'version.json');
  assert.equal(requestFamily('/assets/story-CxwzWWY--diet-1408f6b4.js'), 'story.js');
  // A hyphenated eight-char tail is a NAME, not a hash: `brand-new-hall.glb` must not be filed
  // under `brand.glb`, or a renamed asset would enter the first town inside a pinned family.
  assert.equal(requestFamily('/assets/brand-new-hall.glb'), 'brand-new-hall.glb');
  assert.equal(requestFamily('/assets/brand-new-hall-AbCdEfGh-diet-1408f6b4.glb'), 'brand-new-hall.glb');
});

test('every first-town request belongs to a pinned family', async () => {
  const allowed = new Set([...FIRST_TOWN_FAMILIES, ...ADVANCE_STREAM_RESIDUE_FAMILIES]);
  const unpinned = [];
  for (const [project, families] of await observedFamilies()) {
    for (const family of sorted(families)) if (!allowed.has(family)) unpinned.push(`${project}: ${family}`);
  }
  assert.deepEqual(unpinned, [],
    'a new asset family is fetched before the first town is playable. Add it to FIRST_TOWN_FAMILIES in sort order in the SAME commit as the change that introduced it, or defer it (src/assets/AdvanceStream.ts, F-BUDGET-3)');
});

test('no second map is warmed inside the first town window', async () => {
  const strays = [];
  for (const [project, families] of await observedFamilies()) {
    for (const family of sorted(families)) {
      if (!/-(?:terrain|panorama)\.glb$/.test(family)) continue;
      if (family.startsWith('the-claim')) continue;
      strays.push(`${project}: ${family}`);
    }
  }
  assert.deepEqual(strays, [],
    'a contract map other than the board\'s first is being fetched before the first town is playable');
});
