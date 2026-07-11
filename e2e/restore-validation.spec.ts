import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  PROFILE_KEY,
  RUN_SUSPEND_KEY,
  TOWN_NAME_KEY,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  RUN_SUSPEND_REJECTION_KEY,
  RUN_SUSPEND_REJECTION_LINE,
  restoreRunSuspendSnapshot,
  runSuspendRestoreFailure,
} from '../src/game/RunSuspend';
import { decodeLockstepSnapshotTransport, prepareLockstepSnapshotTransport } from '../src/mp/LockstepClient';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
const SOL_ARTIFACT_DIR = path.join(process.cwd(), 'artifacts/sol/mp-snapshot-completeness');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function seedProfile(page: Page, runDatum: unknown, options: { raw?: boolean } = {}): Promise<void> {
  await page.addInitScript(
    ({ profileKey, runKey, townKey, rejectionKey, runDatum, raw }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
      localStorage.setItem(`${profileKey}.robin.${runKey}`, raw ? String(runDatum) : JSON.stringify(runDatum));
      localStorage.removeItem(rejectionKey);
    },
    { profileKey: PROFILE_KEY, runKey: RUN_SUSPEND_KEY, townKey: TOWN_NAME_KEY, rejectionKey: RUN_SUSPEND_REJECTION_KEY, runDatum, raw: options.raw === true },
  );
}

test('continue-run rejects truncated suspend JSON with a ledger card and no crash', async ({ page }) => {
  await seedProfile(page, '{"v":1,"wave":3,', { raw: true });
  const errors = collectErrors(page);

  await page.goto('/');

  await expect(page.getByTestId('start-menu-rejected-claim')).toContainText(RUN_SUSPEND_REJECTION_LINE);
  await expect(page.getByTestId('start-menu-continue')).toHaveCount(0);
  await expect(page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).resolves.toBeNull();
  assertNoErrors(errors);
});

test('direct boot rejects type-swapped deep suspend fields and stays at safe run state', async ({ page }) => {
  const malformed = validSuspend();
  (malformed as any).rng = { waves: { seed: 'not-a-number', calls: 0 }, upgrades: null };
  (malformed as any).hero.position = { x: 0, y: 0, z: 'NaN' };
  (malformed as any).waveSystem.plannedPulses = [{}];
  (malformed as any).economy.resources.pressure.amount = Number.NaN;
  await seedProfile(page, malformed);
  const errors = collectErrors(page);

  await page.goto('/?contract=the-claim&nowaves&nospawn&nolevel&seed=restore-type-swap');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  expect(diagnostics?.run.suspend.restored).toBe(false);
  expect(diagnostics?.economy.gold).toBe(0);
  await expect(page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).resolves.toBeNull();
  assertNoErrors(errors);
});

test('economy log rows are validated before replay and hostile deltas are dropped', async ({ page }) => {
  const snapshot = validSuspend();
  snapshot.economy.log.push({ id: 'hostile', at: 4, type: 'gold_granted', source: 'debug', amount: 900_000_001 } as any);
  snapshot.economy.gold = 20;
  await seedProfile(page, snapshot);
  const errors = collectErrors(page);

  await page.goto('/?contract=the-claim&nowaves&nospawn&nolevel&seed=restore-bad-economy-row');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const state = await page.evaluate(
    (runKey) => ({
      gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold,
      restored: window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored,
      logLength: window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength,
      storedLogLength: JSON.parse(localStorage.getItem(runKey) ?? '{}').economy?.log?.length,
    }),
    RUN_SUSPEND_KEY,
  );
  expect(state).toMatchObject({ gold: 20, restored: true, logLength: 1, storedLogLength: 1 });
  assertNoErrors(errors);
});

test('v1 snapshots migrate to a durable v2 future-state envelope', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&nolevel&seed=restore-v1-v2');
  const migrated = await page.evaluate(async (fixture) => {
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const once = suspend.normalizeRunSuspendDatum(fixture);
    const twice = once ? suspend.normalizeRunSuspendDatum(JSON.parse(JSON.stringify(once))) : null;
    return {
      once,
      stable: once !== null && JSON.stringify(once) === JSON.stringify(twice),
    };
  }, validSuspend());

  expect(migrated.stable).toBe(true);
  expect(migrated.once).toMatchObject({
    v: 2,
    migratedFromV1: true,
    rng: { harvest: null },
    harvest: null,
    goldPickups: [],
    combat: {
      xp: 0,
      audit: { ownerKills: {}, ownerDamage: {} },
      shooters: [
        { resumeKey: 'hero:0:rig', timer: 0, targetId: -1, missTargetId: -1, misses: 0 },
        { resumeKey: 'hero:0:blast', timer: 0, targetId: -1, missTargetId: -1, misses: 0 },
      ],
      projectiles: [],
      blastCharges: [],
      xpMotes: [],
    },
    baron: { beaten: false, ceremony: null },
    runManager: { secured: false, rush: false },
  });
  assertNoErrors(errors);
});

