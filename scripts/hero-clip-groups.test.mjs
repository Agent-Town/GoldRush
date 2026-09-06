// CLIP GROUPS — EVERY CLIP IN EXACTLY ONE GROUP, EVERY DECLARED GROUP REAL.
//
// WHY THIS EXISTS. Task hero-slot-clip-split, 2026-09-07 (owner, verbatim: "now it loads veerrry
// slowly", "yes, lets do 1"). The hero's runtime slot used to load atomically: 8,901,114 B in 141
// responses inside the first-town window, of which `pan` (char-hero-sheet-work8) and `attack`
// (char-hero-sheet-attack8) are 4,310,829 B of CLAIM animation the town cannot play. A clip now
// carries a GROUP, the slot's default group always loads, and the rest arrive on a scene's
// declaration or on the advance stream's idle callback.
//
// That machinery is only as good as the table it reads, and every way it can silently do nothing is
// a data mistake, not a code mistake: a clip listed under a group but spelled wrong loads eagerly
// forever; a scene declaring a group name no slot defines defers nothing; a clip carried by a walk
// sheet placed in a deferred group can never be merged back in, because the merge path deliberately
// refuses to re-resolve a walk sheet (that would redo the hero age/skin probe and its DOM side
// effects). None of those fail loudly at runtime — the fallback chain swallows them and the player
// just sees walk. So they are asserted here, on the data, before the build.
//
// WHEN IT REDS: read the message. Either the contract's `clipGroups` block and the slot's real
// clips have drifted apart, or a scene is asking for a group that does not exist, or a walk sheet
// has been given a deferred clip.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(readFileSync(new URL('../assets/layer-contracts/characters.v2.json', import.meta.url), 'utf8'));
const runtimeFrames = JSON.parse(readFileSync(new URL('../src/assets/character-runtime-frames.json', import.meta.url), 'utf8'));
const animatorSource = readFileSync(new URL('../src/assets/SpriteAnimator.ts', import.meta.url), 'utf8');

const DEFAULT_CLIP_GROUP = 'default';

/** The group table exactly as src/assets/SpriteAnimator.ts reads it (clipGroupTable/clipGroupFor). */
export function clipGroupTable(slot) {
  return { fallback: slot.clipGroups?.default ?? DEFAULT_CLIP_GROUP, byClip: slot.clipGroups?.clips ?? {} };
}

export function clipGroupFor(slot, clip) {
  const { fallback, byClip } = clipGroupTable(slot);
  return byClip[clip] ?? fallback;
}

/** Every clip name a slot can produce, tagged with the source that produces it. */
export function slotClips(slot) {
  const found = new Map();
  const add = (clip, source) => found.set(clip, [...(found.get(clip) ?? []), source]);
  for (const clip of Object.keys(slot.clips ?? {})) add(clip, 'clips');
  for (const [name, orientation] of Object.entries(slot.orientations ?? {})) {
    for (const clip of Object.keys(orientation.clips ?? {})) add(clip, `orientations.${name}`);
  }
  for (const [name, direction] of Object.entries(slot.rotations?.directions ?? {})) {
    for (const clip of Object.keys(direction.clips ?? {})) add(clip, `rotations.directions.${name}`);
  }
  for (const sheet of ['walk4', 'walk8']) {
    for (const [name, direction] of Object.entries(slot[sheet]?.directions ?? {})) {
      for (const clip of Object.keys(direction.clips ?? {})) add(clip, `${sheet}.directions.${name}`);
    }
    // materializeWalkSheetDirection always injects `walk`, whatever the direction block declares.
    if (slot[sheet]) add('walk', `${sheet}.walk`);
  }
  // The hero's pose library is the one clip source outside the contract: its clips carry their own
  // sheets, which is exactly why their group membership is the one that moves bytes.
  if (slot.slot === 'char.hero') {
    for (const clip of Object.keys(runtimeFrames.heroPoseFrameFiles ?? {})) add(clip, 'heroPoseFrameFiles');
  }
  return found;
}

/** SPRITE_CLIP_GROUPS, read out of the runtime rather than restated here, so the two cannot drift. */
export function sceneClipGroups(source) {
  const block = /export const SPRITE_CLIP_GROUPS = \{([\s\S]*?)\n\} as const/.exec(source);
  assert.ok(block, 'src/assets/SpriteAnimator.ts no longer exports a SPRITE_CLIP_GROUPS object literal — this guard reads the scene declarations from it');
  const scenes = {};
  for (const [, scene, list] of block[1].matchAll(/^\s*(\w+):\s*\[([^\]]*)\],/gm)) {
    scenes[scene] = [...list.matchAll(/'([^']+)'/g)].map(([, name]) => name);
  }
  return scenes;
}

test('the group table is read from the contract by the runtime', () => {
  assert.match(animatorSource, /slotContracts\.get\(slotId\)\?\.clipGroups/,
    'SpriteAnimator no longer reads `clipGroups` off the contract slot — the table below would be decoration');
  assert.match(animatorSource, /const DEFAULT_CLIP_GROUP = 'default'/,
    "SpriteAnimator's unnamed-group fallback changed; this guard resolves groups the same way and must be updated with it");
});

