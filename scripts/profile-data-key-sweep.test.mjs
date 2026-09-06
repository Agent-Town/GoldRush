#!/usr/bin/env node
/**
 * profile-data-key-sweep — does every storage key `src/story/` and `src/game/` own get SWEPT?
 *
 * WHY THIS EXISTS (F-SSE-3, and it is a class rather than an incident)
 * -------------------------------------------------------------------
 * `PROFILE_DATA_KEYS` (`src/game/ProfileStorage.ts`) is not documentation. It is the predicate
 * three separate mechanisms consult:
 *
 *   1. `scopedDataKey` — a key IN the set is rewritten to `gr.profile.v2.<id>.<key>` on every
 *      `setItem`/`getItem`; a key OUTSIDE it is written GLOBALLY and is therefore shared by every
 *      profile on the device.
 *   2. `ProfileManager` (`:497`) and `StartMenu` (`:439`) iterate the set to DELETE and to EXPORT.
 *      A key outside it survives a profile delete and is missing from an export.
 *   3. `migrateProfileDataKeys` moves legacy global values into a profile on first sight — again,
 *      only for keys in the set.
 *
 * So an unregistered key is not a cosmetic omission: it is a datum that leaks between profiles and
 * outlives the profile that wrote it. F-SSE-3 was exactly that — `story-signal-emitters` added the
 * once-per-profile `first-boot` marker and left it out of the set, so a player who deleted their
 * profile kept the "you have booted before" mark. The cure was one line. NOTHING STOPPED THE NEXT
 * ONE, which is what this guard is for.
 *
 * WHY A LITERAL SWEEP IS THE COMPLETE SWEEP HERE, MEASURED RATHER THAN ASSUMED
 * ---------------------------------------------------------------------------
 * The obvious objection to grepping constants is that a writer could pass a literal straight to
 * `setItem`. Measured over the whole corpus on 2026-09-07: there are ZERO storage calls in
 * `src/story/` or `src/game/` whose key argument is a string literal — every one goes through a
 * named constant. `no literal-keyed storage call` below pins that, so the constant sweep cannot
 * quietly stop being the writer sweep.
 *
 * The two DYNAMIC key families are handled inside `ProfileStorage` itself and are deliberately out
 * of this sweep's subject set: `gr.research.epoch-*.v1` is spread into the set from `listEpochs()`,
 * and `tilestate.<contractId>` is admitted by `isTileStateDataKey`. Both are decided by code, not
 * by a literal a future slice might forget.
 *
 * THE EXEMPTIONS ARE A LEDGER, NOT AN ESCAPE HATCH
 * ------------------------------------------------
 * Six corpus keys are deliberately NOT profile data. Each is listed with the reason, and the guard
 * refuses a dead exemption (one whose key has left the corpus) and a contradictory one (a key both
 * exempt and registered) — so the list cannot rot into a rubber stamp that certifies an empty
 * sweep. Adding a key here is a decision a reader can argue with; leaving one out is not.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const SWEPT_DIRS = ['src/story', 'src/game'];

/**
 * Keys the corpus declares that are NOT profile data, each with the reason it is not. A key here is
 * a claim that a profile delete SHOULD leave it standing.
 */
const EXEMPT = {
  'gr.profile.v2': 'PROFILE_KEY itself — the register of profiles, not a datum inside one. Scoping it would nest the record in a copy of its own name.',
  'gr.account.v1': "AccountSync's cloud session (token + accountId). It is a DEVICE sign-in that outlives any one profile: you sign in once and then choose which profile to sync, so deleting a profile must not sign the player out.",
  'gr.assay-replay.v1': 'sessionStorage, not localStorage (`Game.ts` `assayReplayBoot` reads it once and removes it). It is a one-tab handoff for the `?assayReplay` debug door and cannot outlive the tab, let alone the profile.',
  'gr.performance.tier.v1': 'PERFORMANCE_TIER_STORAGE_KEY — deliberately DEVICE-local (`DEVICE_LOCAL_MIGRATION_KEYS`, and `getItem` short-circuits to `readDeviceLocalDatum`). The tier describes the machine, not the player.',
  'gr.performance.verdicts.v1': 'RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY — registered in `DEVICE_PROFILE_DATA_KEYS`, the device-scoped sibling set. It IS scoped, just not to a profile.',
  'gr.countyStandings.anonId.v1': "REPORTED, NOT ENDORSED (F-ECB-2). `Game.countyAnonId` writes `gr.countyStandings.anonId.v1.<profileId>` — a hand-rolled per-profile SUFFIX, the mirror image of the `gr.profile.v2.<id>.<key>` prefix this set produces. Registering the bare literal would give it a prefix AND a suffix, so the fix is not a line in the set; the honest statement is that this id survives a profile delete and this guard says so out loud rather than scoping it wrongly.",
};

function tsFiles(directory) {
  const found = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      // `.ts` only, on purpose: it excludes the tracked `Balance.ts.orig` leftover (F-MCAP-5),
      // which is not compiled and whose keys are a snapshot of an older tree.
      else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) found.push(absolute);
    }
  };
  walk(path.join(root, directory));
  return found;
}

const CORPUS = SWEPT_DIRS.flatMap(tsFiles).sort();

/** key -> ['src/game/Foo.ts:12', ...]. Single, double and backtick quotes all count as a literal. */
const LITERALS = (() => {
  const table = new Map();
  for (const file of CORPUS) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      for (const match of line.matchAll(/['"`](gr\.[A-Za-z0-9._-]+)['"`]/g)) {
        if (!table.has(match[1])) table.set(match[1], []);
        table.get(match[1]).push(`${relative}:${index + 1}`);
      }
    });
  }
  return table;
})();