test('combat shooter registration order survives v2 normalization and restore', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&nolevel&seed=restore-shooter-order');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);

  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    const freshOrder = test.captureSuspend().combat.shooters.map((shooter) => shooter.resumeKey);
    const beaconPlaced = test.placeFree('sentry_beacon', -4, 12);
    const turretPlaced = test.placeFree('turret', 4, 12);
    const snapshot = test.captureSuspend();
    const registeredOrder = snapshot.combat.shooters.map((shooter) => shooter.resumeKey);
    const requestedOrder = ['building:turret:0', 'hero:0:rig', 'building:sentry_beacon:0', 'hero:0:blast'];
    const shootersByKey = new Map(snapshot.combat.shooters.map((shooter) => [shooter.resumeKey, shooter]));
    snapshot.combat.shooters = requestedOrder.map((key) => shootersByKey.get(key)!);

    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const normalized = suspend.normalizeRunSuspendDatum(snapshot);
    const normalizedOrder = normalized?.combat.shooters.map((shooter) => shooter.resumeKey) ?? [];
    const restored = normalized ? test.restoreSuspend(normalized) : false;
    const restoredOrder = test.captureSuspend().combat.shooters.map((shooter) => shooter.resumeKey);
    return { freshOrder, beaconPlaced, turretPlaced, registeredOrder, requestedOrder, normalizedOrder, restored, restoredOrder };
  });

  expect(result.freshOrder).toEqual(['hero:0:rig', 'hero:0:blast']);
  expect(result.beaconPlaced).toBe(true);
  expect(result.turretPlaced).toBe(true);
  expect(result.registeredOrder).toEqual([
    'hero:0:rig',
    'hero:0:blast',
    'building:sentry_beacon:0',
    'building:turret:0',
  ]);
  expect(result.normalizedOrder).toEqual(result.requestedOrder);
  expect(result.restored).toBe(true);
  expect(result.restoredOrder).toEqual(result.requestedOrder);
  assertNoErrors(errors);
});

test('page-load restore materializes run-manager state after manager assignment', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=the-claim&nowaves&nospawn&nolevel&seed=restore-run-manager-boot');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);

  const expected = await page.evaluate((runKey) => {
    const snapshot = structuredClone(window.__GR_TEST__!.captureSuspend()) as any;
    snapshot.meta.tracks.agent = 2;
    snapshot.runManager = {
      secured: true,
      rush: true,
      meta: structuredClone(snapshot.meta),
      payout: { territory: 1, science: 2, hero: 3, agent: 4 },
    };
    localStorage.setItem(runKey, JSON.stringify(snapshot));
    return snapshot.runManager;
  }, RUN_SUSPEND_KEY);

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  const restored = await page.evaluate((metaKey) => {
    const before = structuredClone(window.__THREE_GAME_DIAGNOSTICS__!.run);
    window.__GR_TEST__!.startWaveForTest(100);
    return {
      before,
      after: structuredClone(window.__THREE_GAME_DIAGNOSTICS__!.run),
      persistedMeta: JSON.parse(localStorage.getItem(metaKey) ?? 'null'),
    };
  }, META_PROGRESS_KEY);

  expect(restored.before).toMatchObject({
    secured: true,
    rush: true,
    meta: expected.meta,
    victoryPayout: expected.payout,
    suspend: { restored: true },
  });
  expect(restored.after.meta).toEqual(restored.before.meta);
  expect(restored.after.victoryPayout).toEqual(restored.before.victoryPayout);
  expect(restored.after).toMatchObject({ secured: true, rush: true });
  expect(restored.persistedMeta).toEqual(expected.meta);
  assertNoErrors(errors);
});

test('failed restore never reaches the profile-persistence commit stage', () => {
  let researchWrites = 0;
  const runManagerRestores: Array<{ persistMeta?: boolean }> = [];
  const game = {
    activeContract: { id: 'the-claim' },
    researchStorage: {
      getItem: () => null,
      setItem: () => {
        researchWrites += 1;
      },
    },
    runManager: {
      restoreSuspend: (_state: unknown, options: { persistMeta?: boolean }) => runManagerRestores.push(options),
    },
  };

  expect(restoreRunSuspendSnapshot(game, validSuspend())).toBe(false);
  expect(runSuspendRestoreFailure()).toBe('progression');
  expect(researchWrites).toBe(0);
  expect(runManagerRestores).toEqual([]);
});