test('the derivation matches the runtime on a synthetic slot', () => {
  const slot = {
    slot: 'char.fixture',
    clipGroups: { default: 'town', clips: { pan: 'claim' } },
    orientations: { side: { clips: { idle: {}, walk: {}, pan: {} } } },
    walk8: { directions: { s: { clips: { walk: {} } } } },
  };
  assert.equal(clipGroupFor(slot, 'pan'), 'claim');
  assert.equal(clipGroupFor(slot, 'idle'), 'town');
  assert.equal(clipGroupFor(slot, 'never-declared'), 'town');
  assert.equal(clipGroupFor({ slot: 'char.plain' }, 'idle'), DEFAULT_CLIP_GROUP);
  assert.deepEqual([...slotClips(slot).keys()].sort(), ['idle', 'pan', 'walk']);
});

test('every clip of every slot belongs to exactly one group', () => {
  for (const slot of contract.slots) {
    const { fallback, byClip } = clipGroupTable(slot);
    const groups = new Set([fallback, ...Object.values(byClip)]);
    for (const clip of slotClips(slot).keys()) {
      const resolved = clipGroupFor(slot, clip);
      assert.equal(typeof resolved, 'string', `${slot.slot}.${clip} resolves to no group`);
      assert.ok(groups.has(resolved), `${slot.slot}.${clip} resolves to group "${resolved}", which the slot does not define`);
      const declared = Object.entries(byClip).filter(([name]) => name === clip);
      assert.ok(declared.length <= 1, `${slot.slot}.${clip} is listed in clipGroups.clips more than once`);
    }
  }
});

test('every clip named in a clipGroups block is a clip the slot really has', () => {
  const strays = [];
  for (const slot of contract.slots) {
    const clips = slotClips(slot);
    for (const clip of Object.keys(slot.clipGroups?.clips ?? {})) {
      if (!clips.has(clip)) strays.push(`${slot.slot}.clipGroups.clips.${clip}`);
    }
  }
  assert.deepEqual(strays, [],
    'a clipGroups entry names a clip no source of this slot produces. A misspelled clip defers nothing and fails silently: the real clip stays in the default group and is fetched in every scene, exactly as before the split');
});

test('walk-sheet clips stay in the slot default group', () => {
  // THE LAW mergeClipGroupsIntoRuntime DEPENDS ON. A late group is merged from two places only:
  // frames already atlased in an existing orientation, and the hero pose library. Walk sheets are
  // deliberately not among them, because reaching one means re-running resolveWalkSheet, which
  // re-probes the hero's age and skin and rewrites `data-hero-sheet` on the canvas. A deferred
  // walk-sheet clip would therefore never arrive at all — and it is the fallback everything else
  // degrades to, so nothing downstream would report the loss.
  const deferred = [];
  for (const slot of contract.slots) {
    const { fallback } = clipGroupTable(slot);
    for (const sheet of ['walk4', 'walk8']) {
      for (const [name, direction] of Object.entries(slot[sheet]?.directions ?? {})) {
        for (const clip of Object.keys(direction.clips ?? {})) {
          if (clipGroupFor(slot, clip) !== fallback) deferred.push(`${slot.slot}.${sheet}.directions.${name}.${clip}`);
        }
      }
    }
  }
  assert.deepEqual(deferred, [],
    'a walk-sheet clip was put in a deferred group. Walk sheets carry the fallback (walk, and the idle merged beside it) and the merge path refuses to re-resolve them, so that clip could never arrive');
});

test('every group a scene declares exists in the contract', () => {
  const scenes = sceneClipGroups(animatorSource);
  assert.ok(Object.keys(scenes).length > 0, 'no scene declarations were parsed out of SPRITE_CLIP_GROUPS');
  const defined = new Set();
  for (const slot of contract.slots) {
    const { fallback, byClip } = clipGroupTable(slot);
    defined.add(fallback);
    for (const group of Object.values(byClip)) defined.add(group);
  }
  const unknown = [];
  for (const [scene, groups] of Object.entries(scenes)) {
    assert.ok(groups.length > 0, `scene "${scene}" declares an empty group list`);
    for (const group of groups) if (!defined.has(group)) unknown.push(`${scene}: ${group}`);
  }
  assert.deepEqual(unknown, [],
    'a scene declares a clip group no slot in assets/layer-contracts/characters.v2.json defines. The declaration would defer nothing and load nothing extra — it is a no-op that reads like a decision');
});

test('the hero defers its claim animations and nothing the town plays', () => {
  // The measured point of the whole slice, pinned so a later edit cannot quietly re-eagerise it.
  // Numbers: artifacts/hero-slot-clip-split/, the deploy's instrument on the e1 release build.
  const hero = contract.slots.find(({ slot }) => slot === 'char.hero');
  assert.ok(hero, 'char.hero left the character contract');
  const { fallback } = clipGroupTable(hero);
  assert.equal(clipGroupFor(hero, 'pan'), 'claim', 'char-hero-sheet-work8 (29 cells, 3,552,007 B) is back in the town window');
  assert.equal(clipGroupFor(hero, 'attack'), 'claim', 'char-hero-sheet-attack8 (6 cells, 758,822 B) is back in the town window');
  for (const clip of ['walk', 'idle']) {
    assert.equal(clipGroupFor(hero, clip), fallback, `char.hero.${clip} must stay in the default group — it is the fallback every deferred clip degrades to`);
  }
  assert.deepEqual(sceneClipGroups(animatorSource).town, [fallback],
    'the town scene declares more than the hero default group; the town plays walk and idle only (TownScene calls hero.update() without `panning` and never calls playAttackPose)');
});