let profileStorage;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const location = new URL('http://profile-data-key-sweep.test/');
  globalThis.location = location;
  globalThis.window = { location };
  profileStorage = await vite.ssrLoadModule('/src/game/ProfileStorage.ts');
} finally {
  await vite.close();
}

const { PROFILE_DATA_KEYS, PROFILE_KEY, STORY_FIRST_BOOT_KEY } = profileStorage;

test('the corpus is not empty, and neither is the key set', () => {
  // An empty corpus is the shape of false good news: a loop over nothing registers no assertions
  // and reports success. Both floors are well under the measured counts (35 files, 26 keys, 40
  // registered) so ordinary growth never touches them, and a mis-rooted scan always does.
  assert.ok(CORPUS.length >= 25, `swept ${CORPUS.length} files under ${SWEPT_DIRS.join(' + ')}; the root is wrong, not the tree`);
  assert.ok(LITERALS.size >= 20, `found ${LITERALS.size} gr.* key literals; the scan is broken, not the corpus`);
  assert.ok(PROFILE_DATA_KEYS instanceof Set && PROFILE_DATA_KEYS.size >= 30, `PROFILE_DATA_KEYS has ${PROFILE_DATA_KEYS?.size} entries`);
  for (const key of PROFILE_DATA_KEYS) {
    assert.equal(typeof key, 'string', 'a non-string reached PROFILE_DATA_KEYS — an import resolved to undefined');
    assert.ok(key.length > 0, 'an empty key reached PROFILE_DATA_KEYS');
  }
});

test('every gr.* key src/story and src/game declare is registered for the profile sweep, or exempt with a reason', () => {
  const unregistered = [];
  for (const [key, sites] of [...LITERALS].sort()) {
    if (PROFILE_DATA_KEYS.has(key) || key in EXEMPT) continue;
    unregistered.push(`${key} (${sites.join(', ')})`);
  }
  assert.deepEqual(
    unregistered,
    [],
    'these keys are written outside every profile: they are shared by all profiles, survive a profile delete and are absent from an export. '
      + 'Register them in PROFILE_DATA_KEYS (src/game/ProfileStorage.ts), or add them to EXEMPT here with the reason they are not profile data:\n  '
      + unregistered.join('\n  '),
  );
});

test('the exemption ledger cannot rot: no dead entries, no contradictions', () => {
  const dead = Object.keys(EXEMPT).filter((key) => !LITERALS.has(key));
  assert.deepEqual(dead, [], 'these keys left the corpus; drop their exemptions rather than carrying a list that certifies nothing');
  const contradictory = Object.keys(EXEMPT).filter((key) => PROFILE_DATA_KEYS.has(key));
  assert.deepEqual(contradictory, [], 'these keys are BOTH exempt and registered; the exemption is a lie about what the code does');
  for (const [key, reason] of Object.entries(EXEMPT)) {
    assert.ok(typeof reason === 'string' && reason.length >= 40, `the exemption for ${key} states no reason a reader can argue with`);
  }
});

test('no literal-keyed storage call — the constant sweep above IS the writer sweep', () => {
  // The whole guard rests on this: if a writer passed a bare string to setItem, sweeping the
  // constants would miss it. Measured zero on 2026-09-07 and pinned here so it stays zero.
  const offenders = [];
  for (const file of CORPUS) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      for (const match of line.matchAll(/\.(setItem|getItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g)) {
        offenders.push(`${relative}:${index + 1} ${match[1]}(${JSON.stringify(match[2])})`);
      }
    });
  }
  assert.deepEqual(offenders, [], 'a storage call keyed by a literal bypasses the constant sweep; give it a named constant');
});

test('F-SSE-3: the once-per-profile first-boot marker is registered, and its two declarations agree', () => {
  assert.equal(STORY_FIRST_BOOT_KEY, 'gr.story.firstBoot.v1');
  assert.ok(
    PROFILE_DATA_KEYS.has(STORY_FIRST_BOOT_KEY),
    'the first-boot marker is unregistered again: a deleted profile would keep its "you have booted before" mark',
  );
  // `src/main.ts` declares the SAME literal rather than importing it (its boot runs on import, so
  // ProfileStorage must not pull it in). That duplication is the drift risk, so it is pinned: the
  // writer and the sweep must name the same key or the marker is written where nothing clears it.
  const mainSource = readFileSync(path.join(root, 'src/main.ts'), 'utf8');
  const declared = /FIRST_BOOT_SIGNAL_KEY\s*=\s*'([^']+)'/.exec(mainSource);
  assert.ok(declared, "src/main.ts no longer declares FIRST_BOOT_SIGNAL_KEY; find the boot writer and re-point this check");
  assert.equal(
    declared[1],
    STORY_FIRST_BOOT_KEY,
    "src/main.ts writes a different first-boot key than ProfileStorage sweeps — the marker would outlive its profile",
  );
});

test('the profile-scoped key shape is what the sweep assumes', () => {
  // The sweep only means anything if a registered key really becomes `gr.profile.v2.<id>.<key>`.
  assert.equal(PROFILE_KEY, 'gr.profile.v2');
  assert.equal(profileStorage.profileDataKey('robin', STORY_FIRST_BOOT_KEY), `${PROFILE_KEY}.robin.${STORY_FIRST_BOOT_KEY}`);
  assert.ok(statSync(path.join(root, 'src/game/ProfileStorage.ts')).size > 0);
});