test('v2 future-state fuzz rejects malformed and duplicate owner state', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nokill&nosteal&nowreck&seed=restore-v2-fuzz');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    if (!window.__GR_TEST__!.placeFree('palisade', 0.8, 12)) throw new Error('failed to place fuzz building');
    window.__GR_TEST__!.spawnPack(1, 4, { speedScale: 0, eliteKind: 'baron', variantId: 'fuzz-baron' });
    window.__GR_TEST__!.spawnGoldPickup(6, 6, 4);
    window.__GR_TEST__!.spawnXpMote(7, 7, 3);
  });
  const snapshot = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  const results = await page.evaluate(async (valid) => {
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const cases: Array<[string, (copy: any) => void]> = [
      ['harvest rng type', (copy) => (copy.rng.harvest.calls = 'many')],
      ['wave rng missing', (copy) => (copy.rng.waves = null)],
      ['upgrade rng missing', (copy) => (copy.rng.upgrades = null)],
      ['wave Baron latch', (copy) => (copy.waveSystem.baronSpawned = 'yes')],
      ['hero XP invariant', (copy) => (copy.hero.xpInto += 1)],
      ['combat XP invariant', (copy) => (copy.combat.xp = copy.hero.xpTotal + 1)],
      ['hero HP bound', (copy) => (copy.hero.hp = copy.hero.maxHp + 1)],
      ['hero max HP derivation', (copy) => (copy.hero.maxHp += 1)],
      ['hero offer identity', (copy) => Object.assign(copy.hero, { pendingLevels: 1, offer: ['not-an-upgrade'] })],
      ['hero stack limit', (copy) => (copy.hero.stacks.double_tap_coil = 999)],
      ['enemy duplicate slot', (copy) => copy.enemies.active.push(structuredClone(copy.enemies.active[0]))],
      ['enemy HP bound', (copy) => (copy.enemies.active[0].hp = copy.enemies.active[0].maxHp + 1)],
      ['enemy route cursor', (copy) => (copy.enemies.active[0].scriptedRouteIndex = 1)],
      ['building HP bound', (copy) => (copy.buildings[0].hp = copy.buildings[0].maxHp + 1)],
      ['building wreck identity', (copy) => Object.assign(copy.buildings[0], { hp: 0, wrecked: false })],
      ['economy duplicated gold', (copy) => (copy.economy.resources.gold.amount += 1)],
      ['economy unknown resource', (copy) => (copy.economy.resources.ore = { amount: 1, cap: 2 })],
      ['pickup slot range', (copy) => (copy.goldPickups[0].slot = 999)],
      ['shooter duplicate key', (copy) => copy.combat.shooters.push(structuredClone(copy.combat.shooters[0]))],
      ['shooter missing key', (copy) => copy.combat.shooters.pop()],
      ['combat audit missing', (copy) => delete copy.combat.audit],
      ['combat owner damage finite', (copy) => (copy.combat.audit.ownerDamage.hero = Number.NaN)],
      ['combat last shot kind', (copy) => (copy.combat.audit.lastShotKind = 'arrow')],
      ['projectile slot range', (copy) => copy.combat.projectiles.push({
        slot: 999,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        life: 1,
        damage: 1,
        ownerId: 'hero',
        shooterKey: 'hero:0:rig',
        targetId: 0,
        visualStartY: 0,
        visualEndY: 0,
        visualDistance: 1,
        visualTravel: 0,
      })],
      ['blast slot range', (copy) => copy.combat.blastCharges.push({
        slot: 999,
        origin: { x: 0, y: 0, z: 0 },
        target: { x: 1, y: 0, z: 1 },
        age: 0,
        duration: 1,
        damage: 1,
        radius: 1,
        ownerId: 'hero_blast',
        apexY: 0,
      })],
      ['mote duplicate slot', (copy) => copy.combat.xpMotes.push(structuredClone(copy.combat.xpMotes[0]))],
      ['harvest duplicate node', (copy) => copy.harvest.nodes.push(structuredClone(copy.harvest.nodes[0]))],
      ['harvest orphan progress', (copy) => Object.assign(copy.harvest, { channelNodeId: null, progress: 0.5 })],
      ['ceremony elapsed', (copy) => (copy.baron.ceremony = { atSim: 1, elapsedSeconds: Number.NaN })],
      ['megaproject id', (copy) => (copy.megaproject = { id: '', project: { stage: 0, funded: false, ticksRemaining: 0, hp: 0, delayTicks: 0, defenseWave: 0 } })],
      ['run manager invariant', (copy) => Object.assign(copy.runManager, { secured: false, rush: true })],
      ['secured pause invariant', (copy) => Object.assign(copy.runManager, {
        secured: true,
        rush: false,
        payout: { territory: 0, science: 0, hero: 0, agent: 0 },
      })],
      ['research canonical identity', (copy) => copy.research.taken.push('unknown-research-node')],
      ['agent consent type', (copy) => (copy.agent.consent.abilities.auto_collect = 'yes')],
      ['native harvest missing', (copy) => (copy.harvest = null)],
      ['native agent missing', (copy) => (copy.agent = null)],
      ['native controls missing', (copy) => (copy.controls = null)],
    ];
    const canonicalInput = valid;
    const validAccepted = suspend.normalizeRunSuspendDatum(canonicalInput) !== null;
    let validRejection: unknown = null;
    if (!validAccepted) {
      localStorage.setItem('gr.run.v1', JSON.stringify(canonicalInput));
      suspend.readRunSuspend(localStorage);
      validRejection = JSON.parse(localStorage.getItem('gr.run.v1.rejected') ?? 'null');
    }
    return {
      validAccepted,
      validRejection,
      writtenAtPreserved: suspend.normalizeRunSuspendDatum(canonicalInput)?.writtenAt === canonicalInput.writtenAt,
      mutations: cases.map(([name, mutate]) => {
        const copy = structuredClone(canonicalInput);
        mutate(copy);
        return { name, accepted: suspend.normalizeRunSuspendDatum(copy) !== null };
      }),
    };
  }, snapshot);

  expect(results.validAccepted, JSON.stringify(results.validRejection)).toBe(true);
  expect(results.writtenAtPreserved).toBe(true);
  expect(results.mutations).toEqual(results.mutations.map(({ name }) => ({ name, accepted: false })));
  assertNoErrors(errors);
});

