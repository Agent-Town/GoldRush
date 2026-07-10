import { expect, test, type Page } from '@playwright/test';
import {
  PROFILE_KEY,
  RUN_SUSPEND_KEY,
  TOWN_NAME_KEY,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { RUN_SUSPEND_REJECTION_KEY, RUN_SUSPEND_REJECTION_LINE } from '../src/game/RunSuspend';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

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

test('imported and cloud-pulled ledgers drop hostile suspend payloads before storage', async ({ page }) => {
  await seedProfile(page, validSuspend());
  const errors = collectErrors(page);
  await page.goto('/');

  const result = await page.evaluate(
    async ({ profileKey, runKey, envelope }) => {
      const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as any;
      const imported = transfer.unpackProfile(localStorage, envelope as any);
      const cloud = transfer.restoreProfileBundle(localStorage, {
        ...(envelope as any),
        profile: { id: 'cloud', name: 'Cloud', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
      });
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
      const importedProfile = state.profiles.find((profile) => profile.name === 'Imported');
      const cloudProfile = state.profiles.find((profile) => profile.id === 'cloud');
      return {
        importedOk: imported.ok,
        cloudOk: cloud.ok,
        importedSuspend: importedProfile ? localStorage.getItem(`${profileKey}.${importedProfile.id}.${runKey}`) : 'missing',
        cloudSuspend: cloudProfile ? localStorage.getItem(`${profileKey}.${cloudProfile.id}.${runKey}`) : 'missing',
      };
    },
    { profileKey: PROFILE_KEY, runKey: RUN_SUSPEND_KEY, envelope: hostileImportEnvelope() },
  );

  expect(result).toEqual({ importedOk: true, cloudOk: true, importedSuspend: null, cloudSuspend: null });
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
