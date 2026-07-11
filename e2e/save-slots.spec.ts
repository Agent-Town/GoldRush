import { mkdir, readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { PROFILE_KEY, RUN_SUSPEND_KEY, TOWN_NAME_KEY } from '../src/game/ProfileStorage';
import {
  AUTO_SAVE_SLOT_NAME,
  SAVE_SLOTS_KEY,
  SAVE_SLOTS_RECOVERY_KEY,
  type SaveSlot,
  type SaveSlotsEnvelope,
} from '../src/game/SaveSlots';
import { RUN_SUSPEND_REJECTION_LINE } from '../src/game/RunSuspend';

const QUERY = '?debug&timescale=40&nokill&nolevel&nosteal&nowreck&seed=save-slots';
const RESTORE_QUERY = '?debug&nowaves&nolevel&nokill&nosteal&nowreck&seed=save-slots';
const SHOT_DIR = 'artifacts/save-slots';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SavedSuspend = {
  wave: number;
  contractId: string;
  waveSystem: { waveSpawnedTotal: number };
  enemies: { active: unknown[] };
  economy: { gold: number; log: unknown[] };
  hero: { hp: number; level: number; xpInto: number; stacks: Record<string, number>; position: { x: number; z: number } };
  buildings: { id: string; tier: number; hp: number; maxHp: number; wrecked: boolean; position: { x: number; z: number } }[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, options: { slots?: SaveSlotsEnvelope; suspend?: unknown; fillerBytes?: number } = {}): Promise<void> {
  const marker = `seed-${Date.now()}-${Math.random()}`;
  await page.addInitScript(
    ({ marker, profileKey, townKey, slotsKey, suspendKey, slots, suspend, fillerBytes }) => {
      if (localStorage.getItem('__gr_save_slots_seed') === marker) return;
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('__gr_save_slots_seed', marker);
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
      if (slots) localStorage.setItem(`${profileKey}.robin.${slotsKey}`, JSON.stringify(slots));
      if (suspend) localStorage.setItem(`${profileKey}.robin.${suspendKey}`, JSON.stringify(suspend));
      if (fillerBytes) localStorage.setItem('gr.test.filler', 'x'.repeat(fillerBytes));
    },
    {
      marker,
      profileKey: PROFILE_KEY,
      townKey: TOWN_NAME_KEY,
      slotsKey: SAVE_SLOTS_KEY,
      suspendKey: RUN_SUSPEND_KEY,
      slots: options.slots,
      suspend: options.suspend,
      fillerBytes: options.fillerBytes ?? 0,
    },
  );
}

async function openGame(page: Page, query = QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function waitForSavedWave(page: Page, wave: number): Promise<SavedSuspend> {
  await page.waitForFunction(
    ([key, wanted]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        return (JSON.parse(raw) as { wave?: number }).wave === wanted;
      } catch {
        return false;
      }
    },
    [RUN_SUSPEND_KEY, wave] as const,
    { timeout: 12_000 },
  );
  return JSON.parse((await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY))!) as SavedSuspend;
}

async function readAutoRaw(page: Page): Promise<string> {
  return (await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)) ?? '';
}