test('v2 restore resumes an in-flight level choice without rerolling it', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&seed=restore-level-choice');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);
  await page.evaluate(() => window.__GR_TEST__!.grantXp(12));
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.state === 'levelup');

  const result = await page.evaluate(async () => {
    const before = structuredClone(window.__THREE_GAME_DIAGNOSTICS__!.progression);
    const snapshot = window.__GR_TEST__!.captureSuspend();
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const normalized = suspend.normalizeRunSuspendDatum(snapshot);
    let rejection = null;
    if (!normalized) {
      localStorage.setItem('gr.run.v1', JSON.stringify(snapshot));
      suspend.readRunSuspend(localStorage);
      rejection = JSON.parse(localStorage.getItem('gr.run.v1.rejected') ?? 'null');
    }
    const restored = window.__GR_TEST__!.restoreSuspend(snapshot);
    const after = structuredClone(window.__THREE_GAME_DIAGNOSTICS__!.progression);
    return {
      restored,
      failure: suspend.runSuspendRestoreFailure(),
      rejection,
      before: { offer: before.offer, pendingLevels: before.pendingLevels },
      after: { offer: after.offer, pendingLevels: after.pendingLevels },
      state: window.__THREE_GAME_DIAGNOSTICS__!.state,
    };
  });

  expect(result.restored, JSON.stringify(result.rejection) ?? result.failure ?? 'no restore failure stage').toBe(true);
  expect(result.after).toEqual(result.before);
  expect(result.state).toBe('levelup');
  assertNoErrors(errors);
});

test('v2 dead-state restore rematerializes a usable run ledger', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&nolevel&seed=restore-death-ledger');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);

  const restored = await page.evaluate(() => {
    const snapshot = structuredClone(window.__GR_TEST__!.captureSuspend()) as any;
    snapshot.hero.hp = 0;
    snapshot.controls.runState = 'dead';
    snapshot.controls.paused = false;
    snapshot.controls.playerPauseActive = false;
    return window.__GR_TEST__!.restoreSuspend(snapshot);
  });

  expect(restored).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('dead');
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('stake-again')).toBeVisible();
  assertNoErrors(errors);
});

