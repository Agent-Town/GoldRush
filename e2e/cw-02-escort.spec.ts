import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = 'artifacts/cw-02-escort';
const PYLONS = [
  [-12, -36], [-24, -20], [-28, 8],
  [12, -36], [24, -20], [28, 8],
] as const;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

async function seedVoltageTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ profileKey, townKey, epochKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(epochKey, 'epoch-3-voltage');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
  });
  await page.reload();
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 56; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null)) === 'tavern') return;
    const target = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.buildings.find((entry) => entry.id === 'tavern')?.approach ?? { x: 0, z: 0 });
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.55) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.55) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(150);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null), { timeout: 2_000 }).toBe('tavern');
}

async function goToContractPage(page: Page, id: string): Promise<void> {
  const chapter = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === id));
  if (!chapter) throw new Error(`Missing chapter for ${id}`);
  await page.getByTestId(`contract-chapter-tab-${chapter.id}`).click();
  await expect(page.getByTestId(`contract-card-${id}`)).toBeVisible();
}

test('board-selected Canyon escort delivers one capacitor crate through a repaired brown-out', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedVoltageTown(page);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 24);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  // Chapter tabs since 6822607f; chapter derived from the manifest so no literal can freeze again.
  await goToContractPage(page, 'e3-canyon-works');
  await expect(page.getByTestId('contract-launch-e3-canyon-works')).toHaveAttribute('data-contract-mode', 'escort');
  await page.evaluate(() => history.replaceState(null, '', '/?debug&nowaves&nolevel&nopause&seed=cw-02'));
  await page.getByTestId('contract-launch-e3-canyon-works').click();

  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e3-canyon-works'
    && window.__THREE_GAME_DIAGNOSTICS__?.tram?.active === true);
  expect(new URL(page.url()).searchParams.get('mode')).toBe('escort');
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const storyBeat = page.getByTestId('story-beat-card');
  if (await storyBeat.isVisible()) await storyBeat.dispatchEvent('pointerdown');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));

  const boot = await page.evaluate(() => {
    const contract = window.__GR_TEST__!.activeContract();
    return {
      mode: contract.modes?.[0],
      tram: window.__THREE_GAME_DIAGNOSTICS__!.tram,
      oreCart: window.__THREE_GAME_DIAGNOSTICS__!.escort,
      saboteur: contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur'),
      tramFeed: contract.twist.powerGrid?.wires.find((wire) => wire.a === 'tram-motor' || wire.b === 'tram-motor'),
    };
  });
  expect(boot.mode).toMatchObject({ id: 'escort', vehicle: 'tram', reverseRoute: true, cartsRequired: 1, railRouteIndex: 1 });
  expect(boot.tram).toMatchObject({ state: 'unpowered', x: -12, z: -36, cargo: [{ id: 'capacitor-crate', occupied: true }], delivery: { complete: false, required: 1, payout: 60 } });
  expect(boot.oreCart).toEqual({ enabled: false });
  expect(boot.saboteur).toMatchObject({ wrecker: true });
  expect(boot.saboteur?.spawnGates).toEqual(expect.arrayContaining([{ edge: 'west', x: -46, z: 38 }]));
  expect(boot.tramFeed).toEqual({ a: 'pylon-west-rim', b: 'tram-motor' });

  expect(await page.evaluate((sites) => {
    window.__GR_TEST__!.grantGold(1_000);
    return sites.map(([x, z]) => window.__GR_TEST__!.placeFree('sentry_beacon', x, z));
  }, PYLONS)).toEqual([true, true, true, true, true, true]);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  const moving = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect(moving).toMatchObject({ state: 'moving', powered: true });
  expect(moving.distanceTravelled).toBeGreaterThan(5);

  const sabotage = await page.evaluate(() => {
    window.__GR_TEST__!.setBalance('enemy.speed', 8);
    window.__GR_TEST__!.setBalance('sparkRig.damage', 0);
    window.__GR_TEST__!.setBalance('beacon.damage', 0);
    window.__GR_TEST__!.setBalance('turret.damage', 0);
    window.__GR_TEST__!.setBalance('wreck.damage', 1);
    window.__GR_TEST__!.setBalance('wreck.hitCooldown', 999);
    window.__GR_TEST__!.teleport(-24, 32);
    const spawned = window.__GR_TEST__!.spawnWrecker('west');
    window.__GR_TEST__!.advanceSim(8);
    const hp = window.__THREE_GAME_DIAGNOSTICS__!.build.hp;
    return {
      spawned,
      rim: hp.find((entry) => entry.id === 'sentry_beacon' && entry.index === 2),
      lanterns: hp.filter((entry) => entry.id === 'lantern_post'),
    };
  });
  expect(sabotage.spawned).toBe(true);
  expect(sabotage.rim?.hp).toBe((sabotage.rim?.maxHp ?? 0) - 1);
  expect(sabotage.lanterns.every((entry) => entry.hp === entry.maxHp)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.clearEnemies());

  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 2))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  const dark = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram!);
  expect(dark).toMatchObject({ state: 'unpowered', powered: false, delivery: { complete: false } });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  expect(await page.evaluate(() => {
    const tram = window.__THREE_GAME_DIAGNOSTICS__!.tram!;
    return { x: tram.x, z: tram.z, distanceTravelled: tram.distanceTravelled };
  })).toEqual({ x: dark.x, z: dark.z, distanceTravelled: dark.distanceTravelled });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), dark);
  await page.waitForTimeout(150);
  await shot(page, testInfo, 'brown-out-halt');

  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-28, 8);
    window.__GR_TEST__!.repair('sentry_beacon', 2);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  const resumed = await page.evaluate(() => ({
    tram: window.__THREE_GAME_DIAGNOSTICS__!.tram!,
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.banked,
  }));
  expect(resumed.tram).toMatchObject({ state: 'moving', powered: true });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  const delivered = await page.evaluate(() => ({
    tram: window.__THREE_GAME_DIAGNOSTICS__!.tram!,
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.banked,
    event: window.__GR_TEST__!.economyLog().at(-1),
  }));
  expect(delivered.tram).toMatchObject({ state: 'arrived', x: -46, z: 44, delivery: { complete: true, delivered: 1, required: 1, payout: 60 } });
  expect(delivered.gold).toBe(resumed.gold + 60);
  expect(delivered.event).toMatchObject({ type: 'gold_granted', source: 'escort', amount: 60 });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), delivered.tram);
  await page.waitForTimeout(150);
  await shot(page, testInfo, 'crate-delivered');
  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 2))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tram)).toMatchObject({ state: 'arrived', powered: false, trips: 1 });
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-28, 8);
    window.__GR_TEST__!.repair('sentry_beacon', 2);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  expect(await page.evaluate(() => ({
    tram: window.__THREE_GAME_DIAGNOSTICS__!.tram,
    payouts: window.__GR_TEST__!.economyLog().filter((event) => {
      const entry = event as { type?: string; source?: string };
      return entry.type === 'gold_granted' && entry.source === 'escort';
    }).length,
  }))).toMatchObject({ tram: { state: 'arrived', powered: true, trips: 1 }, payouts: 1 });
  expect(errors).toEqual([]);
});