async function readSlots(page: Page, profileId = 'robin'): Promise<SaveSlotsEnvelope> {
  return page.evaluate(
    ([profileKey, slotsKey, id]) => JSON.parse(localStorage.getItem(`${profileKey}.${id}.${slotsKey}`) ?? '{"v":1,"manual":[]}'),
    [PROFILE_KEY, SAVE_SLOTS_KEY, profileId] as const,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThanOrEqual(amount);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function comparable(snapshot: SavedSuspend): unknown {
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    wave: snapshot.wave,
    waveSpawnedTotal: snapshot.waveSystem.waveSpawnedTotal,
    enemiesAlive: snapshot.enemies.active.length,
    economy: { gold: snapshot.economy.gold, logLength: snapshot.economy.log.length },
    hero: { hp: snapshot.hero.hp, x: round(snapshot.hero.position.x), z: round(snapshot.hero.position.z) },
    progression: { level: snapshot.hero.level, xpInto: snapshot.hero.xpInto, stacks: snapshot.hero.stacks },
    buildHp: snapshot.buildings.map((entry) => ({
      id: entry.id,
      tier: entry.tier,
      hp: entry.hp,
      maxHp: entry.maxHp,
      wrecked: entry.wrecked,
      x: round(entry.position.x),
      z: round(entry.position.z),
    })),
  };
}

async function restoredComparable(page: Page, raw: string): Promise<unknown> {
  await page.goto('/');
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [RUN_SUSPEND_KEY, raw] as const);
  await page.goto(`/${RESTORE_QUERY}`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  return comparable(JSON.parse(await readAutoRaw(page)) as SavedSuspend);
}

test('manual save creates a curated slot, preserves auto, and loads through the suspend restore path', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await seedProfile(page);
  const errors = await openGame(page);
  await grantGold(page, 90);
  const saved = await waitForSavedWave(page, 1);

  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  await page.getByTestId('manual-save-card').locator('summary').click();
  await page.getByTestId('manual-save-name').fill(AUTO_SAVE_SLOT_NAME);
  await page.getByTestId('manual-save-confirm').click();
  await expect(page.getByTestId('manual-save-message')).toContainText('reserved for automatic saves');
  const autoAfterRejectedName = JSON.parse(await readAutoRaw(page)) as SavedSuspend;
  expect(autoAfterRejectedName).toMatchObject({ contractId: 'the-claim' });
  expect(autoAfterRejectedName.wave).toBeGreaterThanOrEqual(saved.wave);
  expect((await readSlots(page)).manual).toHaveLength(0);

  await page.getByTestId('manual-save-name').fill('Quartz Run');
  await page.getByTestId('manual-save-confirm').click();
  await expect(page.getByTestId('manual-save-message')).toContainText("Saved: Quartz Run — as of wave 1's end.");
  await shot(page, testInfo, 'save-card');
  const autoAfterManualSave = JSON.parse(await readAutoRaw(page)) as SavedSuspend;
  expect(autoAfterManualSave).toMatchObject({ contractId: 'the-claim' });
  expect(autoAfterManualSave.wave).toBeGreaterThanOrEqual(saved.wave);

  const slots = await readSlots(page);
  expect(slots.manual).toHaveLength(1);
  expect(slots.manual[0]).toMatchObject({
    name: 'Quartz Run',
    wave: saved.wave,
    contractId: 'the-claim',
    contractName: 'The Claim',
    townName: 'Quartz Hill',
  });
  expect(slots.manual[0]!.snapshotSizeBytes).toBeGreaterThan(200);

  const slotRaw = JSON.stringify(slots.manual[0]!.snapshot);
  const direct = await restoredComparable(page, slotRaw);
  await page.goto('/');
  await page.evaluate(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [RUN_SUSPEND_KEY, suspendFixture(9)] as const);
  await page.reload();
  await page.getByTestId('start-menu-load-claim').click();
  await expect(page.getByTestId('save-slot-card')).toContainText('Quartz Run');
  await expect(page.getByTestId('save-slot-meta')).toContainText('Wave 1 · The Claim · Quartz Hill');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Load Quartz Run');
    expect(dialog.message()).toContain(AUTO_SAVE_SLOT_NAME);
    expect(dialog.message()).toContain('wave 9');
    await dialog.accept();
  });
  await page.evaluate((query) => history.replaceState(null, '', query), RESTORE_QUERY);
  await page.getByTestId('save-slot-load').click();
  await page.waitForFunction((wave) => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave, saved.wave);
  const loaded = comparable(JSON.parse(await readAutoRaw(page)) as SavedSuspend);
  expect(loaded).toEqual(direct);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('load screen renames, deletes, and carries slots through Pack/Unpack', async ({ page }, testInfo) => {
  await seedProfile(page, { slots: slotsEnvelope(['North Fork', 'Baron Trophy', 'Kids Claim']) });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-load-claim').click();
  await expect(page.getByTestId('save-slot-card')).toHaveCount(3);
  await shot(page, testInfo, 'load-screen-3-slots');

  await page.getByTestId('save-slot-rename-input').first().fill('Renamed Claim');
  await page.getByTestId('save-slot-rename').first().click();
  await expect(page.getByTestId('load-claim-message')).toContainText('Renamed: Renamed Claim.');
  await expect(page.getByTestId('save-slot-name').first()).toHaveText('Renamed Claim');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Delete');
    await dialog.accept();
  });
  await page.getByTestId('save-slot-delete').nth(1).click();
  await expect(page.getByTestId('save-slot-card')).toHaveCount(2);
  expect((await readSlots(page)).manual.map((slot) => slot.name)).toEqual(['Renamed Claim', 'Kids Claim']);

  await page.getByTestId('start-menu-profile').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('profile-export').click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const packed = JSON.parse(await readFile(path!, 'utf8'));
  expect(packed.data[SAVE_SLOTS_KEY].manual.map((slot: SaveSlot) => slot.name)).toEqual(['Renamed Claim', 'Kids Claim']);

  await page.getByTestId('profile-import-file').setInputFiles(path!);
  await page.getByTestId('profile-import-apply').click();
  const imported = await page.evaluate(
    ([profileKey, slotsKey]) => {
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as { profiles: Array<{ id: string; name: string }> };
      const profile = state.profiles.find((entry) => entry.name === 'Robin (2)')!;
      return JSON.parse(localStorage.getItem(`${profileKey}.${profile.id}.${slotsKey}`) ?? '{"manual":[]}') as SaveSlotsEnvelope;
    },
    [PROFILE_KEY, SAVE_SLOTS_KEY] as const,
  );
  expect(imported.manual.map((slot) => slot.name)).toEqual(['Renamed Claim', 'Kids Claim']);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('corrupt manual save store is preserved for recovery and does not block re-import', async ({ page }) => {
  const raw = JSON.stringify({ v: 99, manual: [{ id: 'future-slot', payload: 'newer build' }] });
  await page.addInitScript(
    ({ profileKey, townKey, slotsKey, raw }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
      localStorage.setItem(`${profileKey}.robin.${slotsKey}`, raw);
    },
    { profileKey: PROFILE_KEY, townKey: TOWN_NAME_KEY, slotsKey: SAVE_SLOTS_KEY, raw },
  );
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('start-menu-rejected-claim')).toContainText(RUN_SUSPEND_REJECTION_LINE);
  const preserved = await page.evaluate(
    ([profileKey, slotsKey, recoveryKey]) => ({
      original: localStorage.getItem(`${profileKey}.robin.${slotsKey}`),
      recovery: localStorage.getItem(recoveryKey),
    }),
    [PROFILE_KEY, SAVE_SLOTS_KEY, SAVE_SLOTS_RECOVERY_KEY] as const,
  );
  expect(preserved).toEqual({ original: raw, recovery: raw });

  await page.getByTestId('start-menu-profile').click();
  const transfer = await page.evaluate(
    async ({ profileKey, slotsKey, slot }) => {
      const module = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as any;
      const result = module.restoreProfileBundle(localStorage, {
        kind: 'goldrush.profile.ledger',
        version: 1,
        exportedAt: '2026-07-10T00:00:00.000Z',
        profile: { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
        data: { [slotsKey]: { v: 1, manual: [slot] } },
      });
      return {
        result,
        slots: JSON.parse(localStorage.getItem(`${profileKey}.robin.${slotsKey}`) ?? '{"manual":[]}'),
      };
    },
    { profileKey: PROFILE_KEY, slotsKey: SAVE_SLOTS_KEY, slot: slotFixture('Recovered Claim', 4, Date.now()) },
  );
  expect(transfer.result).toMatchObject({ ok: true });
  expect(transfer.slots.manual.map((slot: SaveSlot) => slot.name)).toEqual(['Recovered Claim']);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('one malformed manual slot does not hide the valid shelf', async ({ page }) => {
  const valid = slotFixture('Good Claim', 4, Date.now());
  const slots = { v: 1, manual: [valid, { ...valid, id: 'broken-slot', snapshot: { v: 99 } }] } as unknown as SaveSlotsEnvelope;
  const original = JSON.stringify(slots);
  await seedProfile(page, { slots });
  const errors = collectErrors(page);
  await page.goto('/');

  const normalized = await page.evaluate(async () => {
    const saves = (await Function('return import("/src/game/SaveSlots.ts")')()) as typeof import('../src/game/SaveSlots');
    return saves.readSaveSlots();
  });
  expect(normalized.manual.map((slot) => slot.name)).toEqual(['Good Claim']);
  expect((await readSlots(page)).manual.map((slot) => slot.name)).toEqual(['Good Claim']);
  await expect(page.evaluate((recoveryKey) => localStorage.getItem(recoveryKey), SAVE_SLOTS_RECOVERY_KEY)).resolves.toBe(original);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('profile export warns when older manual claims will stay on this device', async ({ page }) => {
  await seedProfile(page, { slots: slotsEnvelope(Array.from({ length: 6 }, (_, index) => `Slot ${index + 1}`)) });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  await expect(page.getByTestId('profile-transfer-cap-note')).toContainText('oldest slots stay on this device');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('12-slot cap and storage warning show on the 390px save flow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedProfile(page, { slots: slotsEnvelope(Array.from({ length: 12 }, (_, index) => `Slot ${index + 1}`)), suspend: suspendFixture(5) });
  const errors = await openGame(page, RESTORE_QUERY);

  await page.keyboard.press('KeyP');
  await page.getByTestId('manual-save-card').locator('summary').click();
  await page.getByTestId('manual-save-name').fill('Thirteen');
  await page.getByTestId('manual-save-confirm').click();
  await expect(page.getByTestId('manual-save-message')).toContainText('Twelve claims are pinned');

  await page.evaluate(
    ([profileKey, slotsKey]) => {
      localStorage.setItem(`${profileKey}.robin.${slotsKey}`, JSON.stringify({ v: 1, manual: [] }));
      localStorage.setItem('gr.test.filler', 'x'.repeat(4_250_000));
    },
    [PROFILE_KEY, SAVE_SLOTS_KEY] as const,
  );
  await page.getByTestId('manual-save-name').fill('Warning Claim');
  await page.getByTestId('manual-save-confirm').click();
  await expect(page.getByTestId('manual-save-message')).toContainText('Ledger shelf is');
  await shot(page, testInfo, 'save-card-390px');
  expect((await readSlots(page)).manual).toHaveLength(1);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function slotsEnvelope(names: string[]): SaveSlotsEnvelope {
  const now = Date.now();
  return {
    v: 1,
    manual: names.map((name, index) => slotFixture(name, index + 1, now - index * 60_000)),
  };
}

function slotFixture(name: string, wave: number, timestamp: number): SaveSlot {
  const snapshot = suspendFixture(wave) as SaveSlot['snapshot'];
  return {
    id: `slot-${wave}`,
    name,
    wave,
    contractId: 'the-claim',
    contractName: 'The Claim',
    townName: 'Quartz Hill',
    timestamp,
    snapshotSizeBytes: JSON.stringify(snapshot).length,
    snapshot,
  };
}

function suspendFixture(wave: number): unknown {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    v: 1,
    wave,
    timeAlive: wave * Balance.waves.waveInterval,
    writtenAt: Date.now(),
    lastWriteMs: 0,
    sizeBytes: 1,
    trigger: 'wave-boundary',
    copy: `The claim resumes at wave ${wave}. The ledger kept your place; trail work after that boundary is replayed.`,
    contractId: 'the-claim',
    seed: 'save-slots',
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave,
      pulse: 0,
      edge: null,
      budget: 0,
      waveSpawnedTotal: 0,
      nextTrickleAt: Balance.waves.graceSeconds + Balance.waves.trickleInterval,
      nextWaveAt: (wave + 1) * Balance.waves.waveInterval,
      nextPlanWaveAt: (wave + 1) * Balance.waves.waveInterval,
      nextPlanWave: wave + 1,
      plannedPulses: [],
      copyCursor: 0,
      lastCopy: '',
      currentAtSim: wave * Balance.waves.waveInterval,
      waveState: 'quiet',
      lastPulseAt: Number.NEGATIVE_INFINITY,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: {
      gold: 0,
      bankCap: Balance.economy.bankCap,
      resources: {},
      log: [],
      summary: {
        panned: 0,
        sluiced: 0,
        granted: 0,
        stolen: 0,
        reclaimed: 0,
        pannedByProspector: 0,
        sluicedByProspector: 0,
        reclaimedByProspector: 0,
        spent: 0,
        baseValue: 0,
        buildingsBuilt: 0,
        beaconsBuilt: 0,
        repairSpent: 0,
        repairs: 0,
      },
    },
    hero: {
      level: 1,
      xpTotal: 0,
      spentXp: 0,
      xpInto: 0,
      pendingLevels: 0,
      offer: null,
      stacks: {},
      hp: Balance.hero.maxHp,
      maxHp: Balance.hero.maxHp,
      position: { x: 0, y: 0.06, z: 12 },
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