test('full-capacity snapshots stay below relay and cloud payload ceilings', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nokill&seed=restore-wire-budget');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const snapshot = await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.spawnPack(1, 5, { speedScale: 0, eliteKind: 'baron' });
    return structuredClone(window.__GR_TEST__!.captureSuspend());
  });

  const fullSnapshot = structuredClone(snapshot) as any;
  const enemy = fullSnapshot.enemies.active[0];
  fullSnapshot.enemies.active = Array.from({ length: 96 }, (_, slot) => ({ ...structuredClone(enemy), slot }));
  fullSnapshot.economy.log = Array.from({ length: 2_048 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      at: index / 30,
      type: 'gold_sluiced',
      sluiceId: `sluice-${(index % 12) + 1}`,
      amount: 3,
  }));
  const rawBytes = new TextEncoder().encode(JSON.stringify(fullSnapshot)).byteLength;
  const wire = await prepareLockstepSnapshotTransport(fullSnapshot);
  const wireBytes = new TextEncoder().encode(JSON.stringify(wire)).byteLength;
  const decoded = await decodeLockstepSnapshotTransport(wire);
  const cloud = await page.evaluate(async ({ fullSnapshot, runKey }) => {
    localStorage.setItem(runKey, JSON.stringify(fullSnapshot));
    const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as typeof import('../src/game/ProfileTransfer');
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const packed = await transfer.packActiveProfileForCloud(localStorage);
    const expanded = await transfer.expandCloudProfileTransfer(packed.envelope);
    const request = {
      profileId: packed.envelope.profile.id,
      envelope: { ...packed.envelope, kind: 'gold-rush-ledger-bundle' },
      baseSavedAt: null,
      acknowledgeConflict: false,
    };
    const stableStringify = (value: any): string => {
      if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
      if (!value || typeof value !== 'object') return JSON.stringify(value);
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    };
    const expectedSnapshot = suspend.normalizeRunSuspendDatum(fullSnapshot);
    const actualSnapshot = suspend.normalizeRunSuspendDatum(expanded?.data[runKey]);
    return {
      requestBytes: new TextEncoder().encode(JSON.stringify(request)).byteLength,
      compressed: '$goldRushGzipDataV1' in packed.envelope.data,
      version: packed.envelope.version,
      legacyV1ReaderAccepts: packed.envelope.version === 1,
      roundTrip:
        expectedSnapshot !== null &&
        actualSnapshot !== null &&
        stableStringify(suspend.runSuspendFutureState(actualSnapshot)) ===
          stableStringify(suspend.runSuspendFutureState(expectedSnapshot)),
    };
  }, { fullSnapshot, runKey: RUN_SUSPEND_KEY });
  const result = {
    rawBytes,
    wireBytes,
    codec: (wire as { codec?: string }).codec ?? null,
    roundTrip: JSON.stringify(decoded) === JSON.stringify(fullSnapshot),
    cloud,
  };
  const report = `${JSON.stringify(result, null, 2)}\n`;
  await mkdir(SOL_ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(SOL_ARTIFACT_DIR, `capacity-${testInfo.project.name}.json`), report);
  await testInfo.attach('snapshot-capacity', { body: report, contentType: 'application/json' });

  expect(result.rawBytes).toBeGreaterThan(200 * 1024);
  expect(result.wireBytes).toBeLessThan(190 * 1024);
  expect(result.codec).toBe('gzip-base64-v1');
  expect(result.roundTrip).toBe(true);
  expect(result.cloud.compressed).toBe(true);
  expect(result.cloud.version).toBe(2);
  expect(result.cloud.legacyV1ReaderAccepts).toBe(false);
  expect(result.cloud.requestBytes).toBeLessThan(200 * 1024);
  expect(result.cloud.roundTrip, JSON.stringify(result.cloud)).toBe(true);
  assertNoErrors(errors);
});

test('gzip snapshot decoding stops at the output ceiling', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&nokill&seed=gzip-output-limit');
  const result = await page.evaluate(async () => {
    const gzip = (await Function('return import("/src/core/GzipJson.ts")')()) as typeof import('../src/core/GzipJson');
    const encoded = await gzip.gzipTextBase64(JSON.stringify({ payload: 'x'.repeat(256 * 1024) }));
    try {
      await gzip.gunzipJsonBase64(encoded, 32 * 1024);
      return 'accepted';
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });
  expect(result).toBe('gzip_output_too_large');
});

test('compressed non-record profile data is rejected without touching local bytes', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&nokill&seed=gzip-array-reject');
  const result = await page.evaluate(async () => {
    const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as typeof import('../src/game/ProfileTransfer');
    const profileStorage = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const gzip = (await Function('return import("/src/core/GzipJson.ts")')()) as typeof import('../src/core/GzipJson');
    const metaKey = profileStorage.profileDataKey('robin', 'gr.meta.v1');
    const localMeta = JSON.stringify({ version: 1, tracks: { territory: 2, science: 7, hero: 0, agent: 0 } });
    const values = new Map<string, string>([
      [
        profileStorage.PROFILE_KEY,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      ],
      [metaKey, localMeta],
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    const encoded = await gzip.gzipTextBase64('[]');
    const expanded = await transfer.expandCloudProfileTransfer({
      kind: 'goldrush.profile.ledger',
      version: 2,
      exportedAt: new Date().toISOString(),
      profile: { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
      data: { $goldRushGzipDataV1: encoded },
    });
    const restored = expanded ? transfer.restoreProfileBundle(storage, expanded) : null;
    return { expanded: expanded !== null, restored, before: localMeta, after: values.get(metaKey) ?? null };
  });
  expect(result.expanded).toBe(false);
  expect(result.restored).toBeNull();
  expect(result.after).toBe(result.before);
});

test('active transient owners round-trip exactly and due seams resume on the next tick', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=restore-owner-roundtrip');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);

  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('enemy.speed', 0);
    const placedSluice = test.placeFree('sluice', 0, 7);
    const heroPosition = test.captureSuspend().hero.position;
    test.spawnEnemyAt(heroPosition.x + 2, heroPosition.z);
    test.launchBlastAt(heroPosition.x + 2, heroPosition.z, 0.2);
    test.advanceSim(3);
    test.spawnGoldPickup(15, 15, 7);
    test.spawnXpMote(16, 15, 5);
    test.launchBlastAt(10, 10, 1.25);

    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const prepared = structuredClone(test.captureSuspend()) as any;
    const due = prepared.harvest.nodes[0];
    due.active = false;
    due.remaining = 0;
    due.respawnScheduled = true;
    due.respawnIn = 0;
    if (prepared.harvest.channelNodeId === due.id) {
      prepared.harvest.channelNodeId = null;
      prepared.harvest.progress = 0;
    }
    prepared.agent.consent.abilities.auto_collect = false;
    const canonical = suspend.normalizeRunSuspendDatum(prepared)!;
    const restored = test.restoreSuspend(canonical);
    const after = test.captureSuspend();
    const expectedFuture = suspend.runSuspendFutureState(canonical) as any;
    const actualFuture = suspend.runSuspendFutureState(after) as any;
    const differences: string[] = [];
    const visit = (expected: any, actual: any, path = 'root'): void => {
      if (differences.length >= 12 || Object.is(expected, actual)) return;
      if (!expected || !actual || typeof expected !== 'object' || typeof actual !== 'object') {
        differences.push(`${path}: ${JSON.stringify(expected)} != ${JSON.stringify(actual)}`);
        return;
      }
      const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
      for (const key of keys) visit(expected[key], actual[key], `${path}.${key}`);
    };
    visit(expectedFuture, actualFuture);
    const exact = differences.length === 0;
    const counts = {
      pickups: after.goldPickups.length,
      motes: after.combat.xpMotes.length,
      blasts: after.combat.blastCharges.length,
      ownerDamage: Object.values(after.combat.audit.ownerDamage).reduce((total, amount) => total + amount, 0),
      sluiceTimer: (after.buildings.find((building: any) => building.id === 'sluice') as any)?.sluice?.timer ?? null,
      consent: after.agent?.consent.abilities.auto_collect,
    };
    test.advanceSim(1 / 30);
    const dueAfterTick = test.captureSuspend().harvest?.nodes.find((node) => node.id === due.id);
    return { restored, exact, differences, counts, dueAfterTick, placedSluice };
  });

  expect(result.restored).toBe(true);
  expect(result.placedSluice).toBe(true);
  expect(result.exact, result.differences.join('\n')).toBe(true);
  expect(result.counts).toMatchObject({ pickups: 1, motes: 1, blasts: 1, consent: false });
  expect(result.counts.ownerDamage).toBeGreaterThan(0);
  expect(result.counts.sluiceTimer).toBeGreaterThan(0);
  expect(result.dueAfterTick?.active).toBe(true);
  assertNoErrors(errors);
});

test('sparse building slots restore into their original pool indices', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&nolevel&seed=restore-building-holes');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);

  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    const placed: Array<{ x: number; z: number }> = [];
    for (let z = 6; z <= 18 && placed.length < 2; z += 2) {
      for (let x = -12; x <= 12 && placed.length < 2; x += 2) {
        if (test.placeFree('palisade', x, z)) placed.push({ x, z });
      }
    }
    const beforeDemolish = test.captureSuspend().buildings.filter((building) => building.id === 'palisade');
    if (beforeDemolish[0]) test.teleport(beforeDemolish[0].position.x, beforeDemolish[0].position.z);
    const removed = beforeDemolish[0] ? test.demolish('palisade', beforeDemolish[0].index) : false;
    const snapshot = test.captureSuspend();
    const expectedIndices = snapshot.buildings.filter((building) => building.id === 'palisade').map((building) => building.index);
    const restored = test.restoreSuspend(snapshot);
    const actualIndices = test.captureSuspend().buildings.filter((building) => building.id === 'palisade').map((building) => building.index);
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const exact = JSON.stringify(suspend.runSuspendFutureState(snapshot)) === JSON.stringify(suspend.runSuspendFutureState(test.captureSuspend()));
    return { placed, removed, beforeIndices: beforeDemolish.map((building) => building.index), expectedIndices, actualIndices, restored, exact };
  });

  expect(result.placed).toHaveLength(2);
  expect(result.removed).toBe(true);
  expect(result.beforeIndices).toEqual([0, 1]);
  expect(result.expectedIndices).toEqual([1]);
  expect(result.actualIndices).toEqual([1]);
  expect(result.restored).toBe(true);
  expect(result.exact).toBe(true);
  assertNoErrors(errors);
});

test('active megaproject wrecker references survive strict normalization and restore', async ({ page }) => {
  await page.addInitScript((metaKey) => {
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
  }, META_PROGRESS_KEY);
  const errors = collectErrors(page);
  await page.goto('/?debug&megaproject=dev&nowaves&nolevel&nokill&nosteal&seed=restore-megaproject-target');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const footprint = window.__THREE_GAME_DIAGNOSTICS__!.megaproject.siteFootprint!;
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('wreck.damage', 1);
    test.setBalance('wreck.hitCooldown', 120);
    test.grantGold(100);
    test.teleport(footprint.x, footprint.z);
    if (!test.fundMegaproject()) throw new Error('failed to fund megaproject');
    test.spawnPack(1, 0.1, { speedScale: 0, wrecker: true });
  });
  await page.waitForFunction(() => {
    const snapshot = window.__GR_TEST__?.captureSuspend();
    return snapshot?.megaproject?.targetActive === true && snapshot.enemies.active[0]?.currentBuildingId === 'megaproject:dev-stamp-mill-site';
  }, undefined, { timeout: 10_000 });

  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const snapshot = test.captureSuspend();
    const normalized = suspend.normalizeRunSuspendDatum(snapshot);
    const restored = normalized ? test.restoreSuspend(normalized) : false;
    const after = test.captureSuspend();
    const differences: string[] = [];
    const visit = (expected: any, actual: any, path = 'root'): void => {
      if (differences.length >= 12 || Object.is(expected, actual)) return;
      if (!expected || !actual || typeof expected !== 'object' || typeof actual !== 'object') {
        differences.push(`${path}: ${JSON.stringify(expected)} != ${JSON.stringify(actual)}`);
        return;
      }
      const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
      for (const key of keys) visit(expected[key], actual[key], `${path}.${key}`);
    };
    if (normalized) visit(suspend.runSuspendFutureState(normalized), suspend.runSuspendFutureState(after));
    return {
      normalized: normalized !== null,
      restored,
      targetActive: after.megaproject?.targetActive ?? false,
      targetId: after.enemies.active[0]?.currentBuildingId ?? null,
      exact: differences.length === 0,
      differences,
    };
  });

  expect(result, result.differences.join('\n')).toMatchObject({
    normalized: true,
    restored: true,
    targetActive: true,
    targetId: 'megaproject:dev-stamp-mill-site',
    exact: true,
  });
  assertNoErrors(errors);
});

test('imports quarantine hostile suspend payloads and cloud restore rejects them atomically', async ({ page }) => {
  await seedProfile(page, validSuspend());
  const errors = collectErrors(page);
  await page.goto('/');

  const result = await page.evaluate(
    async ({ profileKey, runKey, envelope }) => {
      const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as any;
      const imported = transfer.unpackProfile(localStorage, envelope as any);
      const localRunKey = `${profileKey}.robin.${runKey}`;
      const beforeCloud = localStorage.getItem(localRunKey);
      const cloud = transfer.restoreProfileBundle(localStorage, {
        ...(envelope as any),
        profile: { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
      });
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
      const importedProfile = state.profiles.find((profile) => profile.name === 'Imported');
      return {
        importedOk: imported.ok,
        cloudOk: cloud.ok,
        importedSuspend: importedProfile ? localStorage.getItem(`${profileKey}.${importedProfile.id}.${runKey}`) : 'missing',
        cloudPreserved: localStorage.getItem(localRunKey) === beforeCloud,
      };
    },
    { profileKey: PROFILE_KEY, runKey: RUN_SUSPEND_KEY, envelope: hostileImportEnvelope() },
  );

  expect(result).toEqual({ importedOk: true, cloudOk: false, importedSuspend: null, cloudPreserved: true });
  assertNoErrors(errors);
});

test('cloud restore write failure leaves local profile bytes intact and records the rejection card', async ({ page }) => {
  await seedProfile(page, validSuspend());
  const errors = collectErrors(page);
  await page.goto('/');

  const result = await page.evaluate(
    async ({ profileKey, townKey, metaKey, rejectionKey }) => {
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Local Quartz');
      localStorage.setItem(`${profileKey}.robin.${metaKey}`, JSON.stringify({ version: 1, tracks: { territory: 1, science: 3, hero: 0, agent: 0 } }));
      const before = new Map<string, string | null>([
        [profileKey, localStorage.getItem(profileKey)],
        [`${profileKey}.robin.${townKey}`, localStorage.getItem(`${profileKey}.robin.${townKey}`)],
        [`${profileKey}.robin.${metaKey}`, localStorage.getItem(`${profileKey}.robin.${metaKey}`)],
      ]);
      const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as any;
      const nativeSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItemWithInjectedFailure(key: string, value: string): void {
        if (key === `${profileKey}.robin.${townKey}`) throw new DOMException('quota', 'QuotaExceededError');
        return nativeSetItem.call(this, key, value);
      };
      try {
        const restored = transfer.restoreProfileBundle(localStorage, {
          kind: 'goldrush.profile.ledger',
          version: 1,
          exportedAt: '2026-07-10T00:00:00.000Z',
          profile: { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
          data: {
            [townKey]: 'Cloud Bend',
            [metaKey]: { version: 1, tracks: { territory: 4, science: 9, hero: 0, agent: 0 } },
          },
        });
        return {
          restored,
          after: [...before].map(([key, value]) => [key, value, localStorage.getItem(key)]),
          rejection: JSON.parse(localStorage.getItem(rejectionKey) ?? '{}').message,
          leakedTemp: Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? '').some((key) =>
            key.startsWith('goldrush.profile.ledger.restore.'),
          ),
        };
      } finally {
        Storage.prototype.setItem = nativeSetItem;
      }
    },
    { profileKey: PROFILE_KEY, townKey: TOWN_NAME_KEY, metaKey: META_PROGRESS_KEY, rejectionKey: RUN_SUSPEND_REJECTION_KEY },
  );

  expect(result.restored).toMatchObject({ ok: false });
  expect(result.after).toEqual(result.after.map(([key, before]) => [key, before, before]));
  expect(result.rejection).toBe(RUN_SUSPEND_REJECTION_LINE);
  expect(result.leakedTemp).toBe(false);
  assertNoErrors(errors);
});

function hostileImportEnvelope(): unknown {
  const bad = validSuspend();
  (bad as any).waveSystem.nextWaveAt = Number.POSITIVE_INFINITY;
  (bad as any).counters.weapon = 'rifle';
  return {
    kind: 'goldrush.profile.ledger',
    version: 1,
    exportedAt: '2026-07-10T00:00:00.000Z',
    profile: { id: 'imported', name: 'Imported', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
    data: {
      [TOWN_NAME_KEY]: 'Badwater',
      [RUN_SUSPEND_KEY]: bad,
    },
  };
}

function validSuspend(): any {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    v: 1,
    wave: 3,
    timeAlive: 30,
    writtenAt: 1,
    lastWriteMs: 0,
    sizeBytes: 0,
    trigger: 'wave-boundary',
    copy: 'The claim resumes at wave 3.',
    contractId: 'the-claim',
    seed: null,
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave: 3,
      pulse: 0,
      edge: null,
      budget: 0,
      waveSpawnedTotal: 0,
      nextTrickleAt: 0,
      nextWaveAt: 999,
      nextPlanWaveAt: 999,
      nextPlanWave: 4,
      plannedPulses: [],
      copyCursor: 0,
      lastCopy: '',
      currentAtSim: 30,
      waveState: 'quiet',
      lastPulseAt: 0,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: {
      gold: 20,
      bankCap: 200,
      resources: { pressure: { amount: 0, cap: 100 } },
      log: [{ id: 'grant-20', at: 1, type: 'gold_granted', source: 'debug', amount: 20 }],
      summary: {},
    },
    hero: {
      level: 1,
      xpTotal: 0,
      spentXp: 0,
      xpInto: 0,
      pendingLevels: 0,
      offer: null,
      stacks: {},
      hp: 100,
      maxHp: 100,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    },
    buildings: [],
    counters: {
      kills: 0,
      stolenTotal: 0,
      reclaimedTotal: 0,
      buildingHitsResolved: 0,
      buildingsWrecked: 0,
      weapon: 'rig',
      weaponToggleCount: 0,
      blastTime: 0,
    },
    meta,
    research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null },
  };
}
